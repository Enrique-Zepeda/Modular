import { Button } from "@/components/ui/button";
import { Dumbbell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function LoadMore({ visible, disabled, onClick }: { visible: boolean; disabled: boolean; onClick: () => void }) {
  if (!visible) return null;
  return (
    <motion.div
      className="flex justify-center pt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        size="lg"
        className="min-w-[200px] h-12 rounded-full shadow-lg hover:shadow-xl transition-all"
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
