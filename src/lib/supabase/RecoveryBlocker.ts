// Bloquea lecturas/escrituras del storage SOLO mientras está activo.
// Úsalo solo durante /auth/reset-password y desactívalo al salir.
type LS = Storage;

let active = false;
let patched = false;
let originalGetItem: LS["getItem"] | null = null;
let originalSetItem: LS["setItem"] | null = null;
let originalRemoveItem: LS["removeItem"] | null = null;

const AUTH_KEY_PREFIX = "sb-"; // ej: sb-xxxx-auth-token

function shouldBlockKey(key: string | null) {
  if (!key) return false;
  // bloquea únicamente las claves de supabase (auth)
  return key.startsWith(AUTH_KEY_PREFIX) && key.endsWith("-auth-token");
}

function patchStorage() {
  if (patched) return;
  patched = true;

  originalGetItem = window.localStorage.getItem.bind(window.localStorage);
  originalSetItem = window.localStorage.setItem.bind(window.localStorage);
  originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

  window.localStorage.getItem = (k: string) => {
    if (active && shouldBlockKey(k)) {
      return null;
    }
    return originalGetItem!(k);
  };

  window.localStorage.setItem = (k: string, v: string) => {
    if (active && shouldBlockKey(k)) {
      return;
    }
    return originalSetItem!(k, v);
  };

  window.localStorage.removeItem = (k: string) => {
    if (active && shouldBlockKey(k)) {
      return;
    }
    return originalRemoveItem!(k);
  };
}

export function enableRecoveryBlocker() {
  if (typeof window === "undefined") return;
  patchStorage();
  active = true;
}

export function disableRecoveryBlocker() {
  active = false;
}

// Utilidad: ¿esta URL es de recuperación?
export function isRecoveryUrl(loc: Location = window.location) {
  const hash = loc.hash?.slice(1) || "";
  const search = loc.search?.slice(1) || "";
  const hp = new URLSearchParams(hash);
  const qp = new URLSearchParams(search);
  const type = (hp.get("type") || qp.get("type") || "").toLowerCase();
  const hasAccess = hp.get("access_token") || qp.get("access_token");
  const hasRefresh = hp.get("refresh_token") || qp.get("refresh_token");
  return type === "recovery" && !!(hasAccess && hasRefresh);
}
