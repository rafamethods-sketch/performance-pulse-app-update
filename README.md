# Rafa Methods

Nueva base para una app de entrenador personal pensada para desplegar en Vercel.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- React

## Primeros pasos

```bash
npm install
npm run dev
```

La app arranca en `http://localhost:3000`.

## Supabase

1. Crea un proyecto en Supabase.
2. Copia `.env.example` a `.env.local`.
3. Rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Abre el SQL editor de Supabase.
5. Ejecuta `supabase/migrations/001_initial_schema.sql`.

### Google Auth

En Supabase:

1. Ve a Authentication > Providers.
2. Activa Google.
3. Configura las credenciales OAuth de Google Cloud.
4. En Authentication > URL Configuration, añade:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000`

Para produccion en Vercel, añade tambien la URL real del dominio.

## Módulos iniciales

- Panel principal
- Clientes prioritarios
- Agenda diaria
- Biblioteca de programas
- Métricas de adherencia y sesiones

## Siguiente fase

- Añadir autenticación
- Conectar base de datos
- Crear CRUD real de clientes
- Crear editor de rutinas
- Añadir progreso por cliente
- Preparar despliegue en Vercel
