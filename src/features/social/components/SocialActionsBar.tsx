import { memo, useMemo, useState } from "react";
import { LikeButton } from "./LikeButton";
import { CommentsTrigger } from "./CommentsTrigger";
import { CommentsThread } from "./CommentsThread";
import { useCommentsCountState } from "../hooks/useCommentsCount";

type Props = {
  sessionId: number;
  defaultOpen?: boolean;
  initialLikesCount?: number;
  initialLikedByMe?: boolean;
  initialCommentsCount?: number;
};

export const SocialActionsBar = memo(function SocialActionsBar({
  sessionId,
  defaultOpen = false,
  initialLikesCount,
  initialLikedByMe,
  initialCommentsCount,
}: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  // Conteo en vivo con "ready"
  const { count: liveCount, ready } = useCommentsCountState(sessionId);

  const commentsCount = useMemo(() => {
    if (!ready) {
      return Math.max(0, typeof initialCommentsCount === "number" ? initialCommentsCount : 0);
    }
    return Math.max(0, liveCount ?? 0);
  }, [ready, liveCount, initialCommentsCount]);

  return (
    <div className="space-y-5 w-full">
      <div className="flex items-center gap-3 flex-wrap">
        <LikeButton sessionId={sessionId} initialCount={initialLikesCount} initialLikedByMe={initialLikedByMe} />
        {/* 👇 ahora alterna abrir/cerrar */}
        <CommentsTrigger count={commentsCount} isOpen={open} onToggle={() => setOpen((v) => !v)} />
      </div>

      {open ? <CommentsThread sessionId={sessionId} onClose={() => setOpen(false)} /> : null}
    </div>
  );
});
