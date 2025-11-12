import * as React from "react";
import { Search, Users, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useSearchUsersQuery } from "@/features/friends/api";
import FriendshipBadge from "@/features/friends/components/FriendshipBadge";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "@/components/ui/user-avatar";

const MIN_CHARS = 2; // escribe al menos 2 letras para buscar
const LIMIT = 10; // máximo de resultados a mostrar

export default function FriendsPage() {
  const [term, setTerm] = React.useState("");

  // 🔎 Debounce para no saturar peticiones
  const [debounced, setDebounced] = React.useState(term);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [term]);

  // ⛔️ skip si no se alcanzó el mínimo
  const q = useSearchUsersQuery({ term: debounced, limit: LIMIT }, { skip: debounced.length < MIN_CHARS });

  // seguridad por si el backend devolviera más de lo pedido
  const results = (q.data ?? []).slice(0, LIMIT);

  const showEmptyState = debounced.length < MIN_CHARS || results.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-10 border-2 border-border/60 backdrop-blur-xl shadow-2xl shadow-primary/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex items-center gap-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/30 to-accent/20 ring-2 ring-primary/30 shadow-2xl shadow-primary/30">
            <Users className="h-10 w-10 text-primary drop-shadow-lg" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl opacity-50 animate-pulse" />
          </div>

          <div className="flex-1">
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary/90 to-accent/90 bg-clip-text text-transparent drop-shadow-sm text-balance">
              Amigos
            </h1>
            <p className="text-muted-foreground mt-3 text-lg leading-relaxed font-medium text-pretty">
              Conecta con otros usuarios y expande tu red de entrenamiento
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative max-w-3xl"
      >
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
            <div className="relative">
              <Search className="h-5 w-5 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
              <div className="absolute inset-0 bg-primary/30 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por @usuario o nombre…"
            className="pl-12 h-14 text-base border-2 border-border/60 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-200 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl"
            inputMode="search"
            spellCheck={false}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden border-2 border-border/60 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none opacity-30" />

          <div className="relative">
            {q.isFetching ? (
              <div className="p-12 text-center space-y-4">
                <div className="inline-flex items-center justify-center gap-3">
                  <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin shadow-lg" />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-semibold text-foreground">Buscando usuarios</p>
                  <p className="text-sm text-muted-foreground">Esto solo tomará un momento...</p>
                </div>
              </div>
            ) : showEmptyState ? (
              <div className="p-12 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-muted/50 to-muted/30 ring-2 ring-border/50">
                      {debounced.length < MIN_CHARS ? (
                        <UserPlus className="h-12 w-12 text-muted-foreground/70" />
                      ) : (
                        <Search className="h-12 w-12 text-muted-foreground/70" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">
                    {debounced.length < MIN_CHARS ? "Busca nuevos amigos" : "No se encontraron usuarios"}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto text-pretty">
                    {debounced.length < MIN_CHARS
                      ? `Escribe al menos ${MIN_CHARS} caracteres para comenzar a buscar`
                      : "Intenta con otro nombre de usuario o ajusta tu búsqueda"}
                  </p>
                </div>
              </div>
            ) : (
              <ul>
                <AnimatePresence initial={false}>
                  {results.map((u: any, idx: number) => {
                    const initials =
                      (u.nombre || u.username || "?")
                        .split(" ")
                        .map((s: string) => s.charAt(0).toUpperCase())
                        .slice(0, 2)
                        .join("") || "?";

                    return (
                      <motion.li
                        key={u.id_usuario}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <div className="group px-6 py-5 hover:bg-gradient-to-r hover:from-primary/5 hover:via-accent/5 hover:to-transparent transition-all duration-300 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div className="flex items-center gap-4">
                            <Link to={`/u/${u.username}`} className="flex items-center gap-4 min-w-0 flex-1 group/link">
                              <div className="relative">
                                <UserAvatar
                                  url={u.url_avatar}
                                  sexo={u.sexo}
                                  alt={`Avatar de ${u.username}`}
                                  size={48} //  h-12 w-12
                                  className="ring-2 ring-transparent group-hover/link:ring-primary/30 transition-all duration-300 shadow-md group-hover/link:shadow-lg"
                                  fallbackText={
                                    (u.nombre || u.username || "?")
                                      .split(" ")
                                      .map((s: string) => s.charAt(0).toUpperCase())
                                      .slice(0, 2)
                                      .join("") || "?"
                                  }
                                  imageClassName="object-cover"
                                />
                                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover/link:opacity-50 transition-opacity duration-300" />
                              </div>

                              <div className="min-w-0 space-y-1">
                                <div className="font-bold text-base truncate group-hover/link:text-primary transition-colors duration-200">
                                  {u.nombre ?? `@${u.username}`}
                                </div>
                                <div className="text-sm text-muted-foreground truncate font-medium">@{u.username}</div>
                              </div>
                            </Link>

                            <FriendshipBadge
                              targetId={u.id_usuario}
                              targetUsername={u.username}
                              className={cn(
                                "ml-auto flex-shrink-0 shadow-sm hover:shadow-md transition-shadow duration-200"
                              )}
                            />
                          </div>
                        </div>

                        {idx < results.length - 1 && (
                          <Separator className="m-0 bg-gradient-to-r from-transparent via-border to-transparent" />
                        )}
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
