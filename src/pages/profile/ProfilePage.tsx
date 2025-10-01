import * as React from "react";
import { useParams } from "react-router-dom";
import {
  useGetMyProfileQuery,
  useGetProfileByUsernameQuery,
  useGetProfileSummaryByUsernameQuery,
} from "@/features/profile/api/userProfileApi";
import { useTrainingProfile } from "@/features/profile/hooks";
import {
  ProfileCard,
  ProfileFriendsModal,
  ProfileMainExercise,
  ProfileMuscleDistribution,
  ProfileStats,
  ProfileWorkoutsList,
} from "@/features/profile/components";

// pequeño helper para color de fondo translúcido a partir de hex
function hexToRgba(hex: string, alpha = 0.12) {
  const m = hex.replace("#", "").match(/^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
  if (!m) return `rgba(0,0,0,${alpha})`;
  const [r, g, b] = m.slice(1).map((h) => Number.parseInt(h, 16));
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
    <div className="space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-2xl border-2 border-border/60 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background p-8 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
              {isSelf ? "Mi perfil" : profile ? `Perfil de @${profile.username}` : "Perfil"}
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              {isSelf ? "Visualiza tu progreso y estadísticas" : "Estadísticas y entrenamientos"}
            </p>
          </div>

          {training.badge && (
            <div
              className="inline-flex items-center gap-3 px-5 py-3 bg-card/80 backdrop-blur-sm border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              style={{
                borderColor: training.badge.color,
                boxShadow: `0 0 20px ${hexToRgba(training.badge.color, 0.3)}`,
              }}
            >
              <span className="text-sm font-bold text-foreground">Perfil de entrenamiento:</span>
              <span
                className="text-sm font-extrabold px-4 py-2 rounded-lg shadow-md"
                style={{
                  color: training.badge.color,
                  background: `linear-gradient(135deg, ${hexToRgba(training.badge.color, 0.2)}, ${hexToRgba(
                    training.badge.color,
                    0.1
                  )})`,
                  border: `2px solid ${training.badge.color}`,
                  textShadow: `0 0 10px ${hexToRgba(training.badge.color, 0.5)}`,
                }}
                title={`Promedio: ${training.badge.avgScore} (${training.badge.samples} sesiones)`}
              >
                {training.badge.title}
              </span>
            </div>
          )}
        </div>
      </div>

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

      <div className="space-y-6">
        <h2 className="text-lg font-semibold tracking-tight">Análisis</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {targetUsername && <ProfileMainExercise username={targetUsername} />}
          {targetUsername && <ProfileMuscleDistribution username={targetUsername} recentDays={60} />}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Entrenamientos</h2>
          {summary && summary.workouts_count > 0 && (
            <span className="text-sm text-muted-foreground">
              {summary.workouts_count} {summary.workouts_count === 1 ? "entrenamiento" : "entrenamientos"}
            </span>
          )}
        </div>
        {targetUsername && (
          <ProfileWorkoutsList username={targetUsername} avatarUrl={profile?.url_avatar ?? null} isMine={isSelf} />
        )}
      </div>

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
