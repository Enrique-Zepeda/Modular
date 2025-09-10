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

interface DeleteRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  routineName?: string;
  isLoading?: boolean;
}

export function DeleteRoutineDialog({
  open,
  onOpenChange,
  onConfirm,
  routineName,
  isLoading = false,
}: DeleteRoutineDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar rutina</AlertDialogTitle>
          <AlertDialogDescription>
            {routineName ? (
              <>
                ¿Seguro que quieres eliminar <span className="font-semibold">“{routineName}”</span>? Esta acción no se
                puede deshacer.
              </>
            ) : (
              <>¿Seguro que quieres eliminar esta rutina? Esta acción no se puede deshacer.</>
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
