# miTurno - Backend

Backend de la aplicación de reserva de citas para barberías. Construido con NestJS, TypeORM y PostgreSQL.

##  Tecnologías

- **Framework:** NestJS
- **Base de datos:** PostgreSQL con TypeORM
- **Autenticación:** JWT con cookies HttpOnly
- **Notificaciones:** Resend (emails)
- **Contenedores:** Docker

##  Instalación local

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/barbershop-backend.git
cd barbershop-backend

# Instalar dependencias
npm install --legacy-peer-deps

# Copiar variables de entorno
cp .env.example .env

# Configurar .env con tus credenciales
# DB_PASSWORD, JWT_SECRET, etc.

# Ejecutar en desarrollo
npm run start:dev


## 🐳 Docker


# Levantar todos los servicios (backend + frontend + base de datos)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down


## 📁 Estructura del proyecto

src/
├── modules/
│   ├── auth/          # Autenticación JWT
│   ├── users/         # Gestión de usuarios
│   ├── services/      # CRUD de servicios
│   ├── business-hours/# Horarios de atención
│   ├── appointments/  # Reserva de citas
│   └── email/         # Notificaciones con Resend
├── config/            # Configuración de la app
└── main.ts            # Punto de entrada





##  Endpoints principales

- **POST** `/api/v1/auth/login` - Iniciar sesión
- **POST** `/api/v1/users` - Registrar usuario
- **GET** `/api/v1/services/public/:id` - Ver servicios públicos
- **POST** `/api/v1/appointments` - Crear cita
- **GET** `/api/v1/appointments/business` - Citas del negocio
- **GET** `/api/v1/appointments/client` - Citas del cliente
