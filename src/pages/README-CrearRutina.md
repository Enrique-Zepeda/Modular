# 📋 Flujo de Crear Rutina

## 🎯 Descripción
Este flujo permite a los usuarios crear nuevas rutinas de entrenamiento con validación completa y manejo de errores.

## 📁 Archivos Creados

### 1. **Tipos y Interfaces** (`src/types/rutina.ts`)
- `IRutina`: Interfaz para rutinas completas
- `IRutinaInput`: Interfaz para datos de entrada al crear rutinas
- `ICrearRutinaForm`: Interfaz para el formulario de creación

### 2. **Servicio de Rutinas** (`src/services/rutinasService.ts`)
- `RutinasService.crearRutina()`: Crea una nueva rutina en Supabase
- `RutinasService.obtenerRutinas()`: Obtiene todas las rutinas
- `RutinasService.obtenerRutinaPorId()`: Obtiene una rutina específica
- `RutinasService.actualizarRutina()`: Actualiza una rutina existente
- `RutinasService.eliminarRutina()`: Elimina una rutina

### 3. **Validación con Zod** (`src/schemas/rutinaSchema.ts`)
- `crearRutinaSchema`: Esquema de validación para el formulario
- Validaciones: nombre (3-100 chars), descripción (10-500 chars), tipos y niveles

### 4. **Componente de Formulario** (`src/components/FormularioCrearRutina.tsx`)
- Formulario reactivo con React Hook Form
- Validación en tiempo real
- Manejo de errores de validación
- Reset automático después de envío exitoso

### 5. **Página Principal** (`src/pages/CrearRutina.tsx`)
- Manejo de estado de loading
- Notificaciones con react-hot-toast
- Navegación automática después de crear
- UI responsive y accesible

### 6. **Hook Personalizado** (`src/hooks/useRutinas.ts`)
- `useRutinas()`: Hook para manejar operaciones de rutinas
- Estado centralizado para rutinas, loading y errores
- Funciones para CRUD completo

### 7. **Constantes** (`src/constants/rutinaConstants.ts`)
- Tipos de rutina y niveles de dificultad
- Labels para UI
- Opciones de días por semana

### 8. **Componente de Loading** (`src/components/LoadingSpinner.tsx`)
- Spinner reutilizable con diferentes tamaños
- Texto personalizable

## 🔄 Flujo de Funcionamiento

1. **Usuario accede a `/crear-rutina`**
2. **Se muestra el formulario** con validación en tiempo real
3. **Usuario completa los campos:**
   - Nombre de la rutina (3-100 caracteres)
   - Descripción (10-500 caracteres)
   - Tipo de rutina (Fuerza/Hipertrofia/Resistencia)
   - Días por semana (1-7)
   - Nivel de dificultad (Principiante/Intermedio/Avanzado)
4. **Al enviar el formulario:**
   - Se valida con Zod
   - Se muestra loading state
   - Se llama a `RutinasService.crearRutina()`
   - Se guarda en Supabase
5. **Resultado:**
   - ✅ **Éxito**: Toast de confirmación + redirección a dashboard
   - ❌ **Error**: Toast de error + formulario disponible para reintentar

## 🛡️ Características de Seguridad

- **Validación completa** en frontend y backend
- **Manejo de errores** con try/catch
- **Tipado estricto** con TypeScript
- **Sanitización** de inputs
- **RLS** habilitado en Supabase

## 🎨 Características de UX

- **Validación en tiempo real** con feedback visual
- **Loading states** durante operaciones
- **Notificaciones** claras de éxito/error
- **Formulario responsive** para mobile/desktop
- **Accesibilidad** con labels y aria-attributes
- **Navegación intuitiva** con botón cancelar

## 🔧 Tecnologías Utilizadas

- **React 19** con TypeScript
- **React Hook Form** + **Zod** para formularios
- **React Hot Toast** para notificaciones
- **React Router** para navegación
- **Tailwind CSS** para styling
- **Supabase** para base de datos
- **Custom Hooks** para lógica reutilizable

## 📊 Estructura de Datos

```typescript
interface IRutinaInput {
  nombre: string;
  descripcion: string;
  nivel_recomendado: 'principiante' | 'intermedio' | 'avanzado';
  objetivo: 'fuerza' | 'hipertrofia' | 'resistencia';
  duracion_estimada: number; // en minutos
}
```

## 🚀 Próximos Pasos

1. **Integrar con el router** para acceder a la página
2. **Agregar tests** unitarios y de integración
3. **Implementar edición** de rutinas existentes
4. **Agregar preview** de la rutina antes de guardar
5. **Implementar templates** de rutinas predefinidas 