import { useEffect } from "react";
import { enableRecoveryBlocker, disableRecoveryBlocker, isRecoveryUrl } from "./RecoveryBlocker";

// Hook: se usa SOLO en ResetPasswordPage
export function useRecoveryProtection() {
  useEffect(() => {
    if (typeof window !== "undefined" && isRecoveryUrl(window.location)) {
      // console.log("[RecoveryBlocker] Recovery URL detected - enabling");
      enableRecoveryBlocker();
    }
    return () => {
      disableRecoveryBlocker();
    };
  }, []);
}
