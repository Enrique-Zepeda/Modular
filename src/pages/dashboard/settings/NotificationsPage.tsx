import { RequestsList } from "@/features/friends/components/RequestsPanels";
import { useFriendRequests } from "@/features/friends/hooks";
import { useFriendActions } from "@/features/friends/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Página de Notificaciones: muestra solicitudes de amistad entrantes/salientes
 */
export default function NotificationsPage() {
  const { incoming, outgoing, isLoading } = useFriendRequests();
  const actions = useFriendActions();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Notificaciones</h1>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Solicitudes entrantes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : (
            <RequestsList
              items={incoming}
              variant="incoming"
              onAccept={(id) => actions.accept(id)}
              onReject={(id) => actions.reject(id)}
            />
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Solicitudes enviadas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : (
            <RequestsList items={outgoing} variant="outgoing" onCancel={(id) => actions.cancel(id)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
