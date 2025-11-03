import * as React from "react";
import { useNavigate } from "react-router-dom";
import { RequestsList } from "@/features/friends/components/RequestsPanels";

type Props = {
  items: any[];
  variant: "incoming" | "outgoing";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  className?: string;
};

/* ---------- Helpers: no cambian UI, solo resuelven username/handle ---------- */

function getUsernameFromHref(href: string | null | undefined) {
  if (!href) return null;
  const m = href.match(/^\/u\/([^/?#]+)/);
  return m?.[1] ?? null;
}

/**
 * Extrae @username desde texto, evitando capturar el nombre pegado.
 * - Solo permite minúsculas, números, ".", "_", "-" (nuestros usernames están normalizados en minúsculas).
 * - Asegura que NO esté seguido de otro carácter permitido (corta justo al final del handle).
 */
function extractUsernameFromText(text: string): string | null {
  //                   ┌── grupo: 1..32 chars permitidos ┐┌─ no seguido de otro char permitido ─┐
  const m = text.match(/@([a-z0-9._-]{1,32})(?![a-z0-9._-])/);
  return m?.[1] ?? null;
}

function findUsernameInNode(el: HTMLElement): string | null {
  // 1) ¿Hay un link ya a /u/:username dentro de este nodo?
  const a = el.querySelector('a[href^="/u/"]') as HTMLAnchorElement | null;
  if (a) {
    const u = getUsernameFromHref(a.getAttribute("href"));
    if (u) return u;
  }

  // 2) ¿Hay data-username en algún descendiente?
  const withData =
    (el.closest("[data-username]") as HTMLElement | null) ??
    (el.querySelector("[data-username]") as HTMLElement | null);
  if (withData?.dataset?.username) return withData.dataset.username;

  // 3) Primer @handle en el texto de este subárbol (con extractor estricto)
  const text = el.textContent || "";
  const u = extractUsernameFromText(text);
  if (u) return u;

  return null;
}

/* ---------- Wrapper que añade navegación SIN tocar RequestsList ---------- */

const NavigableRequestsList: React.FC<Props> = ({ items, variant, onAccept, onReject, onCancel, className }) => {
  const navigate = useNavigate();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Detecta si el puntero está sobre algo “navegable” y ajusta el cursor/title.
  const handlePointerMoveCapture: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;

    // No indicar pointer sobre controles interactivos
    if (target.closest("button, [role='button'], a, input, textarea, [contenteditable='true']")) {
      if (containerRef.current) {
        containerRef.current.style.cursor = "";
        containerRef.current.removeAttribute("title");
      }
      return;
    }

    const path = (e.nativeEvent as any).composedPath?.() as EventTarget[] | undefined;
    const chain: HTMLElement[] = path
      ? path.filter((n): n is HTMLElement => n instanceof HTMLElement)
      : (() => {
          const arr: HTMLElement[] = [];
          let el: HTMLElement | null = target;
          while (el) {
            arr.push(el);
            el = el.parentElement;
          }
          return arr;
        })();

    let hoveringUsername = false;

    for (const node of chain) {
      if (!containerRef.current || !containerRef.current.contains(node)) break;

      const username =
        (node.tagName === "A" ? getUsernameFromHref((node as HTMLAnchorElement).getAttribute("href")) : null) ||
        findUsernameInNode(node);

      if (username) {
        hoveringUsername = true;
        break;
      }

      if (node === containerRef.current) break;
    }

    if (containerRef.current) {
      containerRef.current.style.cursor = hoveringUsername ? "pointer" : "";
      if (hoveringUsername) {
        containerRef.current.setAttribute("title", "Ver perfil");
      } else {
        containerRef.current.removeAttribute("title");
      }
    }
  };

  // Usa capture para adelantarse a handlers internos que hacen stopPropagation
  const handlePointerUpCapture: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;

    // No navegar si fue sobre controles interactivos
    if (target.closest("button, [role='button'], a, input, textarea, [contenteditable='true']")) return;

    const path = (e.nativeEvent as any).composedPath?.() as EventTarget[] | undefined;

    // Recorremos desde el nodo clicado hacia arriba hasta el wrapper
    const chain: HTMLElement[] = path
      ? path.filter((n): n is HTMLElement => n instanceof HTMLElement)
      : (() => {
          const arr: HTMLElement[] = [];
          let el: HTMLElement | null = target;
          while (el) {
            arr.push(el);
            el = el.parentElement;
          }
          return arr;
        })();

    for (const node of chain) {
      if (!containerRef.current || !containerRef.current.contains(node)) break;

      const username =
        (node.tagName === "A" ? getUsernameFromHref((node as HTMLAnchorElement).getAttribute("href")) : null) ||
        findUsernameInNode(node);

      if (username) {
        navigate(`/u/${username}`);
        return;
      }

      // Si llegamos al contenedor, paramos
      if (node === containerRef.current) break;
    }
  };

  return (
    <div
      ref={containerRef}
      data-requests-navigable
      onPointerMoveCapture={handlePointerMoveCapture}
      onPointerUpCapture={handlePointerUpCapture}
      className={className}
    >
      {/* Estilo opcional: subraya anchors a /u/:username al hacer hover */}
      <style>
        {`
          [data-requests-navigable] a[href^="/u/"] { text-decoration: none; }
          [data-requests-navigable] a[href^="/u/"]:hover { text-decoration: underline; }
        `}
      </style>

      <RequestsList items={items} variant={variant} onAccept={onAccept} onReject={onReject} onCancel={onCancel} />
    </div>
  );
};

export default NavigableRequestsList;
