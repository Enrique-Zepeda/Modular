import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileFriends } from "../hooks/useProfileFriends";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Props = {
  username: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  className?: string;
};

export default function ProfileFriendsModal({ username, open, onOpenChange, className }: Props) {
  const { friends, isLoading, isError, error, refetch } = useProfileFriends(username);

  React.useEffect(() => {
    if (!open) return;
    // refresh al abrir
    refetch();
  }, [open, refetch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg p-0 overflow-hidden", className)}>
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-4" />
            Amigos de @{username?.replace(/^@+/, "")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-sm text-destructive">{error ?? "No se pudieron cargar las amistades."}</div>
          ) : friends.length === 0 ? (
            <div className="text-sm text-muted-foreground">Este usuario aún no tiene amigos.</div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <ul className="divide-y divide-border">
                {friends.map((f) => {
                  const initial = (f.nombre?.[0] || f.username?.[0] || "?").toUpperCase();
                  return (
                    <li key={f.id} className="py-3">
                      <Link
                        to={`/u/${f.username}`}
                        className="flex items-center gap-3 group"
                        onClick={() => onOpenChange(false)}
                      >
                        <Avatar className="size-10 ring-1 ring-border/50">
                          <AvatarImage src={f.avatarUrl ?? undefined} />
                          <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate group-hover:underline">
                            {f.nombre ?? `@${f.username}`}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">@{f.username}</div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
