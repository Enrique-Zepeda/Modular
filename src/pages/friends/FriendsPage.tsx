import { Tabs } from "@/components/ui/tabs";
import { useListOutgoingRequestsQuery } from "@/features/friends/api/friendsApi";
import { FriendsList, UserResultCard, UserSearchInput } from "@/features/friends/components";
import { useFriendActions, useFriends, useFriendSearch } from "@/features/friends/hooks";
import { TabsContent } from "@radix-ui/react-tabs";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export default function FriendsPage() {
  const [params] = useSearchParams();
  const scope = params.get("scope"); // 'users' | null
  const qParam = params.get("q") || "";
  const comingFromUsersSearch = scope === "users" && qParam.trim().length > 0;

  // Buscar usuarios (global)
  const { term, setTerm, results, isFetching } = useFriendSearch(comingFromUsersSearch ? qParam : "");

  // Lista real de mis amigos
  const { friends } = useFriends();

  // ✅ Sólo para mostrar “Pendiente” en resultados (no listamos aquí)
  const { data: outgoing = [] } = useListOutgoingRequestsQuery();

  const actions = useFriendActions();

  const friendsIds = useMemo(() => new Set(friends.map((f) => f.id_usuario)), [friends]);
  const outgoingIds = useMemo(() => new Set(outgoing.map((r) => r.destinatario_id)), [outgoing]);

  return (
    <div className="space-y-6">
      {/* Enhanced header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Amigos
        </h1>
        <p className="text-sm text-muted-foreground">Conecta con otros usuarios y expande tu red de entrenamiento</p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        {/* ----- Buscar usuarios (con estado Amigo/Pendiente) ----- */}
        <TabsContent value="search" className="space-y-4 mt-6">
          <UserSearchInput value={term} onChange={setTerm} placeholder="Buscar por username…" />

          {isFetching && (
            <div className="text-sm text-muted-foreground flex items-center gap-2 justify-center py-8">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Buscando usuarios...
            </div>
          )}

          <div className="grid gap-3">
            {results.map((u) => {
              const status = friendsIds.has(u.id_usuario)
                ? "friend"
                : outgoingIds.has(u.id_usuario)
                ? "pending-out"
                : "none";
              return (
                <UserResultCard key={u.id_usuario} user={u} status={status as any} onSend={(id) => actions.send(id)} />
              );
            })}
            {!isFetching && !results.length && term.trim() === "" && (
              <div className="text-center py-12 space-y-3">
                <div className="text-4xl opacity-20">🔍</div>
                <div className="text-sm text-muted-foreground">Escribe para buscar por username</div>
                <div className="text-xs text-muted-foreground/60">Encuentra amigos y compañeros de entrenamiento</div>
              </div>
            )}
            {!isFetching && !results.length && term.trim() !== "" && (
              <div className="text-center py-12 space-y-3">
                <div className="text-4xl opacity-20">😕</div>
                <div className="text-sm text-muted-foreground">No se encontraron usuarios</div>
                <div className="text-xs text-muted-foreground/60">Intenta con otro username</div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ----- Mis amigos ----- */}
        <TabsContent value="list" className="mt-6">
          <FriendsList friends={friends} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
