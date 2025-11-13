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
    <Card className="border-muted/60 h-full">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Solicitudes de amistad</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 sm:space-y-7 pt-3 sm:pt-4">
        {/* Entrantes */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Entrantes</h3>
          {isLoading ? (
            <div className="text-xs sm:text-sm text-muted-foreground">Cargando…</div>
          ) : (
            <RequestsList
              items={incoming}
              variant="incoming"
              onAccept={(id) => actions.accept(id)}
              onReject={(id) => actions.reject(id)}
            />
          )}
        </div>

        {/* Enviadas */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Enviadas</h3>
          {isLoading ? (
            <div className="text-xs sm:text-sm text-muted-foreground">Cargando…</div>
          ) : (
            <RequestsList items={outgoing} variant="outgoing" onCancel={(id) => actions.cancel(id)} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
