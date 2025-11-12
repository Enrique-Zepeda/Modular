import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useProfileFriends } from "../hooks/useProfileFriends";
import { Users, UserMinus, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import UserAvatar from "@/components/ui/user-avatar"; // default import
import type { Sexo } from "@/lib/avatar";

type Props = {
  username: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  className?: string;
  canManageFriends?: boolean;
  /** 🔔 callback para notificar cambios al padre (ProfilePage) */
  onFriendsChanged?: () => void;
};

function normalize(s: string) {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ✅ normaliza a "M" | "F" | null (corregido)
function normalizeSexo(input: unknown): Sexo | null {
  if (input == null) return null;
  const x = String(input).trim().toLowerCase();

  // códigos numéricos comunes
  if (x === "1") return "M"; // 1 = masculino (común)
  if (x === "2") return "F"; // 2 = femenino (común)
  if (x === "0") return null; // desconocido

  // textos
  if (["m", "masc", "masculino", "male", "hombre"].includes(x)) return "M";
  if (["f", "fem", "femenino", "female", "mujer"].includes(x)) return "F";

  return null;
}

// trata "", "null", "undefined" como vacío real
function sanitizeUrl(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s || s === "null" || s === "undefined") return null;
  return s;
}

// ignora placeholders masculinos cuando sexo = "F"
function stripMalePlaceholderIfFemale(url: string | null, sexo: Sexo | null): string | null {
  if (!url) return url;
  if (sexo !== "F") return url;
  // Heurística: si la ruta parece un placeholder masculino, fuerza fallback por sexo
  if (/(default|placeholder|generic).*(male|man|hombre)/i.test(url)) {
    return null;
  }
  return url;
}

export default function ProfileFriendsModal({
  username,
  open,
  onOpenChange,
  className,
  canManageFriends = false,
  onFriendsChanged,
}: Props) {
  const { friends, isLoading, isError, error, refetch } = useProfileFriends(username);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  // 🔎 estado de búsqueda local
  const [query, setQuery] = React.useState("");

  // Filtrado por nombre o username (diacríticos-insensitive)
  const filteredFriends = React.useMemo(() => {
    const q = normalize(query);
    if (!q) return friends;
    return friends.filter((f) => {
      const u = normalize((f as any).username ?? "");
      const n = normalize((f as any).nombre ?? "");
      return u.includes(q) || n.includes(q);
    });
  }, [friends, query]);

  React.useEffect(() => {
    if (!open) return;
    refetch();
  }, [open, refetch]);

  const notifyChange = React.useCallback(() => {
    onFriendsChanged?.();
    window.dispatchEvent(new CustomEvent("friends:changed"));
  }, [onFriendsChanged]);

  const handleUnfriend = async (friendId: string, friendHandle: string) => {
    const other = Number(friendId);
    if (!Number.isFinite(other)) {
      toast.error("Id de usuario inválido.");
      return;
    }
    setPendingId(friendId);
    const t = toast.loading("Eliminando…");
    try {
      const { data: meId, error: meErr } = await supabase.rpc("current_usuario_id");
      if (meErr) throw meErr;
      if (!meId) throw new Error("No se pudo resolver tu usuario.");

      const { error: delErr } = await supabase
        .from("Amigos")
        .delete()
        .or(
          `and(id_usuario1.eq.${meId},id_usuario2.eq.${other}),` + `and(id_usuario1.eq.${other},id_usuario2.eq.${meId})`
        );

      if (delErr) throw delErr;

      toast.success(`Has eliminado a @${friendHandle}.`, { id: t });
      await refetch();
      notifyChange();
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo eliminar.", { id: t });
    } finally {
      setPendingId(null);
    }
  };

  const list = query ? filteredFriends : friends;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className={cn("sm:max-w-lg p-0 overflow-hidden border-2 border-border/60", className)}
      >
        <DialogHeader className="px-6 pt-8 pb-4 border-b border-border/60 bg-gradient-to-br from-background to-muted/5">
          <DialogTitle aria-describedby={undefined} className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2.5 bg-primary/10 rounded-lg ring-1 ring-primary/20">
              <Users className="size-5 text-primary" />
            </div>
            <span className="truncate">Amigos de {username?.replace(/^@+/, "")}</span>
          </DialogTitle>

          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o @usuario…"
                className="pl-9 h-10"
                inputMode="search"
                spellCheck="false"
                aria-label="Buscar amigos"
                autoFocus
              />
            </div>
            {query && (
              <div className="text-xs text-muted-foreground">
                {list.length} de {friends.length} coinciden
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 py-4 max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-muted/40 animate-pulse"
                  role="status"
                  aria-label="Cargando…"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-center">
              <div className="p-4 rounded-full bg-destructive/10 mb-3 w-fit mx-auto">
                <Users className="h-6 w-6 text-destructive/60" />
              </div>
              <p className="text-sm font-medium text-destructive mb-1">No se pudo cargar la lista</p>
              <p className="text-xs text-muted-foreground">{(error as any) ?? "Intenta recargar la página."}</p>
            </div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-3 w-fit mx-auto">
                <Users className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {query ? "No se encontraron amigos" : "Sin amigos aún"}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {query ? `No hay amigos que coincidan con "${query}".` : "Este usuario aún no tiene amigos."}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <ul className="space-y-2">
                {list.map((f: any) => {
                  // Compat: soporta distintas formas de la fila
                  const id = String(f.id ?? f.id_usuario ?? f.user_id ?? f.userId ?? "");
                  const usernameRow = f.username ?? f.handle ?? "";
                  const nombreRow = f.nombre ?? null;
                  const urlAvatar = f.url_avatar ?? f.avatarUrl ?? null;
                  const sexoRaw = f.sexo ?? null;

                  // Detectar usuario anidado + normalizar campos (sin borrar nada)
                  const u = f.usuario ?? f.user ?? f.perfil ?? f.profile ?? f.friend ?? f.amigo ?? f.other ?? f; // fallback

                  // Derivados robustos (mantienen tus valores originales como fallback)
                  const usernameDerived: string = String(u.username ?? usernameRow ?? "");
                  const nombreDerived: string | null = (u.nombre ?? nombreRow ?? null) as string | null;

                  const sexoDerived: Sexo | null = normalizeSexo(u.sexo ?? sexoRaw ?? null);

                  // URL final (limpia y, si hace falta, forzamos placeholder femenino)
                  const urlAvatarSanitized: string | null = sanitizeUrl(
                    u.url_avatar ?? u.avatarUrl ?? urlAvatar ?? null
                  );
                  const urlFinal = stripMalePlaceholderIfFemale(urlAvatarSanitized, sexoDerived);

                  // Iniciales
                  const initialDerived = (nombreDerived?.[0] || usernameDerived?.[0] || "?").toUpperCase();

                  const isPending = pendingId === id;

                  return (
                    <li
                      key={id}
                      className="p-3 flex items-center gap-3 rounded-xl border-2 border-border/60 bg-gradient-to-br from-card/95 to-card/90 hover:border-primary/40 hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/40"
                    >
                      <Link
                        to={`/u/${usernameDerived}`}
                        className="flex items-center gap-3 min-w-0 flex-1 group outline-none rounded"
                        onClick={() => onOpenChange(false)}
                        aria-label={`Ir al perfil de ${nombreDerived || usernameDerived}`}
                      >
                        <UserAvatar
                          url={urlFinal}
                          sexo={sexoDerived}
                          alt={`Avatar de ${usernameDerived}`}
                          size={48} // h-12 w-12
                          className="border-2 border-primary/20 ring-2 ring-primary/10 shadow-sm flex-shrink-0"
                          imageClassName="object-cover" // evita recorte
                          fallbackText={initialDerived}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate group-hover:underline">
                            {nombreDerived ?? `@${usernameDerived}`}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">@{usernameDerived}</div>
                        </div>
                      </Link>

                      {canManageFriends && id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                              disabled={isPending}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Eliminar a ${usernameDerived} de amigos`}
                              title="Eliminar de amigos"
                            >
                              {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline">{isPending ? "Eliminando…" : "Eliminar"}</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar de amigos</AlertDialogTitle>
                              <AlertDialogDescription>
                                Quitarás a <strong>@{usernameDerived}</strong> de tu lista de amigos. Esta acción no
                                puede deshacerse.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleUnfriend(id, usernameDerived)}
                              >
                                Confirmar eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
