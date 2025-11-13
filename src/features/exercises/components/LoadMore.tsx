import { Button } from "@/components/ui/button";
import { Dumbbell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function LoadMore({ visible, disabled, onClick }: { visible: boolean; disabled: boolean; onClick: () => void }) {
  if (!visible) return null;
  return (
    <motion.div
      className="px-4 sm:px-0 flex justify-center pt-6 sm:pt-8 pb-[max(0.5rem,env(safe-area-inset-bottom))]" // mobile-first + safe-area
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      aria-live="polite"
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        size="lg"
        className="w-full sm:w-auto h-12 rounded-full shadow-lg md:hover:shadow-xl transition-all px-5 sm:px-6" // full-width en móvil; auto en desktop
        aria-busy={disabled}
      >
        {disabled ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Cargando ejercicios...
          </>
        ) : (
          <>
            <Dumbbell className="h-5 w-5 mr-2" /> Cargar más ejercicios
          </>
        )}
      </Button>
    </motion.div>
  );
}
