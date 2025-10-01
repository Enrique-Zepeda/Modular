# 🏋️‍♂️ Modular Gym App

Una aplicación web modular de gimnasio construida con tecnologías modernas como React, TypeScript, Tailwind CSS, Supabase, Redux Toolkit, entre otras. Este proyecto fue creado para facilitar el seguimiento y planificación de rutinas de entrenamiento.

👉 Consulta la [Guía de Estructura del Proyecto](./Estructura-Proyecto.md) para entender cómo está organizada la arquitectura por features.

---

## 🚀 Tecnologías usadas

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS 4**
- **Redux Toolkit + RTK Query**
- **Supabase (auth + DB)**
- **React Hook Form + Zod**
- **SweetAlert2 / React Hot Toast**
- **Heroicons + Lucide Icons**
- **Framer Motion**
- **pnpm**

---

## ⚙️ Requisitos previos

Antes de comenzar, asegúrate de tener lo siguiente instalado en tu sistema:

### 1. Node.js (npm incluido)

> Descárgalo desde [https://nodejs.org/](https://nodejs.org/) (elige la versión LTS).

Si ya tienes Node.js instalado, puedes pasar directamente al paso 2 para instalar `pnpm`.

Si estás usando un manejador de versiones como `nvm`, asegúrate de tener una versión de Node activa y configurada en tu entorno.

Para verificar que Node.js y npm están instalados correctamente:

```bash
node -v
npm -v
```


---

### 2. pnpm

Este proyecto utiliza [pnpm](https://pnpm.io/) como gestor de paquetes por su rapidez y eficiencia.

#### Para instalar pnpm globalmente:

```bash
npm install -g pnpm
```

Verifica la instalación:

```bash
pnpm -v
```

---

## 📦 Instalación del proyecto

Una vez que tengas `pnpm` instalado, clona el repositorio y sigue estos pasos:

```bash
# Clona este repositorio
git clone https://github.com/Enrique-Zepeda/Modular.git

# Entra a la carpeta del proyecto
cd Modular

# Instala las dependencias
pnpm install
```

---

## 🛠️ Scripts disponibles

Dentro del proyecto puedes ejecutar:

### `pnpm dev`

Inicia el servidor de desarrollo en [http://localhost:5173](http://localhost:5173).

### `pnpm build`

Compila la aplicación para producción en la carpeta `dist`.

### `pnpm preview`

Sirve la build para previsualizarla localmente.

### `pnpm lint`

Ejecuta ESLint para verificar el código.

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con tus claves de Supabase:

```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

> ⚠️ El archivo `.env` ya está en el `.gitignore` y **no se subirá al repositorio**.

---


Pruebas de python

1.  **Crea y activa el ambiente virtual:**
    ```bash
    # Comando para crear el .venv
    python -m venv .venv

    # Comando para activarlo en Windows
    .\.venv\Scripts\activate
    ```

2.  **Instala las dependencias:**
    Este comando leerá el archivo `requirements.txt` e instalará todo lo necesario.
    ```bash
    pip install -r requirements.txt
    ```

3.  **Inicia el servidor:**
    ```bash
    python python/api.py
    ```
El servidor estará corriendo en `http://127.0.0.1:5000`.
