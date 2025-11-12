/**
 * Utilidades mínimas para manejar el "tema de color" (colorway) independiente
 * del modo claro/oscuro. Mantiene compatibilidad con tu lógica actual.
 *
 * - Persistimos en localStorage bajo la clave "colorTheme"
 * - Aplicamos un atributo data-theme en <html> para que el CSS del tema haga efecto
 */

export const COLOR_THEME_STORAGE_KEY = "colorTheme";

export type ColorTheme =
  | "modern"
  | "amethyst"
  | "blue"
  | "candyland"
  | "dark"
  | "ghibliStudio"
  | "green"
  | "kodama"
  | "neo"
  | "notebook"
  | "red"
  | "spotify"
  | "summer"
  | "twitter"
  | "vercel"
  | "violet";

export const AVAILABLE_COLOR_THEMES: ColorTheme[] = [
  "modern",
  "amethyst",
  "blue",
  "candyland",
  "dark",
  "ghibliStudio",
  "green",
  "kodama",
  "neo",
  "notebook",
  "red",
  "spotify",
  "summer",
  "twitter",
  "vercel",
  "violet",
];

export function getInitialColorTheme(): ColorTheme {
  try {
    const saved = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    if (saved && (AVAILABLE_COLOR_THEMES as string[]).includes(saved)) {
      return saved as ColorTheme;
    }
  } catch {
    // ignore
  }
  return "modern";
}

/** Aplica el atributo data-theme en <html> (no persiste). */
export function applyColorTheme(theme: ColorTheme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Persiste y aplica el tema de color. */
export function setColorTheme(theme: ColorTheme) {
  try {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
  applyColorTheme(theme);
}
