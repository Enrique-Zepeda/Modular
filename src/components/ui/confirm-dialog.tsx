import * as React from "react";
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
import { Button } from "@/components/ui/button";

type ButtonVariant = "default" | "secondary" | "destructive" | "outline" | "ghost";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Contenido */
  title: React.ReactNode;
  description?: React.ReactNode;

  /** Botones */
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  isLoading?: boolean;

  /** Estilos shadcn */
  confirmVariant?: ButtonVariant;
  cancelVariant?: ButtonVariant;

  /** Lógica */
  onConfirm?: () => void | Promise<void>;
  /** Cierra el diálogo antes de ejecutar onConfirm para liberar el overlay (evita “pantalla congelada”). */
  autoCloseBeforeConfirm?: boolean; // default: true

  /** Tamaño del contenedor */
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  showCancel = true,
  isLoading = false,
  confirmVariant = "default",
  cancelVariant = "secondary",
  onConfirm,
  autoCloseBeforeConfirm = true,
  className = "sm:max-w-[425px]",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    // 1) Cerrar primero para liberar focus trap / overlay
    if (autoCloseBeforeConfirm) onOpenChange(false);

    // 2) Ejecutar en el siguiente frame (evita overlays pegados / pointer-events lock)
    if (onConfirm) requestAnimationFrame(() => onConfirm());
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel && (
            <AlertDialogCancel asChild>
              <Button type="button" variant={cancelVariant} disabled={isLoading}>
                {cancelLabel}
              </Button>
            </AlertDialogCancel>
          )}
          <AlertDialogAction asChild>
            <Button type="button" variant={confirmVariant} disabled={isLoading} onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
