## 🧩 Guía de Estructura del Proyecto - Gym App

Este archivo está diseñado para que cualquier miembro del equipo entienda cómo está organizada la aplicación, qué tipo de archivos van en cada carpeta, y cómo funcionan los archivos `index.ts` (también llamados _barrel files_).

---

## 📁 Estructura General

```bash
src/
├── app/                # Configuración central de Redux
├── assets/             # Archivos estáticos (imágenes, íconos, etc.)
├── components/         # Componentes reutilizables (UI global)
│   ├── layout/         # Estructura de interfaz (Navbar, Sidebar, etc.)
│   ├── shared/         # Botones, loaders, inputs reutilizables
│   └── ui/             # Componentes importados desde shadcn/ui
├── features/           # Lógica modular por feature (auth, theme, etc.)
├── hooks/              # Hooks globales como useRedux
├── lib/                # Clientes externos (ej: Supabase)
├── pages/              # Vistas principales agrupadas por contexto
├── routing/            # Ruteo principal (AppRouter y rutas protegidas)
├── App.tsx             # Entry point principal de React
├── main.tsx            # Inicialización de ReactDOM y store
└── index.css           # Estilos globales
```

---

## 📦 ¿Qué va en cada carpeta?

### `app/`

- `store.ts`: Configura Redux Toolkit. Aquí se integran los reducers.

---

### `components/`

- `layout/`: Estructura visual (Navbar, Sidebar, Footer, etc.)
- `shared/`: Componente reutilizable visual como `LoadingSpinner`, `Modal`, `CustomButton`.
- `ui/`: Solo componentes autogenerados por `shadcn/ui`.

📌 Estos componentes **no** deben contener lógica de negocio ni estado global.

---

### `features/`

Cada carpeta dentro de `features/` representa una "feature" de la app, por ejemplo:

```
features/auth/
├── components/    # Ej: AuthProvider, LoginForm
├── hooks/         # useAuth, useLoginForm
├── slices/        # authSlice.ts (Redux)
├── thunks/        # authThunks.ts (async logic)
```

```
features/theme/
├── components/    # ThemeToggleButton
├── hooks/         # useTheme
├── slices/        # themeSlice.ts
```

---

### `hooks/`

- `useRedux.ts`: Combina `useAppDispatch` y `useAppSelector`

Puedes tener aquí hooks globales que no pertenezcan a una feature específica.

---

### `lib/`

- Clientes externos o librerías personalizadas, como `supabase/client.ts`.

---

### `pages/`

Páginas de alto nivel que se muestran según la ruta.

Ejemplo:

```
pages/
├── auth/
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── dashboard/
│   └── DashboardPage.tsx
```

📌 Estas páginas pueden consumir componentes de `features/` o `components/`.

---

### `routing/`

- `AppRouter.tsx`: Define todas las rutas.
- `ProtectedRoute.tsx`: Verifica sesión activa.

---

## 📂 Cómo usar archivos `index.ts`

Un archivo `index.ts` en una carpeta sirve como **punto de entrada único** para todos los archivos exportables de esa carpeta. Esto permite **importaciones más limpias y cortas**.

### ✅ Si exportas con `export const`:

Archivo: `LoginPage.tsx`

```ts
export const LoginPage = () => {
  return <div>Login</div>;
};
```

Archivo: `index.ts`

```ts
export * from "./LoginPage";
```

Uso:

```ts
import { LoginPage } from "@/pages/auth";
```

### ✅ Si exportas con `export default`:

Archivo: `LoginPage.tsx`

```ts
export default function LoginPage() {
  return <div>Login</div>;
}
```

Archivo: `index.ts`

```ts
export { default as LoginPage } from "./LoginPage";
```

Uso:

```ts
import { LoginPage } from "@/pages/auth";
```

### 📌 Reglas para usar `index.ts`:

- Si usas `export const`, puedes hacer `export * from` sin problema.
- Si usas `export default`, **siempre** usa `export { default as ... }`.
- Crea `index.ts` solo si hay **más de un archivo exportable** o si quieres **centralizar imports**.

---

## 💡 Ejemplos de uso completo

### ✅ Bien hecho:

```ts
// src/components/shared/index.ts
export * from "./LoadingSpinner";
export * from "./CustomButton";
```

```ts
// src/features/theme/components/index.ts
export * from "./ThemeToggleButton";
```

```ts
// src/hooks/index.ts
export { useAppDispatch } from "./useAppDispatch";
export { useAppSelector } from "./useAppSelector";
```

### Luego importas así:

```ts
import { ThemeToggleButton } from "@/features/theme/components";
import { LoadingSpinner } from "@/components/shared";
```

---

## ✅ Buenas prácticas del equipo

- ✅ Usa `index.ts` para exportar múltiples archivos desde una carpeta.
- ✅ Agrupa toda la lógica de una feature (slice, componentes, hooks, etc.) dentro de `features/<nombre>/`.
- ✅ No pongas lógica de negocio en componentes de `components/ui/` ni en `shared/`.
- ✅ Si un componente depende del estado global, debe vivir en `features/`.
- ✅ Usa rutas limpias importando desde los `index.ts`.

---

Si tienes dudas o no sabes dónde ubicar algo, consulta este archivo o pregunta en el equipo. Esta estructura está diseñada para mantener la app **organizada y fácil de escalar** ✨.
