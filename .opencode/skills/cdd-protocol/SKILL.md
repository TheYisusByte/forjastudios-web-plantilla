---
name: cdd-protocol
description: Usa esta skill siempre que el usuario esté trabajando en un proyecto de software que use un vault de Obsidian como memoria de contexto (carpetas numeradas 00_Indice a 15_Tareas, documentos con IDs tipo ARC-, REQ-, FLOW-, ADR-, TASK-, CTX-), o cuando pida explícitamente "seguir el protocolo CDD" / "Context-Driven Development". Aplica sin importar el lenguaje de programación del proyecto.
---

# Skill: Protocolo CDD (Context-Driven Development)

## Cuándo activarse
- El usuario menciona un vault de Obsidian con estructura de carpetas numeradas para el proyecto.
- El usuario pide implementar una tarea, feature o fix en un proyecto que sigue CDD.
- El usuario pide crear un nuevo ARC/REQ/FLOW/ADR/TASK/Context Packet.
- El usuario dice "sigamos el protocolo" o similar.

## Qué hacer, en orden

1. **Ubicar el vault.** Si no se sabe la ruta, preguntar o buscarla. Leer `00_Indice` primero, siempre.

2. **Antes de escribir código para una tarea nueva:**
   - Verificar que existe un `REQ-` o `FLOW-` que la origina. Si no existe, crearlo primero usando la plantilla correspondiente.
   - Verificar que existe un Context Packet (`CTX-`) en `14_ContextPackets`. Si no existe, crearlo: incluir SOLO los documentos (ARC, ADR, IFC, STD) que realmente restringen la implementación — no volcar todo el vault.
   - Ejecutar el checklist de resolución de dependencias (documentos DEPRECATED, contradicciones entre ADRs, dependencias externas no registradas, contratos de interfaz faltantes) antes de tocar código.

3. **Crear el `TASK-`** en `15_Tareas`, estado `abierto`, referenciando el Context Packet y el origen.

4. **Implementar** en el repositorio de código real. El vault nunca contiene código de implementación — solo decisiones, contratos y estado.

5. **Al terminar, cerrar la tarea con su Context Delta** (sección al final del propio `TASK-XXX.md`):
   - Qué se implementó realmente (y diferencias vs. el plan).
   - IDs nuevos creados (ADR, RISK, DEP, IFC) como consecuencia de la implementación.
   - Documentos existentes actualizados.
   - Qué queda pendiente.
   - **Esto no es opcional.** Si terminas de implementar y no has escrito el Context Delta, la tarea no está terminada — decirlo explícitamente al usuario si intenta cerrar sin él.

6. **Actualizar `00_Indice`** si el cambio afecta el estado general del proyecto.

## Reglas duras que esta skill nunca rompe

- Nunca reutilizar ni renumerar un ID existente.
- Nunca marcar como implementado algo sin haber verificado sus dependencias primero.
- Nunca mezclar sintaxis o convenciones de un lenguaje específico dentro de `02_Arquitectura`, `03_Requisitos`, `05_Flujos` o `06_Decisiones` — eso va en `11_Estandares`.
- Nunca cerrar un TASK sin Context Delta, aunque el usuario tenga prisa. En ese caso, avisar: "puedo implementarlo, pero para cerrar la tarea según el protocolo necesito registrar el Context Delta — lo hago ahora o lo dejamos como TASK en progreso".

## Al crear cualquier documento nuevo
Usar exactamente la plantilla correspondiente del paquete CDD (`Plantillas/ARC.md`, `REQ.md`, `FLOW.md`, `ADR.md`, `TASK.md`, `ContextPacket.md`), incluyendo el frontmatter YAML completo (`id`, `tipo`, `estado`, `creado`, `depende_de`). No improvisar campos nuevos sin necesidad real.

## Rol por defecto
Si el usuario no especifica qué rol necesita, actuar como **Agente Ejecutor de Tareas** (ver `Agentes/Agente_Ejecutor_Tareas.md`), que es quien sigue el ciclo completo de principio a fin. Cambiar de rol solo si la petición es claramente de arquitectura pura (sin implementación) o de definición de requisitos.