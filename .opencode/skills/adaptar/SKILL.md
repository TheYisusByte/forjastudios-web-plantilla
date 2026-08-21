---
name: adaptar
description: Adapt an existing project to the complete opencode ecosystem. Analyzes the project stack, creates AGENTS.md, opencode.json, and installs all agents, skills, and commands.
metadata:
  argument-hint: '<project-path>'
---

# Adaptar Proyecto al Ecosistema opencode

Adapta un proyecto existente al ecosistema opencode completo. Analiza el stack
del proyecto, crea la configuración personalizada e instala todos los agentes,
skills y comandos.

## Steps

1. Parse the project path from `$ARGUMENTS`.

2. **Analyze the project** — explore the codebase to determine:
   - Project type (web, api, cli, mobile, script)
   - Technology stack (framework, language, dependencies)
   - Existing configuration files (package.json, requirements.txt, pubspec.yaml, etc.)
   - Git configuration
   - Existing documentation

3. **Create `.opencode/` structure**:
   ```
   .opencode/
   ├── agents/          (14 subagentes)
   ├── skills/          (14 skills incluyendo adaptar)
   ├── commands/        (13 comandos incluyendo /adaptar)
   ├── package.json
   ├── .gitignore
   └── README.md
   ```

4. **Copy ecosystem from** `C:\Users\adria\Documents\PinkyOS\.opencode\`:
   - `agents/*.md` → `.opencode/agents/`
   - `skills/*/SKILL.md` → `.opencode/skills/*/SKILL.md`
   - `commands/*.md` → `.opencode/commands/`
   - `package.json` → `.opencode/package.json`
   - `.gitignore` → `.opencode/.gitignore`

5. **Generate `opencode.json`** with permissions based on stack:
   - Always allow: edit, webfetch, git
   - Stack-specific: npm/pnpm (Node.js), pip/python (Python), flutter/dart (Flutter)
   - Always deny: rm -rf, sudo, force push

6. **Generate `AGENTS.md`** with:
   - Project identity (name, description, type)
   - Stack technology details (read from config files)
   - Git workflow (main branch, Conventional Commits in Spanish)
   - Project structure (analyze directory layout)
   - Code conventions (language-specific: snake_case, camelCase, etc.)
   - Development commands (read from package.json scripts or equivalent)
   - Quality gates
   - Security rules

7. **Install dependencies** if applicable:
   - Node.js: run `npm install` or `pnpm install` in `.opencode/`
   - Python: skip (no dependencies needed)
   - Flutter: skip (no dependencies needed)

8. **Output summary**:
   ```
   ✅ Proyecto adaptado: [path]
   
   📁 Ecosistema instalado:
   - .opencode/agents/ (14 agentes)
   - .opencode/skills/ (14 skills)
   - .opencode/commands/ (13 comandos)
   - opencode.json (configurado)
   - AGENTS.md (personalizado)
   
   🚀 Siguientes pasos:
   1. cd [project-path]
   2. opencode (para iniciar)
   3. /plan <tarea> (para planificar primera tarea)
   ```

## Validation

After adaptation, verify:
- [ ] `.opencode/` folder exists with all components
- [ ] `opencode.json` is valid JSON with correct permissions
- [ ] `AGENTS.md` has accurate stack info
- [ ] All 14 agents are present
- [ ] All 14 skills are present (including adaptar)
- [ ] All 13 commands are present (including /adaptar)

## Template Source

The opencode ecosystem template is located at:
`C:\Users\adria\Documents\PinkyOS\.opencode\`

## Notes

- This command is idempotent: running it on an already-adapted project
  will refresh the ecosystem without overwriting custom AGENTS.md content
  (backs up existing AGENTS.md to AGENTS.md.bak)
- If the project already has a `.opencode/` folder, only missing components
  are added; existing ones are preserved
