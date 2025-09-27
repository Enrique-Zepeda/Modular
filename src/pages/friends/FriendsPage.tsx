import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useListOutgoingRequestsQuery } from "@/features/friends/api/friendsApi";
import { FriendsList, UserResultCard, UserSearchInput } from "@/features/friends/components";
import { useFriendActions, useFriends, useFriendSearch } from "@/features/friends/hooks";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
/** ✅ importamos sólo para “marcar” pendientes en la búsqueda */

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
      <h1 className="text-xl font-semibold">Amigos</h1>

      <Tabs defaultValue="search" className="w-full">
        <TabsList>
          <TabsTrigger value="search">Buscar</TabsTrigger>
          <TabsTrigger value="list">Mis amigos</TabsTrigger>
        </TabsList>

        {/* ----- Buscar usuarios (con estado Amigo/Pendiente) ----- */}
        <TabsContent value="search" className="space-y-4">
          <UserSearchInput value={term} onChange={setTerm} placeholder="Buscar por username…" />
          {isFetching && <div className="text-sm text-muted-foreground">Buscando…</div>}
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
            {!isFetching && !results.length && (
              <div className="text-sm text-muted-foreground">Escribe para buscar por username.</div>
            )}
          </div>
        </TabsContent>

        {/* ----- Mis amigos ----- */}
        <TabsContent value="list">
          <FriendsList friends={friends} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
