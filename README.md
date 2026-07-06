# BIK-Server-User

Servidor gateway API para la aplicación móvil de banca digital de Banco Informático Kinal (BIK).

## Arquitectura

Este servidor actúa como intermediario entre la app móvil (BIK-Client-User) y el ecosistema BIK existente:

- **Lectura directa**: Consultas a la base de datos compartida (`bik_core_db`) para cuentas, tarjetas, notificaciones, etc.
- **Proxy de escritura**: Las operaciones financieras mutativos se enrutan al BIK-Server-Admin para mantener la integridad transaccional, idempotencia y auditoría.
- **Autenticación**: Proxy al BIK-Auth-Service (C#) para login y registro.

## Requisitos

- Node.js 20+
- MongoDB (compartida con BIK-Server-Admin)
- BIK-Auth-Service corriendo en puerto 5213
- BIK-Server-Admin corriendo en puerto 3000

## Instalación

```bash
npm install
npm run dev
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `5000` |
| `MONGODB_URI` | Conexión a MongoDB | `mongodb://127.0.0.1:27017/bik_core_db` |
| `AUTH_SERVICE_URL` | URL del Auth-Service C# | `http://localhost:5213` |
| `ADMIN_SERVER_URL` | URL del Server-Admin | `http://localhost:3000` |
| `JWT_SECRET` | Clave JWT compartida | — |
