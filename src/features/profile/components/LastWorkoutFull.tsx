import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, Clock, Activity, MessageCircle, Heart } from "lucide-react";
import { useGetWorkoutCardByIdQuery } from "@/features/profile/api/userProfileApi";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import * as React from "react";

function fmtHM(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}
function fmtKg(n: number) {
  const fixed = Number.isInteger(n) ? n : Number(n.toFixed(1));
  return `${fixed.toLocaleString()} kg`;
}

type Comment = {
  id_comment: number;
  author_uid: string;
  created_at: string;
  texto: string;
  username: string | null;
  url_avatar: string | null;
};

export default function LastWorkoutFull({
  sessionId,
  username,
  avatarUrl,
  displayName,
}: {
  sessionId: number;
  username: string | null;
  avatarUrl: string | null;
  displayName: string | null;
}) {
  const { data, isLoading, refetch } = useGetWorkoutCardByIdQuery({ sessionId }, { skip: !sessionId });

  const initials = (displayName || username || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // --- Likes state (toggle) ---
  const [liked, setLiked] = React.useState<boolean>(false);
  const [likesCount, setLikesCount] = React.useState<number>(data?.likes_count ?? 0);
  React.useEffect(() => setLikesCount(data?.likes_count ?? 0), [data?.likes_count]);

  React.useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid || !sessionId) return;
        const { data: rows } = await supabase
          .from("SocialLikes")
          .select("id_like")
          .eq("id_sesion", sessionId)
          .eq("author_uid", uid)
          .limit(1);
        setLiked((rows?.length ?? 0) > 0);
      } catch {
        /* ignore */
      }
    })();
  }, [sessionId]);

  const onToggleLike = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return toast.error("Inicia sesión para interactuar");

      if (!liked) {
        const { error } = await supabase.from("SocialLikes").insert({ id_sesion: sessionId }); // author_uid lo impone RLS
        if (error) throw error;
        setLiked(true);
        setLikesCount((x) => x + 1);
      } else {
        const { error } = await supabase.from("SocialLikes").delete().eq("id_sesion", sessionId).eq("author_uid", uid);
        if (error) throw error;
        setLiked(false);
        setLikesCount((x) => Math.max(0, x - 1));
      }
    } catch {
      toast.error("No tienes permisos para esta acción.");
    }
  };

  // --- Comments state (list + add) ---
  const [comments, setComments] = React.useState<Comment[] | null>(null);
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [text, setText] = React.useState("");

  const loadComments = React.useCallback(async () => {
    if (!sessionId) return;
    setLoadingComments(true);
    try {
      const { data: rows } = await supabase
        .from("SocialComments")
        .select("id_comment, author_uid, created_at, texto, Usuarios:author_uid (username, url_avatar)")
        .eq("id_sesion", sessionId)
        .order("created_at", { ascending: false });
      const mapped: Comment[] =
        (rows as any[])?.map((r) => ({
          id_comment: r.id_comment,
          author_uid: r.author_uid,
          created_at: r.created_at,
          texto: r.texto,
          username: r.Usuarios?.username ?? null,
          url_avatar: r.Usuarios?.url_avatar ?? null,
        })) ?? [];
      setComments(mapped);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [sessionId]);

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  const onAddComment = async () => {
    const value = text.trim();
    if (!value) return;
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return toast.error("Inicia sesión para comentar");
      const { error } = await supabase.from("SocialComments").insert({ id_sesion: sessionId, texto: value });
      if (error) throw error;
      setText("");
      await loadComments();
      await refetch();
    } catch {
      toast.error("No puedes comentar este entrenamiento.");
    }
  };

  if (!sessionId) return null;

  return (
    <Card className="bg-muted/30 border-muted/40">
      <CardContent className="p-5">
        {isLoading || !data ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Header: título + autor/fecha */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{data.routine_name || "Entrenamiento"}</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={avatarUrl ?? undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{username ? `@${username}` : "Usuario"}</span>
                  <span>•</span>
                  <span>{new Date(data.ended_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Chips como WorkoutCard */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                <Activity className="mr-1 h-4 w-4" />
                {data.sets_count} sets
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                <Dumbbell className="mr-1 h-4 w-4" />
                {fmtKg(data.total_volume_kg)}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                <Clock className="mr-1 h-4 w-4" />
                {fmtHM(data.duracion_seg)}
              </Badge>
              {data.difficulty_label && <Badge className="rounded-full px-3 py-1">{data.difficulty_label}</Badge>}
            </div>

            {/* Lista de ejercicios (estilo pill) */}
            <div className="space-y-2">
              {data.exercises.map((ex) => (
                <div
                  key={ex.id_ejercicio}
                  className="flex items-center gap-3 rounded-xl border border-muted/40 bg-background/40 px-4 py-3"
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-muted/50 shrink-0">
                    {ex.imagen_url ? (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <img src={ex.imagen_url} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{ex.nombre}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {ex.sets_count} sets
                    </Badge>
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {fmtKg(ex.volume_kg)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer social (toggle like + conteo comentarios) */}
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={onToggleLike}
                className={`flex items-center gap-1 rounded-full px-3 py-1 ${
                  liked ? "bg-pink-600/30 text-pink-400" : "bg-pink-600/20 text-pink-400"
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>{likesCount}</span>
              </button>

              <div className="flex items-center gap-1 rounded-full bg-blue-600/20 px-3 py-1 text-blue-400">
                <MessageCircle className="h-4 w-4" />
                <span>{data.comments_count}</span>
              </div>
            </div>

            {/* Comentarios */}
            <div className="rounded-xl border border-muted/40 bg-background/40">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm font-medium">Comentarios</div>
              </div>
              <div className="px-4 pb-3">
                {loadingComments ? (
                  <Skeleton className="h-24 w-full" />
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {comments.map((c) => (
                      <div key={c.id_comment} className="rounded-xl border border-muted/40 bg-muted/10 p-3">
                        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={c.url_avatar ?? undefined} />
                            <AvatarFallback>{(c.username ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{c.username ? `@${c.username}` : "usuario"}</span>
                          <span>•</span>
                          <span>{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-sm">{c.texto}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No hay comentarios.</div>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-muted/40 px-4 py-3">
                <input
                  className="flex-1 rounded-full bg-muted/20 px-4 py-2 text-sm outline-none"
                  placeholder="Escribe un comentario…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onAddComment();
                  }}
                />
                <button
                  onClick={onAddComment}
                  className="rounded-full bg-primary px-3 py-2 text-primary-foreground text-sm"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
