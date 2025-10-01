import * as React from "react";
import { useParams } from "react-router-dom";
import {
  useGetMyProfileQuery,
  useGetProfileByUsernameQuery,
  useGetProfileSummaryByUsernameQuery,
} from "@/features/profile/api/userProfileApi";
import ProfileCard from "@/features/profile/components/ProfileCard";
import ProfileStats from "@/features/profile/components/ProfileStats";
import ProfileFriendsModal from "@/features/profile/components/ProfileFriendsModal";
import ProfileWorkoutsList from "@/features/profile/components/ProfileWorkoutsList";

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
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const summary = summaryQ.data ?? null;

  // Refrescar KPIs si cambian amistades (contador)
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

      {/* ✅ Usa el mismo WorkoutCard del feature de workouts */}
      {targetUsername && (
        <ProfileWorkoutsList username={targetUsername} avatarUrl={profile?.url_avatar ?? null} isMine={isSelf} />
      )}

      {targetUsername && (
        <ProfileFriendsModal
          username={targetUsername}
          open={openFriends}
          onOpenChange={setOpenFriends}
          canManageFriends={isSelf}
          onFriendsChanged={() => summaryQ.refetch()}
        />
      )}
    </div>
  );
}
