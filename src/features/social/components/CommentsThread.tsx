import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useComments } from "../hooks/useComments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Trash2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SocialComment } from "@/types/social";
import { toast } from "react-hot-toast";
import { useProfilesByUid } from "../hooks/useProfilesByUid";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const schema = z.object({
  texto: z.string().trim().min(1, "Escribe un comentario").max(1000, "Máximo 1000 caracteres"),
});

type Props = { sessionId: number; onClose?: () => void };

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export const CommentsThread = memo(function CommentsThread({ sessionId, onClose }: Props) {
  const { items, loading, hasMore, loadMore, add, remove, error } = useComments(sessionId);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { texto: "" } });
  const listRef = useRef<HTMLDivElement>(null);
  const [myUid, setMyUid] = useState<string | null>(null);

  // Estado para la confirmación de borrado
  const [pendingDelete, setPendingDelete] = useState<SocialComment | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setMyUid(data.user?.id ?? null);
    })();
  }, []);

  const uids = useMemo(() => items.map((c) => c.author_uid).filter(Boolean), [items]);
  const { map: profiles } = useProfilesByUid(uids);

  const onSubmit = useCallback(
    async (values: z.infer<typeof schema>) => {
      try {
        await add(values.texto);
        form.reset();
        (document.getElementById("comment-input") as HTMLInputElement | null)?.focus();
      } catch (e: any) {
        toast.error(e?.message ?? "No se pudo enviar el comentario");
      }
    },
    [add, form]
  );

  // Abrir diálogo de confirmación
  const requestRemove = useCallback((c: SocialComment) => {
    setPendingDelete(c);
  }, []);

  // Confirmar y eliminar
  const confirmRemove = useCallback(async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await remove(pendingDelete.id_comment);
      toast.success("Comentario eliminado");
      setPendingDelete(null);
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo eliminar el comentario");
    } finally {
      setDeleting(false);
    }
  }, [pendingDelete, remove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="w-full border-2 border-border/80 p-6 bg-gradient-to-br from-card via-card to-muted/5 rounded-xl shadow-lg"
      role="region"
      aria-label="Sección de comentarios"
    >
      <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b-2 border-border/80">
        <div className="inline-flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
            <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <h4 className="font-bold text-base text-foreground">Comentarios</h4>
        </div>
        {onClose ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-muted/80 transition-all duration-200 text-xs font-semibold rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Cerrar comentarios"
          >
            Cerrar
          </Button>
        ) : null}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="sticky top-0 z-10 bg-card pb-5 mb-5">
        <div className="flex items-center gap-2.5 p-3 border-2 border-border/80 hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-lg focus-within:shadow-primary/10 transition-all duration-200 rounded-xl shadow-sm bg-gradient-to-br from-background to-muted/10">
          <Input
            id="comment-input"
            placeholder="Escribe un comentario…"
            {...form.register("texto")}
            aria-label="Escribe un comentario"
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium placeholder:text-muted-foreground/60"
          />
          <Button
            type="submit"
            size="sm"
            disabled={form.formState.isSubmitting}
            className="shrink-0 h-9 w-9 p-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg hover:shadow-primary/25 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 rounded-lg"
            aria-label="Enviar comentario"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </form>

      {error ? (
        <div
          className="text-xs text-destructive border-2 border-destructive/50 bg-destructive/10 p-3 mb-5 rounded-lg"
          role="alert"
        >
          {String(error)}
        </div>
      ) : null}

      <div
        ref={listRef}
        className="space-y-4 max-h-[420px] overflow-y-auto pr-2"
        role="list"
        aria-label="Lista de comentarios"
      >
        <AnimatePresence mode="popLayout">
          {items.map((c) => {
            const prof = profiles[c.author_uid];
            const username = prof?.username || "Usuario";
            const avatarUrl = prof?.url_avatar || "";
            const initials =
              (username || "U")
                .split(" ")
                .map((s) => s[0]?.toUpperCase())
                .slice(0, 2)
                .join("") || "U";
            const canDelete = !!myUid && c.author_uid === myUid;

            return (
              <motion.div
                key={`comment-${c.id_comment}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-start gap-3.5 p-4 border-2 border-border/80 bg-gradient-to-br from-background via-muted/10 to-muted/20 hover:from-muted/30 hover:via-muted/40 hover:to-muted/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group rounded-xl"
                role="listitem"
              >
                <Avatar className="h-10 w-10 border-2 border-primary/20 ring-2 ring-primary/10 shadow-md">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="truncate font-bold text-sm bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {username}
                    </span>
                    <span className="text-muted-foreground/30" aria-hidden="true">
                      ·
                    </span>
                    <time dateTime={c.created_at} className="text-xs text-muted-foreground/60 tabular-nums font-medium">
                      {formatDate(c.created_at)}
                    </time>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90">
                    {c.texto}
                  </p>
                </div>

                {canDelete ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 hover:bg-destructive/15 hover:text-destructive hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 rounded-lg"
                    aria-label="Eliminar comentario"
                    onClick={() => requestRemove(c)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-8" role="status" aria-label="Cargando comentarios">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : null}

        {!loading && hasMore ? (
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void loadMore()}
              className="hover:bg-muted/80 transition-all duration-200 text-xs font-semibold rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Cargar más
            </Button>
          </div>
        ) : null}

        {!loading && !items.length && !error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="p-4 bg-gradient-to-br from-muted to-muted/80 rounded-xl mb-4 shadow-sm">
              <MessageSquare className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-muted-foreground text-center">Sé el primero en comentar.</p>
          </div>
        ) : null}
      </div>

      {/* Diálogo de confirmación de borrado */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el comentario de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmRemove()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
});
