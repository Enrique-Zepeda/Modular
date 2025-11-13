import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Inbox, Send, Loader2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Hooks existentes (ajusta si tus nombres difieren)
import { useFriendRequests } from "@/features/friends/hooks";
import { useFriendActions } from "@/features/friends/hooks";

import NavigableRequestsList from "@/features/friends/components/NavigableRequestsList";

export default function NotificationsPage() {
  const { incoming, outgoing, isLoading } = useFriendRequests();
  const actions = useFriendActions();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <UserPlus className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Solicitudes de amistad
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Gestiona tus solicitudes de amistad</p>
          </div>
        </div>
      </div>

      {/* Cards en grid: una columna en mobile, dos columnas a partir de lg */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Entrantes */}
        <Card className="border-muted/60 bg-gradient-to-br from-background to-muted/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <Inbox className="h-5 w-5 text-green-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Solicitudes entrantes</CardTitle>
              </div>
              {incoming.length > 0 && (
                <Badge
                  variant="default"
                  className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 text-xs sm:text-sm px-2.5 py-1"
                >
                  {incoming.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground text-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando solicitudes...</span>
              </div>
            ) : (
              <NavigableRequestsList
                items={incoming}
                variant="incoming"
                onAccept={(id) => actions.accept(id)}
                onReject={(id) => actions.reject(id)}
              />
            )}
          </CardContent>
        </Card>

        {/* Enviadas */}
        <Card className="border-muted/60 bg-gradient-to-br from-background to-muted/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <Send className="h-5 w-5 text-blue-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Solicitudes enviadas</CardTitle>
              </div>
              {outgoing.length > 0 && (
                <Badge
                  variant="default"
                  className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 text-xs sm:text-sm px-2.5 py-1"
                >
                  {outgoing.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground text-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando solicitudes...</span>
              </div>
            ) : (
              <NavigableRequestsList items={outgoing} variant="outgoing" onCancel={(id) => actions.cancel(id)} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
