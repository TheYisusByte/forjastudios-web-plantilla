"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { resolveWpVariant, toSameOriginMedia } from "@/lib/wp/media";

/**
 * Carta holográfica 3D para una IP:
 *  - Frente: portada como textura + shader iridiscente (fresnel + hover).
 *  - Dorso: fondo oscuro holográfico + logo de Forja centrado.
 *  - Rotación libre al arrastrar (OrbitControls, azimuth sin límite → flip completo).
 *  - El holográfico reacciona al ÁNGULO de vista y a la POSICIÓN del mouse (hover).
 * Fondo transparente (sin bloom) para que flote sin recuadro. Solo en desktop.
 */

const FORJA_LOGO = "/assets/forja/images/f40ce8_54c70335883e4115ab035396d8db0215~mv2.png";
const LOGO_ASPECT = 420 / 155; // dimensiones reales del crest

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vEye;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vEye = normalize(mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform float uHasTex;
  uniform sampler2D uLogo;
  uniform float uHasLogo;
  uniform float uIsBack;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vEye;

  vec3 irid(float t){
    return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
  }
  // SDF de rectángulo redondeado (negativo dentro, 0 en el borde).
  float roundedSDF(vec2 uv, float r){
    vec2 p = abs(uv - 0.5) - (0.5 - r);
    return length(max(p, vec2(0.0))) + min(max(p.x, p.y), 0.0) - r;
  }

  void main(){
    float sdf = roundedSDF(vUv, 0.055);
    float alpha = 1.0 - smoothstep(0.0, 0.006, sdf);
    if (alpha < 0.01) discard;

    float fres = pow(clamp(1.0 + dot(vEye, vNormal), 0.0, 1.0), 2.2);

    vec3 col;
    if (uIsBack < 0.5) {
      // ── FRENTE: portada + holográfico (ángulo de vista + hover) ──
      float t = vUv.x * 0.6 - vUv.y * 0.4 + fres * 0.85
              + (uMouse.x - 0.5) * 0.7 + (uMouse.y - 0.5) * 0.4;
      vec3 holo = irid(t);
      vec3 base = uHasTex > 0.5 ? texture2D(uTex, vUv).rgb : vec3(0.06, 0.06, 0.07);

      // Patrón de foil: bandas diagonales finas (textura de carta física),
      // teñidas por el iridiscente y realzadas en ángulo rasante.
      float diag = fract((vUv.x - vUv.y) * 48.0);
      float foilLine = smoothstep(0.0, 0.5, diag) - smoothstep(0.5, 1.0, diag);
      vec3 foil = holo * foilLine * (0.06 + fres * 0.22);

      // Holográfico más tenue → se ve más la portada; el patrón aporta la textura.
      col = base + holo * fres * 0.5 + holo * 0.08 + foil;
    } else {
      // ── DORSO: fondo oscuro (SIN holográfico) + marco blanco + logo ──
      col = vec3(0.05, 0.05, 0.055);
      // Marco blanco cerca del borde (sigue las esquinas redondeadas).
      float dist = -sdf; // distancia hacia adentro desde el borde
      float fi = 0.03, ft = 0.018;
      float frame = smoothstep(fi, fi + 0.003, dist) - smoothstep(fi + ft, fi + ft + 0.003, dist);
      col = mix(col, vec3(1.0), clamp(frame, 0.0, 1.0));
      // Logo centrado, orientación correcta (sin espejo).
      if (uHasLogo > 0.5) {
        float logoW = 0.62;
        float logoH = logoW * (3.0 / 4.0) / ${LOGO_ASPECT.toFixed(4)}; // aspecto del logo
        vec2 lc = (vUv - 0.5) / vec2(logoW, logoH) + 0.5;
        if (lc.x >= 0.0 && lc.x <= 1.0 && lc.y >= 0.0 && lc.y <= 1.0) {
          vec4 lg = texture2D(uLogo, lc);
          col = mix(col, lg.rgb, lg.a);
        }
      }
    }
    gl_FragColor = vec4(col, alpha);
  }
`;

/** Ancho de la textura de la carta. La carta se pinta a 360 CSS px. */
const TEXTURE_WIDTH = 828;

/**
 * URL de textura lista para WebGL: la variante de WordPress del tamaño que toca,
 * servida same-origin por el proxy `/wp-media/` (WordPress no manda CORS y una
 * textura cross-origin sin CORS contamina el canvas). Antes esto pasaba por
 * `/_next/image`, que consumía cuota de optimización de Vercel y dejaba la carta
 * en negro cuando esa cuota se agotaba.
 */
function textureUrl(src: string): string {
  if (!src) return src;
  return toSameOriginMedia(resolveWpVariant(src, TEXTURE_WIDTH));
}

export default function IPCardWebGL({
  imageUrl,
  name,
}: {
  imageUrl: string;
  name: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let w = mount.clientWidth || 1;
    let h = mount.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";

    // uMouse compartido por ambas caras (frente/dorso).
    const uMouse = { value: new THREE.Vector2(0.5, 0.5) };
    const mkUniforms = (isBack: number) => ({
      uTex: { value: null as THREE.Texture | null },
      uHasTex: { value: 0 },
      uLogo: { value: null as THREE.Texture | null },
      uHasLogo: { value: 0 },
      uIsBack: { value: isBack },
      uMouse,
    });
    const frontU = mkUniforms(0);
    const backU = mkUniforms(1);

    const mkMat = (u: ReturnType<typeof mkUniforms>) =>
      new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        side: THREE.FrontSide,
      });

    const geo = new THREE.PlaneGeometry(3, 4, 1, 1);
    const front = new THREE.Mesh(geo, mkMat(frontU));
    const back = new THREE.Mesh(geo, mkMat(backU));
    back.rotation.y = Math.PI; // mira hacia -z (se ve al girar la carta)
    scene.add(front, back);

    const loader = new THREE.TextureLoader();
    // Portada (frente) — same-origin vía el proxy /wp-media/.
    loader.load(textureUrl(imageUrl), (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      frontU.uTex.value = tex;
      frontU.uHasTex.value = 1;
    });
    // Logo de Forja (dorso) — asset local same-origin.
    loader.load(FORJA_LOGO, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      backU.uLogo.value = tex;
      backU.uHasLogo.value = 1;
    });

    // Holográfico reactivo al hover: la posición del mouse alimenta uMouse.
    const onMove = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      uMouse.value.set(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height,
      );
    };
    renderer.domElement.addEventListener("pointermove", onMove);

    // Controles: rotar arrastrando, azimuth LIBRE (vuelta completa), polar limitado.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.minPolarAngle = Math.PI / 2 - 0.6;
    controls.maxPolarAngle = Math.PI / 2 + 0.6;
    controls.addEventListener("start", () => { renderer.domElement.style.cursor = "grabbing"; });
    controls.addEventListener("end", () => { renderer.domElement.style.cursor = "grab"; });

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      w = mount.clientWidth || 1;
      h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      controls.dispose();
      front.material.dispose();
      back.material.dispose();
      geo.dispose();
      frontU.uTex.value?.dispose();
      backU.uLogo.value?.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [imageUrl]);

  return <div ref={mountRef} className="h-full w-full" aria-label={name} role="img" />;
}
