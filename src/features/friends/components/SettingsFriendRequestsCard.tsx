import { RequestsList } from "./RequestsPanels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFriendActions, useFriendRequests } from "../hooks";

/**
 * Card reutilizable para incrustar las solicitudes en Configuración.
 * Inserta <SettingsFriendRequestsCard /> dentro de tu SettingsPage.
 */
export default function SettingsFriendRequestsCard() {
  const { incoming, outgoing, isLoading } = useFriendRequests();
  const actions = useFriendActions();

  return (
    <Card className="border-muted/60">
      <CardHeader>
        <CardTitle>Solicitudes de amistad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Entrantes</h3>
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
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">Enviadas</h3>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : (
            <RequestsList items={outgoing} variant="outgoing" onCancel={(id) => actions.cancel(id)} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
