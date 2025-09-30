import * as React from "react";
import { useParams } from "react-router-dom";
import {
  useGetMyProfileQuery,
  useGetProfileByUsernameQuery,
  useGetProfileSummaryByUsernameQuery,
} from "@/features/profile/api/userProfileApi";
import ProfileCard from "@/features/profile/components/ProfileCard";
import ProfileStats from "@/features/profile/components/ProfileStats";
import LastWorkoutSummaryCard from "@/features/profile/components/LastWorkoutSummaryCard";
import ProfileFriendsModal from "@/features/profile/components/ProfileFriendsModal";

export default function ProfilePage() {
  const { username } = useParams<{ username?: string }>();
  const isSelf = !username;

  const [openFriends, setOpenFriends] = React.useState(false);

  // Card básica
  const my = useGetMyProfileQuery(undefined, { skip: !isSelf });
  const other = useGetProfileByUsernameQuery({ username: username! }, { skip: isSelf });
  const profile = isSelf ? my.data : other.data ?? null;

  // KPIs (públicos, v2)
  const targetUsername = isSelf ? my.data?.username ?? "" : username ?? "";
  const summaryQ = useGetProfileSummaryByUsernameQuery(
    { username: targetUsername },
    {
      skip: !targetUsername,
      // 👇 asegura refresco al montar, cambiar arg, recuperar foco o red conectividad
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const summary = summaryQ.data ?? null;

  // 🔔 Escuchar cambios globales de amistades (emitidos desde modal/búsqueda)
  React.useEffect(() => {
    const handler = () => summaryQ.refetch();
    window.addEventListener("friends:changed", handler);
    return () => window.removeEventListener("friends:changed", handler);
  }, [summaryQ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isSelf ? "Mi perfil" : profile ? `Perfil de @${profile.username}` : "Perfil"}
      </h1>

      <ProfileCard
        variant="full"
        displayName={profile?.nombre ?? null}
        username={profile?.username ?? null}
        avatarUrl={profile?.url_avatar ?? null}
      />

      <ProfileStats
        summary={summary}
        loading={summaryQ.isLoading}
        hideLastPanel
        onFriendsClick={() => setOpenFriends(true)}
      />

      {targetUsername && (
        <LastWorkoutSummaryCard
          username={targetUsername}
          displayName={profile?.nombre ?? null}
          avatarUrl={profile?.url_avatar ?? null}
        />
      )}

      {targetUsername && (
        <ProfileFriendsModal
          username={targetUsername}
          open={openFriends}
          onOpenChange={setOpenFriends}
          canManageFriends={isSelf}
          // ✅ cuando cambia la lista, refrescamos el summary (contador)
          onFriendsChanged={() => summaryQ.refetch()}
        />
      )}
    </div>
  );
}
