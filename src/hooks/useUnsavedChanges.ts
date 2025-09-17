import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface UnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  onNavigateAway?: () => void;
}

export function useUnsavedChanges({ hasUnsavedChanges, onNavigateAway }: UnsavedChangesOptions) {
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation attempts
  const handleNavigation = useCallback(
    (path: string) => {
      if (hasUnsavedChanges) {
        setPendingNavigation(path);
        setShowExitModal(true);
        return false;
      }
      navigate(path, { replace: true });
      return true;
    },
    [hasUnsavedChanges, navigate]
  );

  // Confirm exit without saving
  const confirmExit = useCallback(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation, { replace: true });
    }
    if (onNavigateAway) {
      onNavigateAway();
    }
    setShowExitModal(false);
    setPendingNavigation(null);
  }, [pendingNavigation, navigate, onNavigateAway]);

  // Cancel exit
  const cancelExit = useCallback(() => {
    setShowExitModal(false);
    setPendingNavigation(null);
  }, []);

  return {
    showExitModal,
    handleNavigation,
    confirmExit,
    cancelExit,
  };
}
