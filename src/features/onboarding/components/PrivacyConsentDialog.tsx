import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type PrivacyConsentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void; // llamado al aceptar
  confirming?: boolean; // deshabilita botones al guardar
};

export function PrivacyConsentDialog({ open, onOpenChange, onConfirm, confirming }: PrivacyConsentDialogProps) {
  const [accepted, setAccepted] = React.useState(false);

  // Al cerrar, reseteamos el checkbox para no “arrastrar” el estado
  React.useEffect(() => {
    if (!open) setAccepted(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="privacy-body">
        <DialogHeader>
          <DialogTitle>Aviso de Privacidad — GymApp</DialogTitle>
          <DialogDescription>Lee y acepta el aviso para poder completar tu perfil.</DialogDescription>
        </DialogHeader>

        {/* Contenido con scroll controlado (no creamos nueva ruta) */}
        <ScrollArea className="max-h-[70vh] pr-2">
          <div id="privacy-body" className="space-y-4 text-sm leading-relaxed">
            <p className="text-xs text-muted-foreground">
              Última actualización: <strong>11 de noviembre de 2025</strong>
            </p>

            <section className="space-y-2">
              <h4 className="font-semibold">1) Quiénes somos y qué hace GymApp</h4>
              <p>
                GymApp es una aplicación para planificar y registrar entrenamientos, con funciones sociales (amigos, “me
                gusta”, comentarios) y un sistema de recomendaciones personalizadas basado en IA.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">2) Datos personales que tratamos</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Identificadores:</strong> correo electrónico, nombre, nombre de usuario.
                </li>
                <li>
                  <strong>Datos de salud/fitness:</strong> edad, peso, altura, sexo, nivel de experiencia, objetivo.
                </li>
                <li>
                  <strong>Actividad de entrenamiento:</strong> sesiones, series, repeticiones, peso (kg/lbs), duración,
                  sensación/RPE.
                </li>
                <li>
                  <strong>Interacciones sociales:</strong> amigos, “me gusta”, comentarios.
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Nota: algunos datos se consideran sensibles (salud). Requerimos tu consentimiento explícito.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">3) Finalidades del tratamiento</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Personalizar la experiencia y generar rutinas/recomendaciones con IA.</li>
                <li>Gestionar tu historial y métricas para seguimiento de progreso.</li>
                <li>Habilitar funciones sociales (mostrar entrenamientos a amigos, “me gusta”, comentarios).</li>
                <li>Mejorar seguridad y prevenir abusos (controles de acceso, auditoría técnica).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">4) Bases legales</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Ejecución del contrato</strong>: prestación de las funcionalidades principales.
                </li>
                <li>
                  <strong>Consentimiento explícito</strong>: tratamiento de datos de salud para recomendaciones.
                </li>
                <li>
                  <strong>Interés legítimo</strong>: seguridad, integridad del servicio y mejora de la plataforma.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">5) Con quién compartimos tus datos</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Proveedores tecnológicos</strong> (encargados), p. ej. infraestructura y base de datos.
                </li>
                <li>
                  <strong>Comunidad de GymApp</strong>: tu actividad puede mostrarse a tus amigos según la configuración
                  y reglas de visibilidad. No vendemos tus datos.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">6) Transferencias internacionales</h4>
              <p>
                Nuestros proveedores pueden operar desde distintas ubicaciones. Aplicamos medidas técnicas y
                contractuales razonables para proteger tus datos.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">7) Seguridad</h4>
              <p>
                Utilizamos autenticación segura y controles de acceso por registro (RLS) a nivel de base de datos,
                siguiendo principios de mínimo privilegio y buenas prácticas de la industria.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">8) Conservación</h4>
              <p>
                Conservamos tus datos mientras mantengas tu cuenta y por el tiempo necesario para fines legales o de
                soporte. Si solicitas eliminación, iniciaremos el proceso en plazos técnicos razonables.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">9) Tus derechos</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Acceso, rectificación, eliminación y portabilidad de datos.</li>
                <li>Oposición o restricción del tratamiento.</li>
                <li>Retirar tu consentimiento para datos de salud en cualquier momento.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">10) Menores</h4>
              <p>
                GymApp está dirigida a personas de 13 años o más. Si detectamos una cuenta de un menor de edad,
                tomaremos medidas para desactivarla.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">11) Contacto</h4>
              <p>
                Para ejercer tus derechos o resolver dudas, escríbenos a
                <span className="font-medium"> enriquezepeda60z@gmail.com (Creador de la APP)</span>
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">12) Cambios</h4>
              <p>
                Podemos actualizar este aviso para reflejar cambios legales o funcionales. Publicaremos la versión
                vigente y su fecha.
              </p>
            </section>

            {/* Aceptación explícita */}
            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="privacy-consent"
                checked={accepted}
                onCheckedChange={(c) => setAccepted(c === true)}
                aria-label="Acepto el Aviso de Privacidad"
              />
              <Label htmlFor="privacy-consent" className="text-sm">
                <span className="font-semibold text-foreground">Acepto el Aviso de Privacidad</span>
              </Label>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={!!confirming}>
            Cancelar
          </Button>
          <Button type="button" disabled={!accepted || !!confirming} onClick={onConfirm}>
            {confirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              "Acepto y completar perfil"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PrivacyConsentDialog;
