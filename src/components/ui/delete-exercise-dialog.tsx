import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  exerciseName?: string;
  isLoading?: boolean;
}

export function DeleteExerciseDialog({
  open,
  onOpenChange,
  onConfirm,
  exerciseName,
  isLoading = false,
}: DeleteExerciseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar ejercicio</AlertDialogTitle>
          <AlertDialogDescription>
            {exerciseName ? (
              <>
                ¿Estás seguro de eliminar <span className="font-semibold">"{exerciseName}"</span> de esta rutina? Esta
                acción no se puede deshacer.
              </>
            ) : (
              <>¿Estás seguro de eliminar este ejercicio de la rutina? Esta acción no se puede deshacer.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              // cerrar primero para liberar overlay
              onOpenChange(false);
              // ejecutar confirm en el siguiente frame
              requestAnimationFrame(() => onConfirm());
            }}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
