# 🏋️ Sistema de Rutinas de Ejercicios

Este módulo implementa un sistema completo para crear y gestionar rutinas de ejercicios con integración a Supabase.

## 📁 Estructura del Proyecto

```
src/
├── features/rutinas/
│   ├── api/rutinasApi.ts          # RTK Query API para operaciones CRUD
│   ├── hooks/useRutinas.ts        # Hook personalizado para estado local
│   ├── slices/rutinasSlice.ts     # Redux slice para estado de rutinas
│   └── index.ts                   # Exportaciones de la feature
├── pages/rutinas/
│   ├── ListaRutinasPage.tsx       # Lista todas las rutinas
│   ├── CrearRutinaPage.tsx        # Formulario para crear rutinas
│   ├── VerRutinaPage.tsx          # Vista detallada de una rutina
│   └── index.ts                   # Exportaciones de páginas
├── components/rutinas/
│   ├── SelectorEjercicios.tsx     # Componente para seleccionar ejercicios
│   └── index.ts                   # Exportaciones de componentes
├── lib/validations/schemas/
│   ├── rutinaSchema.ts            # Validación para crear rutinas
│   ├── ejercicioSchema.ts         # Validación para agregar ejercicios
│   └── index.ts                   # Exportaciones de esquemas
├── types/
│   ├── rutinas.ts                 # Tipos TypeScript para rutinas
│   └── index.ts                   # Exportaciones de tipos
└── components/ui/
    └── select.tsx                 # Componente Select (Radix UI)
```

## 🚀 Funcionalidades Implementadas

### ✅ Crear Rutinas
- Formulario completo con validación Zod
- Campos: nombre, descripción, nivel, objetivo, duración
- Integración con Supabase para persistencia
- Alertas de éxito/error con React Hot Toast

### ✅ Listar Rutinas
- Vista de todas las rutinas creadas
- Filtros por nivel, objetivo y búsqueda por texto
- Diseño responsive con cards
- Animaciones con Framer Motion

### ✅ Ver Rutina Detallada
- Información completa de la rutina
- Lista de ejercicios asignados
- Estadísticas de series, repeticiones y peso
- Opción para eliminar rutina

### ✅ Agregar Ejercicios
- Selector de ejercicios con filtros
- Búsqueda por nombre, grupo muscular, dificultad
- Configuración de series, repeticiones y peso
- Validación de formularios

### ✅ Gestión de Estado
- Redux Toolkit para estado local
- RTK Query para operaciones API
- Cache automático y invalidación
- Loading states y error handling

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Redux Toolkit** + **RTK Query**
- **React Hook Form** + **Zod**
- **Supabase** (Auth + Database)
- **Tailwind CSS 4**
- **Framer Motion**
- **React Hot Toast**
- **Heroicons** + **Lucide React**

## 📊 Base de Datos

### Tabla: Rutinas
```sql
- id_rutina (PK, auto-increment)
- nombre (varchar)
- descripcion (text)
- nivel_recomendado (enum: 'principiante', 'intermedio', 'avanzado')
- objetivo (enum: 'fuerza', 'hipertrofia', 'resistencia')
- duracion_estimada (integer)
```

### Tabla: Ejercicios
```sql
- id (PK, auto-increment)
- nombre (varchar)
- grupo_muscular (varchar)
- descripcion (text)
- equipamento (varchar)
- dificultad (varchar)
- musculos_involucrados (varchar)
- ejemplo (varchar, URL de GIF)
```

### Tabla: EjerciciosRutinas (Intermedia)
```sql
- id_rutina (FK a Rutinas)
- id_ejercicio (FK a Ejercicios)
- series (integer)
- repeticiones (integer)
- peso_sugerido (numeric)
```

## 🎯 Uso del Sistema

### 1. Crear una Rutina
```typescript
// Navegar a /rutinas/crear
// Completar formulario con:
- Nombre de la rutina
- Descripción detallada
- Nivel recomendado (principiante/intermedio/avanzado)
- Objetivo (fuerza/hipertrofia/resistencia)
- Duración estimada en minutos
```

### 2. Agregar Ejercicios
```typescript
// En la página de la rutina:
1. Hacer clic en "Agregar Ejercicio"
2. Usar filtros para encontrar ejercicios
3. Seleccionar ejercicio
4. Configurar series, repeticiones y peso
5. Confirmar agregado
```

### 3. Gestionar Rutinas
```typescript
// En la lista de rutinas:
- Ver todas las rutinas creadas
- Filtrar por nivel y objetivo
- Buscar por nombre o descripción
- Eliminar rutinas no deseadas
```

## 🔧 Configuración

### Variables de Entorno
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### Dependencias Instaladas
```bash
pnpm add @radix-ui/react-select
```

## 🎨 Características de UI/UX

- **Diseño Responsive**: Adaptable a móviles, tablets y desktop
- **Animaciones Suaves**: Transiciones con Framer Motion
- **Estados de Carga**: Spinners y skeleton loaders
- **Validación en Tiempo Real**: Feedback inmediato en formularios
- **Alertas Intuitivas**: Toast notifications para acciones
- **Modo Oscuro**: Compatible con tema dark/light

## 🔒 Seguridad

- **Validación de Datos**: Esquemas Zod para todos los formularios
- **Sanitización**: Limpieza de inputs antes de enviar
- **Manejo de Errores**: Try-catch en todas las operaciones
- **Confirmaciones**: Diálogos para acciones destructivas

## 📈 Rendimiento

- **Cache Inteligente**: RTK Query cache automático
- **Lazy Loading**: Componentes cargados bajo demanda
- **Optimización de Imágenes**: Lazy loading para GIFs de ejercicios
- **Debounce**: Búsqueda optimizada con delays

## 🧪 Testing

El código está estructurado para facilitar testing:
- Componentes funcionales con props tipadas
- Hooks personalizados separados
- Lógica de negocio en servicios
- Estados manejados por Redux

## 🚀 Próximas Mejoras

- [ ] Edición de rutinas existentes
- [ ] Duplicación de rutinas
- [ ] Plantillas de rutinas predefinidas
- [ ] Exportar/importar rutinas
- [ ] Estadísticas de progreso
- [ ] Calendario de entrenamientos
- [ ] Notificaciones de recordatorio

---

¡El sistema está listo para usar! 🎉 