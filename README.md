# 🏗️ GestionObras - Sistema de Gestión de Presupuestos de Construcción

Sistema integral para la gestión de presupuestos de obras de construcción, desarrollado con React, TypeScript y Supabase.

## 📋 Características

- **Gestión de Materiales**: Catálogo completo de materiales con precios y unidades
- **Gestión de Mano de Obra**: Registro de tipos de mano de obra y tarifas
- **Recetas**: Definición de recetas de construcción con materiales y mano de obra
- **Presupuestos**: Creación y seguimiento de presupuestos de obras
- **Clientes**: Administración de clientes y contactos
- **Usuarios y Roles**: Sistema de autenticación con roles (Administrador, Usuario, Visualizador)
- **Dashboard**: Visualización de métricas y estadísticas

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI**: Material-UI (MUI)
- **Validación**: Zod
- **Gestión de Estado**: React Context + Hooks
- **Monorepo**: npm workspaces

## 📁 Estructura del Proyecto

```
gestion-obras/
├── packages/
│   ├── client/          # Aplicación React (Frontend)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── lib/
│   │   └── package.json
│   │
│   └── shared/          # Código compartido (tipos, validaciones, utilidades)
│       ├── src/
│       │   ├── types/
│       │   ├── validation/
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
│
├── seed.sql             # Script de inicialización de BD
├── seed-from-excel.js   # Script para importar datos desde Excel
└── package.json         # Configuración del workspace raíz
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm 9+
- Cuenta de Supabase

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/alamgbs/gestion-obras.git
   cd gestion-obras
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

   ```env
   SUPABASE_URL=tu_supabase_url
   SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   SUPABASE_JWT_SECRET=tu_jwt_secret
   DATABASE_URL=tu_database_url
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   APP_NAME=GestionObras
   ```

4. **Configurar la base de datos**

   Ejecuta el script `seed.sql` en tu proyecto de Supabase para crear las tablas y configuración inicial:

   - Ve al SQL Editor en tu dashboard de Supabase
   - Copia y pega el contenido de `seed.sql`
   - Ejecuta el script

5. **Iniciar el proyecto**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## 📝 Scripts Disponibles

```bash
# Desarrollo - Inicia el cliente en modo desarrollo
npm run dev

# Build - Construye todos los paquetes para producción
npm run build

# Build Shared - Construye solo el paquete compartido
npm run build:shared

# Build Client - Construye solo el cliente
npm run build:client

# Lint - Revisa el código con ESLint
npm run lint
```

## 🗃️ Base de Datos

El sistema utiliza Supabase con PostgreSQL. La estructura incluye:

- **users**: Usuarios del sistema con roles
- **clients**: Clientes y contactos
- **materials**: Catálogo de materiales
- **labor**: Tipos de mano de obra
- **recipes**: Recetas de construcción
- **budgets**: Presupuestos de obras
- **budget_recipes**: Relación entre presupuestos y recetas
- **recipe_materials**: Materiales por receta
- **recipe_labor**: Mano de obra por receta

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS habilitadas para seguridad:
- Los administradores tienen acceso completo
- Los usuarios pueden leer y modificar según sus permisos
- Los visualizadores solo tienen acceso de lectura

## 🔑 Roles de Usuario

1. **Administrador** (`admin`): Acceso completo al sistema
2. **Usuario** (`user`): Puede crear y editar presupuestos
3. **Visualizador** (`viewer`): Solo lectura

## 📊 Funcionalidades Principales

### Materiales
- CRUD completo de materiales
- Gestión de precios y unidades
- Categorización

### Recetas
- Creación de recetas con materiales y mano de obra
- Cálculo automático de costos
- Reutilización en múltiples presupuestos

### Presupuestos
- Creación de presupuestos para clientes
- Selección de recetas
- Cálculo automático de totales
- Estados: Borrador, Enviado, Aprobado, Rechazado
- Exportación a Excel/PDF (próximamente)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👥 Autores

- **Alam B. Salgado** - [alamgbs](https://github.com/alamgbs)

## 📞 Soporte

Para soporte y consultas, contactar a través de GitHub Issues.

---

**Desarrollado con ❤️ en Paraguay** 🇵🇾
