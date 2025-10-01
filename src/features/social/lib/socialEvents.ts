// Pequeño Event Bus para sincronizar contadores en la UI sin tocar RTK ni DB.
type CountEventDetail = { sessionId: number; delta?: number };

const COMMENTS_CHANGED = "social:comments-changed";
const LIKES_CHANGED = "social:likes-changed";

export function emitCommentsChanged(sessionId: number, delta = 0) {
  window.dispatchEvent(new CustomEvent<CountEventDetail>(COMMENTS_CHANGED, { detail: { sessionId, delta } }));
}
export function onCommentsChanged(handler: (sessionId: number, delta?: number) => void) {
  const wrapped = (e: Event) => {
    const ce = e as CustomEvent<CountEventDetail>;
    handler(ce.detail.sessionId, ce.detail.delta);
  };
  window.addEventListener(COMMENTS_CHANGED, wrapped);
  return () => window.removeEventListener(COMMENTS_CHANGED, wrapped);
}

export function emitLikesChanged(sessionId: number, delta = 0) {
  window.dispatchEvent(new CustomEvent<CountEventDetail>(LIKES_CHANGED, { detail: { sessionId, delta } }));
}
export function onLikesChanged(handler: (sessionId: number, delta?: number) => void) {
  const wrapped = (e: Event) => {
    const ce = e as CustomEvent<CountEventDetail>;
    handler(ce.detail.sessionId, ce.detail.delta);
  };
  window.addEventListener(LIKES_CHANGED, wrapped);
  return () => window.removeEventListener(LIKES_CHANGED, wrapped);
}
