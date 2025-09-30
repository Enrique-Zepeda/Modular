import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useComments } from "../hooks/useComments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SocialComment } from "@/types/social";
import { toast } from "react-hot-toast";
import { useProfilesByUid } from "../hooks/useProfilesByUid";
import { supabase } from "@/lib/supabase/client";

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

  const handleRemove = useCallback(
    async (c: SocialComment) => {
      try {
        await remove(c.id_comment);
      } catch (e: any) {
        toast.error(e?.message ?? "No se pudo eliminar el comentario");
      }
    },
    [remove]
  );

  return (
    <div className="w-full rounded-2xl border p-3 md:p-4 bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <h4 className="font-semibold">Comentarios</h4>
        </div>
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        ) : null}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 mb-3">
        <Input
          id="comment-input"
          placeholder="Escribe un comentario…"
          {...form.register("texto")}
          aria-label="Escribe un comentario"
        />
        <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
        </Button>
      </form>

      {error ? (
        <div className="text-xs text-destructive/90 border border-destructive/40 bg-destructive/10 rounded-md p-2 mb-3">
          {String(error)}
        </div>
      ) : null}

      <div ref={listRef} className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
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
            <div key={`comment-${c.id_comment}`} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{username}</span>
                  <span>•</span>
                  <time dateTime={c.created_at}>{formatDate(c.created_at)}</time>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{c.texto}</p>
              </div>
              {canDelete ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Eliminar comentario"
                  onClick={() => void handleRemove(c)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          );
        })}

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : null}

        {!loading && hasMore ? (
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => void loadMore()}>
              Cargar más
            </Button>
          </div>
        ) : null}

        {!loading && !items.length && !error ? (
          <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>
        ) : null}
      </div>
    </div>
  );
});
