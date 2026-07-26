# API Gestión Documental

Backend completo de un **Sistema de Gestión Documental** desarrollado con **Node.js + TypeScript + Express + PostgreSQL** (sin ORM).

---

## Características

- Autenticación con **JWT**
- Control de acceso basado en **Roles y Permisos (RBAC)**
- Gestión completa de Documentos, Movimientos e Historial
- Workflow de aprobación configurable
- Archivos adjuntos
- Campos dinámicos por tipo de documento
- Generación automática de códigos (`MEM-2026-0001`)
- Verificación pública de documentos
- Validaciones con **Zod**
- Documentación automática con **Swagger**
- Soft delete en la mayoría de entidades

---

## Tecnologías

| Tecnología       | Uso                          |
|------------------|------------------------------|
| Node.js          | Runtime                      |
| TypeScript       | Tipado estático              |
| Express          | Framework web                |
| PostgreSQL       | Base de datos                |
| pg               | Cliente PostgreSQL (sin ORM) |
| JWT + bcryptjs   | Autenticación                |
| Zod              | Validaciones                 |
| Multer           | Subida de archivos           |
| Swagger          | Documentación de la API      |

---

## Estructura del proyecto
backend/
├── src/

│   ├── config/

│   ├── controllers/

│   ├── middlewares/

│   ├── routes/

│   ├── schemas/

│   ├── utils/

│   ├── scripts/

│   ├── app.ts

│   └── server.ts

├── uploads/

├── .env

├── package.json

├── tsconfig.json
