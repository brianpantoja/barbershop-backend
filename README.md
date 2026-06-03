# Barbershop Backend

API del sistema de reserva de citas para barberías. Hecha con NestJS, TypeORM y PostgreSQL.

## Qué usa

- NestJS
- TypeORM + PostgreSQL
- JWT (con cookies HttpOnly)
- Resend para emails
- Docker

## Cómo correrlo

```bash
git clone https://github.com/brianpantoja/barbershop-backend.git
cd barbershop-backend
npm install --legacy-peer-deps
cp .env.example .env
# editar .env con tus datos (DB, JWT, etc.)
npm run start:dev

El puerto por defecto es 3000. La API queda en http://localhost:3000/api/v1.

Endpoints principales

POST /api/v1/auth/login → login
POST /api/v1/users → registrar usuario
GET /api/v1/services/public/:id → ver servicios (público)
POST /api/v1/appointments → crear cita
GET /api/v1/appointments/business → citas del negocio
GET /api/v1/appointments/client → citas del cliente

Estructura

src/
├── modules/
│ ├── auth/
│ ├── users/
│ ├── services/
│ ├── business-hours/
│ ├── appointments/
│ └── email/
├── config/
└── main.ts

Docker

Para levantar todo (backend + frontend + postgres):

docker-compose up -d

Para logs:

docker-compose logs -f

Para parar:

docker-compose down

Repos

Backend: este repo
Frontend: https://github.com/brianpantoja/barbershop-frontend
