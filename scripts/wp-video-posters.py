#!/usr/bin/env python3
"""
Pósters de los videos de WordPress a partir de su primer fotograma.
===============================================================================
WordPress no lleva ffmpeg, así que un video subido a la mediateca no genera
ninguna miniatura: la galería del front acababa enseñando la portada del
proyecto en todos sus videos.

Este script recorre los videos de las galerías (proyectos e IPs), saca un
fotograma de cada uno, lo sube a la mediateca y lo deja adjunto al propio video.
El plugin `forja-headless` lo expone entonces como `poster` del item de galería
(ver wordpress/forja-headless/inc/graphql.php) y el front lo sirve como
miniatura, en WebP y en el tamaño que toque.

No descarga los videos: ffmpeg lee el índice por rangos HTTP y baja solo lo
necesario para decodificar el fotograma — un par de MB incluso en archivos de
200 MB, siempre que estén guardados con fast start.

Uso
---
    python3 scripts/wp-video-posters.py             # genera lo que falte
    python3 scripts/wp-video-posters.py --dry-run   # solo dice qué haría
    python3 scripts/wp-video-posters.py --limit 5   # los 5 primeros
    python3 scripts/wp-video-posters.py --force     # rehace los que ya tienen

Es idempotente: por defecto salta los videos que ya tienen póster.

Requisitos
----------
- `ffmpeg` en el PATH (brew install ffmpeg).
- En `.env.local`: `WP_GRAPHQL_URL`, `NEXT_PUBLIC_WP_URL`, `WORDPRESS_USER`
  (usuario o email de WP) y `WORDPRESS_KEY` (application password del usuario:
  Usuarios → Perfil → Contraseñas de aplicación).
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env.local"

# Ancho máximo del póster. El front nunca lo sirve por encima de esto y
# WordPress genera desde aquí sus variantes (245w, 768w, 1024w…) en WebP.
POSTER_WIDTH = 1600

# Cuántos fotogramas mira el filtro `thumbnail` de ffmpeg para elegir el más
# representativo. 250 ≈ los primeros 10 s: suficiente para pasar de largo
# fundidos y cartelas sin alejarse del arranque del video.
THUMBNAIL_WINDOW = 250

# Un fotograma casi liso (cartela en blanco, negro, un fundido) no sirve de
# miniatura. Se mide la desviación típica de la luminancia sobre una versión de
# 32x32: por debajo de este valor se considera que no hay imagen y se busca otro
# fotograma más adelante.
FLAT_STDDEV = 12
RETRY_AT = 0.25  # fracción de la duración donde reintentar


# ── Utilidades ───────────────────────────────────────────────────────────────


def load_env() -> dict[str, str]:
    if not ENV_FILE.exists():
        sys.exit(f"No encuentro {ENV_FILE}. Copia .env.example y rellena las claves.")
    env: dict[str, str] = {}
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def wp_request(env: dict[str, str], path: str, *, data=None, headers=None, method=None):
    """Llamada autenticada a la REST API de WordPress."""
    user = env.get("WORDPRESS_USER")
    key = env.get("WORDPRESS_KEY")
    if not user or not key:
        sys.exit("Faltan WORDPRESS_USER / WORDPRESS_KEY en .env.local.")
    base = env.get("NEXT_PUBLIC_WP_URL", "").rstrip("/")
    token = base64.b64encode(f"{user}:{key}".encode()).decode()
    req = urllib.request.Request(
        f"{base}/wp-json{path}",
        data=data,
        method=method,
        headers={"Authorization": f"Basic {token}", **(headers or {})},
    )
    with urllib.request.urlopen(req, timeout=300) as res:
        return json.load(res)


def graphql(env: dict[str, str], query: str):
    url = env.get("WP_GRAPHQL_URL")
    if not url:
        sys.exit("Falta WP_GRAPHQL_URL en .env.local.")
    req = urllib.request.Request(
        url,
        data=json.dumps({"query": query}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as res:
        payload = json.load(res)
    if payload.get("errors"):
        sys.exit(f"GraphQL devolvió errores: {payload['errors']}")
    return payload["data"]


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


# ── Fotograma ────────────────────────────────────────────────────────────────


def contrast(path: Path) -> float:
    """
    Cuánta imagen hay: desviación típica de la luminancia sobre 32x32 píxeles.
    Un fotograma liso (blanco, negro, un fundido) queda cerca de 0.
    """
    proc = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-vf", "scale=32:32",
         "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        capture_output=True,
    )
    px = proc.stdout
    if not px:
        return 0.0
    mean = sum(px) / len(px)
    return (sum((p - mean) ** 2 for p in px) / len(px)) ** 0.5


def duration(video_url: str) -> float:
    proc = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", video_url])
    try:
        return float(proc.stdout.strip())
    except ValueError:
        return 0.0


def extract(video_url: str, out: Path, *, seek: float = 0.0, first_frame: bool = False) -> bool:
    """Escribe un fotograma en `out`. Devuelve si ffmpeg lo consiguió."""
    scale = f"scale='min({POSTER_WIDTH},iw)':-2"
    # `thumbnail` puntúa los fotogramas del lote por lo distinto que es su
    # histograma del promedio y se queda con el más representativo.
    vf = scale if first_frame else f"thumbnail={THUMBNAIL_WINDOW},{scale}"
    cmd = ["ffmpeg", "-y", "-v", "error"]
    if seek:
        cmd += ["-ss", f"{seek:.2f}"]
    cmd += ["-i", video_url, "-vf", vf, "-frames:v", "1", "-q:v", "4", str(out)]
    return run(cmd).returncode == 0 and out.exists()


def grab_frame(video_url: str, out: Path, *, first_frame: bool = False) -> str | None:
    """
    Saca el fotograma de portada del video. Devuelve de dónde salió, o None si
    ffmpeg no pudo con el archivo.

    El fotograma 0 pelado casi nunca sirve —los clips arrancan en negro, en
    blanco o con una cartela—, así que por defecto se elige el más
    representativo de los primeros ~10 s. Con `first_frame` se coge el 0 tal
    cual, y si sale liso se cae igualmente al representativo.
    """
    if not extract(video_url, out, first_frame=first_frame):
        return None
    how = "primero" if first_frame else "inicio"
    if contrast(out) >= FLAT_STDDEV:
        return how

    # Salió liso (fundido o cartela). Segundo intento: el fotograma
    # representativo del inicio y, si tampoco, ya dentro del video.
    for seek, label in ((0.0, "inicio"), (duration(video_url) * RETRY_AT, f"{int(RETRY_AT * 100)}%")):
        if label == how:
            continue
        alt = out.with_name(out.stem + "-alt.jpg")
        if extract(video_url, alt, seek=seek) and contrast(alt) > contrast(out):
            alt.replace(out)
            how = label
            if contrast(out) >= FLAT_STDDEV:
                break
    return how


# ── WordPress ────────────────────────────────────────────────────────────────


def gallery_videos(env: dict[str, str]) -> list[dict]:
    """Videos de las galerías de proyectos e IPs, con su póster actual."""
    data = graphql(env, """
        query { proyectos(first: 100) { nodes { slug galeria { sourceUrl mimeType poster } } }
                ips(first: 50) { nodes { slug galeria { sourceUrl mimeType poster } } } }
    """)
    out, seen = [], set()
    for group in ("proyectos", "ips"):
        for node in data[group]["nodes"]:
            for item in node.get("galeria") or []:
                url = item.get("sourceUrl")
                if not url or not (item.get("mimeType") or "").startswith("video/"):
                    continue
                if url in seen:
                    continue
                seen.add(url)
                out.append({"url": url, "poster": item.get("poster"), "owner": node["slug"]})
    return out


def media_index(env: dict[str, str]) -> dict[str, int]:
    """URL de archivo → ID de adjunto, para todos los videos de la mediateca."""
    index, page = {}, 1
    while True:
        try:
            batch = wp_request(
                env, f"/wp/v2/media?media_type=video&per_page=100&page={page}&_fields=id,source_url"
            )
        except urllib.error.HTTPError as err:
            if err.code == 400:  # página fuera de rango: se acabaron
                break
            raise
        if not batch:
            break
        for item in batch:
            index[item["source_url"]] = item["id"]
        page += 1
    return index


def upload_poster(env: dict[str, str], jpg: Path, filename: str, video_id: int) -> dict:
    """
    Sube el póster y lo asigna como imagen destacada del adjunto de video, que
    es de donde el plugin saca el `poster` de la galería.

    Que un adjunto acepte imagen destacada lo habilita el plugin
    (`add_post_type_support('attachment', 'thumbnail')` en
    inc/media-optimization.php). Con un plugin anterior, WordPress ignora
    `featured_media` en silencio y el póster se queda sin vincular — por eso
    después se comprueba.
    """
    created = wp_request(
        env,
        "/wp/v2/media",
        data=jpg.read_bytes(),
        method="POST",
        headers={
            "Content-Type": mimetypes.guess_type(filename)[0] or "image/jpeg",
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
    linked = wp_request(
        env,
        f"/wp/v2/media/{video_id}",
        data=json.dumps({"featured_media": created["id"]}).encode(),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    if linked.get("featured_media") != created["id"]:
        raise RuntimeError(
            "WordPress no guardó la imagen destacada del video: actualiza el plugin "
            "forja-headless (wordpress/forja-headless.zip) y vuelve a lanzarlo."
        )
    return created


# ── Main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="no sube nada, solo informa")
    parser.add_argument("--force", action="store_true", help="rehace también los que ya tienen póster")
    parser.add_argument("--limit", type=int, default=0, help="procesa como mucho N videos")
    parser.add_argument(
        "--first-frame",
        action="store_true",
        help="usa el fotograma 0 en vez del más representativo del arranque",
    )
    args = parser.parse_args()

    if run(["ffmpeg", "-version"]).returncode != 0:
        sys.exit("ffmpeg no está en el PATH (brew install ffmpeg).")

    env = load_env()
    videos = gallery_videos(env)
    pending = [v for v in videos if args.force or not v["poster"]]
    if args.limit:
        pending = pending[: args.limit]

    print(f"{len(videos)} videos en galerías · {len(pending)} sin póster")
    if not pending:
        return
    if args.dry_run:
        for v in pending:
            print(f"  [dry-run] {v['owner']:<24} {v['url'].split('/')[-1]}")
        return

    index = media_index(env)
    done = failed = 0
    with tempfile.TemporaryDirectory() as tmp:
        for i, video in enumerate(pending, 1):
            name = video["url"].split("/")[-1]
            stem = re.sub(r"\.[^.]+$", "", name)
            attachment_id = index.get(video["url"])
            if not attachment_id:
                print(f"  [{i}/{len(pending)}] {name}: no está en la mediateca, lo salto")
                failed += 1
                continue

            jpg = Path(tmp) / f"{stem}-poster.jpg"
            how = grab_frame(video["url"], jpg, first_frame=args.first_frame)
            if not how:
                print(f"  [{i}/{len(pending)}] {name}: ffmpeg no pudo leer el video")
                failed += 1
                continue

            try:
                created = upload_poster(env, jpg, f"{stem}-poster.jpg", attachment_id)
            except urllib.error.HTTPError as err:
                print(f"  [{i}/{len(pending)}] {name}: error al subir ({err.code}) {err.read()[:200]!r}")
                failed += 1
                continue
            except RuntimeError as err:
                sys.exit(f"  [{i}/{len(pending)}] {name}: {err}")

            print(
                f"  [{i}/{len(pending)}] {name} → #{created['id']} "
                f"({jpg.stat().st_size // 1024} KB, fotograma {how})"
            )
            done += 1

    print(f"\nPósters creados: {done} · fallos: {failed}")
    if done:
        print("Guarda cualquier proyecto en WordPress (o llama a /api/revalidate) "
              "para que el front recoja los cambios.")


if __name__ == "__main__":
    main()
