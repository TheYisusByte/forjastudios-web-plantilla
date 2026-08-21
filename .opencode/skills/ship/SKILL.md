---
name: ship
description: Publica los cambios — ejecuta el ciclo completo de validación, commit, push y PR.
metadata:
  argument-hint: '[mensaje del commit]'
---

# Ship: Release Automatizado

Ejecuta el workflow completo de publicación: validación → commit → push → PR.

## Steps

1. **Pre-flight** — Detecta la rama actual y la rama base:

```bash
BRANCH=$(git branch --show-current)
echo "BRANCH: $BRANCH"
```

Detectar la rama base (usar `Base branch:` de AGENTS.md o detectar):

```bash
BASE=$(gh pr view --json baseRefName -q .baseRefName 2>/dev/null \
  || gh repo view --json defaultBranchRef -q .defaultBranchRef.name 2>/dev/null \
  || echo "main")
echo "BASE: $BASE"
git status
git diff $BASE...HEAD --stat
git log $BASE..HEAD --oneline
```

2. **Merge con base branch** — Fetch y merge la rama base:

```bash
git fetch origin $BASE && git merge origin/$BASE --no-edit
```

Si hay conflictos: intentar auto-resolver los simples. Si son complejos, detenerse y mostrarlos.

3. **Validar HTML** — Verificar problemas comunes de HTML:

```bash
rg "<(img|br|hr|input)[^>]*[^/]>?" --include="*.html" || true
```

Buscar:
- Tags sin cerrar
- Atributos `alt` faltantes en imágenes
- `aria-label` faltantes en elementos interactivos
- Inline styles (deberían usar clases CSS)

4. **Validar CSS** — Verificar problemas comunes de CSS:

```bash
rg "!important" --include="*.css" || true
rg "#[0-9a-fA-F]{3,6}" --include="*.css" | rg -v "var\(" || true
```

Buscar:
- Uso excesivo de `!important`
- Colores hardcodeados (deberían usar variables CSS)
- Breakpoints responsive faltantes

5. **Validar JavaScript** — Verificar problemas comunes de JS:

```bash
rg "console\.(log|debug|info)" --include="*.js" || true
rg "eval\(" --include="*.js" || true
rg "innerHTML" --include="*.js" || true
```

Buscar:
- Statements `console.log`
- Uso de `eval()` (riesgo de seguridad)
- `innerHTML` con input de usuario (riesgo XSS)
- Variables globales

6. **Revisión rápida** — Revisar el diff por problemas críticos:
- `innerHTML` con input de usuario (XSS)
- `rel="noopener noreferrer"` faltante en links externos
- Inline styles (deberían usar clases CSS)
- `aria-label` faltantes en elementos interactivos
- Colores hardcodeados (deberían usar variables CSS)

Auto-fixear problemas mecánicos. Si hay problemas críticos que requieren juicio humano, detenerse y preguntar.

7. **Commit y push** — Stage todos los cambios:

```bash
git add -A
```

Generar mensaje de commit del diff. Formato: conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`). Línea principal bajo 72 chars.

```bash
git commit -m "<mensaje generado>"
git push origin HEAD
```

8. **Crear o actualizar PR**:

```bash
gh pr view --json url -q .url 2>/dev/null
```

Si no existe PR, crear uno:
```bash
gh pr create --base $BASE --fill
```

Si ya existe PR, ya se actualizó con el push.

## Output

Presentar resumen:

```
# Ship Complete

## Cambios
- Rama: <branch> → <base>
- PR: <url>
- Archivos: <N changed, +X/-Y lines>

## Validación
- HTML: <clean/N issues>
- CSS: <clean/N issues>
- JavaScript: <clean/N issues>

## Auto-fixes
- <N applied>

## Siguientes pasos
- Revisar el PR
- Merge cuando esté listo
```