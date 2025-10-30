import { RequestsList } from "@/features/friends/components/RequestsPanels";
import { useFriendRequests } from "@/features/friends/hooks";
import { useFriendActions } from "@/features/friends/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, Send, Loader2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Página de Notificaciones: muestra solicitudes de amistad entrantes/salientes
 */
export default function NotificationsPage() {
  const { incoming, outgoing, isLoading } = useFriendRequests();
  const actions = useFriendActions();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <UserPlus className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Solicitudes de amistad
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona tus solicitudes de amistad</p>
          </div>
        </div>
      </div>

      <Card className="border-muted/60 bg-gradient-to-br from-background to-muted/20 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <Inbox className="h-5 w-5 text-green-400" />
              </div>
              <CardTitle className="text-xl">Solicitudes entrantes</CardTitle>
            </div>
            {incoming.length > 0 && (
              <Badge
                variant="default"
                className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
              >
                {incoming.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando solicitudes...</span>
            </div>
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

      <Card className="border-muted/60 bg-gradient-to-br from-background to-muted/20 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <Send className="h-5 w-5 text-blue-400" />
              </div>
              <CardTitle className="text-xl">Solicitudes enviadas</CardTitle>
            </div>
            {outgoing.length > 0 && (
              <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
                {outgoing.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando solicitudes...</span>
            </div>
          ) : (
            <RequestsList items={outgoing} variant="outgoing" onCancel={(id) => actions.cancel(id)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
