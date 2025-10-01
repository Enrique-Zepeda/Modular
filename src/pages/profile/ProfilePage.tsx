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
import { useTrainingProfile } from "@/features/profile/hooks/useTrainingProfile";
import ProfileMainExercise from "@/features/profile/components/ProfileMainExercise";

// pequeño helper para color de fondo translúcido a partir de hex
function hexToRgba(hex: string, alpha = 0.12) {
  const m = hex.replace("#", "").match(/^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
  if (!m) return `rgba(0,0,0,${alpha})`;
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

  // Perfil de entrenamiento (badge global)
  const training = useTrainingProfile(targetUsername);

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

      {/* Badge de “Perfil de entrenamiento” (visible, no intrusivo) */}
      {training.badge && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Perfil de entrenamiento:</span>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{
              color: training.badge.color,
              background: hexToRgba(training.badge.color, 0.12),
              borderColor: training.badge.color,
            }}
            title={`Promedio: ${training.badge.avgScore} (${training.badge.samples} sesiones)`}
          >
            {training.badge.title}
          </span>
        </div>
      )}
      {targetUsername && <ProfileMainExercise username={targetUsername} />}
      <ProfileStats
        summary={summary}
        loading={summaryQ.isLoading}
        hideLastPanel
        onFriendsClick={() => setOpenFriends(true)}
      />

      {/* Lista de TODOS los entrenamientos */}
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
