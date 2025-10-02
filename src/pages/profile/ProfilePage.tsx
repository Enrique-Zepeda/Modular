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
  ProfileMuscleDistribution,
  ProfileStats,
  ProfileTopExercises,
  ProfileWorkoutsList,
} from "@/features/profile/components";
import BmiBadge from "@/features/profile/components/BmiBadge";

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
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl border-2 border-border/60 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative p-8 space-y-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-balance">
              {isSelf ? "Mi perfil" : profile ? `Perfil de @${profile.username}` : "Perfil"}
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl text-pretty">
              {isSelf
                ? "Visualiza tu progreso y estadísticas de entrenamiento"
                : "Estadísticas y entrenamientos del usuario"}
            </p>
          </div>

          {training.badge && (
            <div
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-card/90 backdrop-blur-md border-2 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
              style={{
                borderColor: training.badge.color,
                boxShadow: `0 4px 24px ${hexToRgba(training.badge.color, 0.25)}`,
              }}
            >
              <span className="text-sm font-bold text-foreground/90">Perfil de entrenamiento:</span>
              <span
                className="text-sm font-extrabold px-5 py-2.5 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300"
                style={{
                  color: training.badge.color,
                  background: `linear-gradient(135deg, ${hexToRgba(training.badge.color, 0.25)}, ${hexToRgba(
                    training.badge.color,
                    0.1
                  )})`,
                  border: `2px solid ${training.badge.color}`,
                  textShadow: `0 0 12px ${hexToRgba(training.badge.color, 0.6)}`,
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
      {isSelf && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-border/60 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight">Índice de Masa Corporal</h3>
                <p className="text-sm text-muted-foreground">Tu estado físico actual</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl ring-2 ring-primary/20">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-center py-4">
              <BmiBadge
                isSelf
                className="text-base px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              />
            </div>
          </div>
        </div>
      )}
      <ProfileStats
        summary={summary}
        loading={summaryQ.isLoading}
        hideLastPanel
        onFriendsClick={() => setOpenFriends(true)}
      />

      <div className="space-y-6 pt-2">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Análisis de entrenamiento</h2>
          <p className="text-sm text-muted-foreground">Tus ejercicios más destacados y distribución muscular</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {targetUsername && <ProfileTopExercises username={targetUsername} topN={3} />}
          {targetUsername && <ProfileMuscleDistribution username={targetUsername} recentDays={60} />}
        </div>
      </div>

      <div className="space-y-5 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Historial de entrenamientos</h2>
            {summary && summary.workouts_count > 0 && (
              <p className="text-sm text-muted-foreground">
                {summary.workouts_count}{" "}
                {summary.workouts_count === 1 ? "entrenamiento registrado" : "entrenamientos registrados"}
              </p>
            )}
          </div>
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
