// FILE: src/pages/profile/ProfilePage.tsx
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

  // Estado del modal de amigos (solo existe aquí)
  const [openFriends, setOpenFriends] = React.useState(false);

  // Card básica
  const my = useGetMyProfileQuery(undefined, { skip: !isSelf });
  const other = useGetProfileByUsernameQuery({ username: username! }, { skip: isSelf });
  const profile = isSelf ? my.data : other.data ?? null;

  // KPIs (públicos, v2)
  const targetUsername = isSelf ? my.data?.username ?? "" : username ?? "";
  const summaryQ = useGetProfileSummaryByUsernameQuery({ username: targetUsername }, { skip: !targetUsername });
  const summary = summaryQ.data ?? null;

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

      {/* Hacemos la tarjeta "Amigos" clickeable desde aquí */}
      <ProfileStats
        summary={summary}
        loading={summaryQ.isLoading}
        hideLastPanel
        onFriendsClick={() => setOpenFriends(true)}
      />

      {/* Último entrenamiento COMPLETO (sin likes/comentarios) */}
      {targetUsername && (
        <LastWorkoutSummaryCard
          username={targetUsername}
          displayName={profile?.nombre ?? null}
          avatarUrl={profile?.url_avatar ?? null}
        />
      )}

      {/* Modal de amistades — solo se renderiza aquí */}
      {targetUsername && (
        <ProfileFriendsModal username={targetUsername} open={openFriends} onOpenChange={setOpenFriends} />
      )}
    </div>
  );
}
