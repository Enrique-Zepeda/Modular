import type React from "react";

const CTRL_META_KEYS = new Set(["a", "c", "v", "x"]);

export function sanitizeInteger(raw: string) {
  return raw.replace(/\D+/g, "");
}

export function sanitizeDecimal(raw: string) {
  if (!raw) return "";
  const s = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const parts = s.split(".");
  if (parts.length <= 1) return s;
  return parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
}

function allowKey(e: React.KeyboardEvent<HTMLInputElement>, allowDot: boolean) {
  const k = e.key;
  const isCtrlMeta = e.ctrlKey || e.metaKey;
  if (isCtrlMeta && CTRL_META_KEYS.has(k.toLowerCase())) return true;
  if (["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(k)) return true;
  if (k >= "0" && k <= "9") return true;
  if (allowDot && (k === "." || k === ",")) {
    const val = (e.currentTarget.value || "").replace(",", ".");
    if (!val.includes(".")) return true;
  }
  return false;
}

export function onIntegerKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (!allowKey(e, false)) e.preventDefault();
}

export function onDecimalKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (!allowKey(e, true)) e.preventDefault();
}

export function handlePasteInteger(e: React.ClipboardEvent<HTMLInputElement>, onChange: (v: string) => void) {
  e.preventDefault();
  const text = (e.clipboardData || (window as any).clipboardData).getData("text");
  onChange(sanitizeInteger(text));
}

export function handlePasteDecimal(e: React.ClipboardEvent<HTMLInputElement>, onChange: (v: string) => void) {
  e.preventDefault();
  const text = (e.clipboardData || (window as any).clipboardData).getData("text");
  onChange(sanitizeDecimal(text));
}
