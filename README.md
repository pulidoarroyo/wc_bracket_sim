# Quiniela NAVIORCA - Mundial 2026

Plataforma premium de predicciones deportivas (quiniela) para el Mundial 2026. Permite a los usuarios registrarse, pronosticar resultados de partidos por fases, competir en una tabla de clasificación, y cuenta con un panel de administración completo para gestionar partidos, resultados y usuarios.

---

## 🚀 Tecnologías y Herramientas

La aplicación está construida utilizando el siguiente stack moderno:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components y React 19)
- **Base de Datos y Autenticación**: [Supabase](https://supabase.com/) (integración con `@supabase/ssr` y `@supabase/supabase-js`)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) (usando `@tailwindcss/postcss` para compilación súper rápida)
- **Temas**: Soporte de Tema Oscuro (por defecto) y Tema Claro (con estética de gris claro premium, sin usar blanco puro) controlado mediante variables CSS nativas.
- **Tipografía**: Fuente Geist (por defecto optimizada en Next.js)
- **Lenguaje**: TypeScript para tipado estático y robustez

---

## 📂 Estructura de Carpetas

La arquitectura de directorios del proyecto se organiza de la siguiente manera:

```text
wc_bracket_sim/
├── src/
│   ├── app/                    # Next.js App Router (Rutas, Páginas y Layouts)
│   │   ├── (admin)/            # Rutas protegidas para administradores
│   │   │   ├── matches/        # Gestión de partidos
│   │   │   ├── phases/         # Configuración de estados de fases
│   │   │   ├── results/        # Registro de resultados oficiales
│   │   │   └── users/          # Gestión de usuarios y roles
│   │   ├── (auth)/             # Rutas públicas de sesión
│   │   │   ├── login/          # Inicio de sesión
│   │   │   └── register/       # Registro de cuenta
│   │   ├── (client)/           # Rutas para participantes
│   │   │   ├── dashboard/      # Panel de control de usuario
│   │   │   ├── leaderboard/    # Tabla de posiciones general
│   │   │   └── predictions/    # Ingreso y consulta de predicciones
│   │   ├── globals.css         # Estilos globales y variables de temas CSS
│   │   └── layout.tsx          # Root Layout y scripts de hidratación de tema
│   ├── components/             # Componentes de UI modulares y reutilizables
│   │   ├── ThemeToggle.tsx     # Botón interactivo de cambio de tema
│   │   ├── Navbar.tsx          # Componente de navegación del lado del servidor
│   │   ├── NavbarClient.tsx    # Menú y links del lado del cliente
│   │   └── ...                 # Formularios de creación, edición y predicciones
│   ├── lib/                    # Configuración de librerías y utilidades
│   │   └── supabase/           # Clientes Supabase (Server, Client y Service Role Admin)
└── ...                         # Configuraciones del compilador, empaquetado y estilos
```

---

## 🗺️ Rutas del Proyecto

Las rutas están organizadas utilizando grupos de rutas de Next.js (`(auth)`, `(client)`, `(admin)`):

### 🔑 Autenticación (`(auth)`)
- **`/login`**: Formulario de inicio de sesión de usuario con visibilidad de contraseña toggleable.
- **`/register`**: Registro de nuevos usuarios para participar en la quiniela.

### 👤 Cliente (`(client)`)
- **`/dashboard`**: Panel principal para el usuario. Muestra el estado del perfil (puntos, posición, aciertos exactos, ganadores correctos) y las distintas fases del torneo para ingresar predicciones.
- **`/leaderboard`**: Clasificación general en tiempo real mostrando el puntaje y estadísticas de todos los participantes.
- **`/predictions/[phase]`**: Vista detallada para ingresar, guardar o visualizar los pronósticos de los partidos en una fase específica (ej. fase de grupos, octavos, etc.).

### 🛠️ Administración (`(admin)`)
- **`/matches`**: Panel del administrador para crear y editar detalles de partidos.
- **`/phases`**: Control de fases del torneo (abrir, cerrar, bloquear pronósticos).
- **`/results`**: Registro oficial de marcadores y resultados de los partidos jugados.
- **`/users`**: Gestión de usuarios registrados, con capacidad para cambiar roles (Usuario/Administrador) y eliminar cuentas.

---

## 🛠️ Desarrollo Local

1. **Instalar Dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno**:
   Crea un archivo `.env` en la raíz del proyecto y agrega tus claves de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
   ```

3. **Iniciar el Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```

4. **Construir para Producción**:
   ```bash
   npm run build
   ```
