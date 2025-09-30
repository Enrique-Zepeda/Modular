import { memo } from "react";
import { SocialActionsBar } from "@/features/social/components/SocialActionsBar";

/**
 * Usa este wrapper dentro de tu tarjeta del feed:
 * <FeedCardSocialActions sessionId={entrenamiento.id_sesion} />
 */
export const FeedCardSocialActions = memo(function FeedCardSocialActions({ sessionId }: { sessionId: number }) {
  return <SocialActionsBar sessionId={sessionId} />;
});
