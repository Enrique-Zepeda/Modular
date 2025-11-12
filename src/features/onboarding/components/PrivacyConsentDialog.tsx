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
import {
  Loader2,
  Shield,
  User,
  Target,
  Lock,
  Users,
  Globe,
  ShieldCheck,
  Clock,
  FileText,
  Baby,
  Mail,
  RefreshCw,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type PrivacyConsentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirming?: boolean;
};

export function PrivacyConsentDialog({ open, onOpenChange, onConfirm, confirming }: PrivacyConsentDialogProps) {
  const [accepted, setAccepted] = React.useState(false);

  React.useEffect(() => {
    if (!open) setAccepted(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="privacy-body" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Aviso de Privacidad — GymApp
          </DialogTitle>
          <DialogDescription>Lee y acepta el aviso para poder completar tu perfil.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 px-3 py-2 border">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Última actualización: <strong className="text-foreground">11 de noviembre de 2025</strong>
          </p>
        </div>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div id="privacy-body" className="space-y-5 text-sm leading-relaxed">
            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                1. Quiénes somos y qué hace GymApp
              </h4>
              <p className="text-muted-foreground">
                GymApp es una aplicación para planificar y registrar entrenamientos, con funciones sociales (amigos, "me
                gusta", comentarios) y un sistema de recomendaciones personalizadas basado en IA.
              </p>
            </section>

            <section className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                2. Datos personales que tratamos
              </h4>
              <div className="space-y-2 pl-1">
                <div className="rounded-md border bg-card p-3 space-y-1">
                  <p className="font-medium text-sm">Identificadores</p>
                  <p className="text-xs text-muted-foreground">Correo electrónico, nombre, nombre de usuario.</p>
                </div>
                <div className="rounded-md border bg-card p-3 space-y-1">
                  <p className="font-medium text-sm">Datos de salud/fitness</p>
                  <p className="text-xs text-muted-foreground">
                    Edad, peso, altura, sexo, nivel de experiencia, objetivo.
                  </p>
                </div>
                <div className="rounded-md border bg-card p-3 space-y-1">
                  <p className="font-medium text-sm">Actividad de entrenamiento</p>
                  <p className="text-xs text-muted-foreground">
                    Sesiones, series, repeticiones, peso (kg/lbs), duración, sensación/RPE.
                  </p>
                </div>
                <div className="rounded-md border bg-card p-3 space-y-1">
                  <p className="font-medium text-sm">Interacciones sociales</p>
                  <p className="text-xs text-muted-foreground">Amigos, "me gusta", comentarios.</p>
                </div>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-md p-2 border border-amber-200 dark:border-amber-900">
                <strong>Nota:</strong> Algunos datos se consideran sensibles (salud). Requerimos tu consentimiento
                explícito.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-primary" />
                3. Finalidades del tratamiento
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Personalizar la experiencia y generar rutinas/recomendaciones con IA.</li>
                <li>Gestionar tu historial y métricas para seguimiento de progreso.</li>
                <li>Habilitar funciones sociales (mostrar entrenamientos a amigos, "me gusta", comentarios).</li>
                <li>Mejorar seguridad y prevenir abusos (controles de acceso, auditoría técnica).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" />
                4. Bases legales
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Ejecución del contrato:</strong> prestación de las funcionalidades
                  principales.
                </li>
                <li>
                  <strong className="text-foreground">Consentimiento explícito:</strong> tratamiento de datos de salud
                  para recomendaciones.
                </li>
                <li>
                  <strong className="text-foreground">Interés legítimo:</strong> seguridad, integridad del servicio y
                  mejora de la plataforma.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                5. Con quién compartimos tus datos
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Proveedores tecnológicos</strong> (encargados), p. ej.
                  infraestructura y base de datos.
                </li>
                <li>
                  <strong className="text-foreground">Comunidad de GymApp:</strong> tu actividad puede mostrarse a tus
                  amigos según la configuración y reglas de visibilidad. No vendemos tus datos.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-primary" />
                6. Transferencias internacionales
              </h4>
              <p className="text-muted-foreground">
                Nuestros proveedores pueden operar desde distintas ubicaciones. Aplicamos medidas técnicas y
                contractuales razonables para proteger tus datos.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <Lock className="h-4 w-4 text-primary" />
                7. Seguridad
              </h4>
              <p className="text-muted-foreground">
                Utilizamos autenticación segura y controles de acceso por registro (RLS) a nivel de base de datos,
                siguiendo principios de mínimo privilegio y buenas prácticas de la industria.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                8. Conservación
              </h4>
              <p className="text-muted-foreground">
                Conservamos tus datos mientras mantengas tu cuenta y por el tiempo necesario para fines legales o de
                soporte. Si solicitas eliminación, iniciaremos el proceso en plazos técnicos razonables.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                9. Tus derechos
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>Acceso, rectificación, eliminación y portabilidad de datos.</li>
                <li>Oposición o restricción del tratamiento.</li>
                <li>Retirar tu consentimiento para datos de salud en cualquier momento.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <Baby className="h-4 w-4 text-primary" />
                10. Menores
              </h4>
              <p className="text-muted-foreground">
                GymApp está dirigida a personas de 13 años o más. Si detectamos una cuenta de un menor de edad,
                tomaremos medidas para desactivarla.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-primary" />
                11. Contacto
              </h4>
              <p className="text-muted-foreground">
                Para ejercer tus derechos o resolver dudas, escríbenos a
                <span className="font-medium text-foreground"> enriquezepeda60z@gmail.com (Creador de la APP)</span>
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-base">
                <RefreshCw className="h-4 w-4 text-primary" />
                12. Cambios
              </h4>
              <p className="text-muted-foreground">
                Podemos actualizar este aviso para reflejar cambios legales o funcionales. Publicaremos la versión
                vigente y su fecha.
              </p>
            </section>

            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-3 mt-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy-consent"
                  checked={accepted}
                  onCheckedChange={(c) => setAccepted(c === true)}
                  aria-label="Acepto el Aviso de Privacidad"
                  className="mt-1"
                />
                <Label htmlFor="privacy-consent" className="text-sm cursor-pointer">
                  <span className="font-semibold text-foreground">He leído y acepto el Aviso de Privacidad</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Al aceptar, consientes el tratamiento de tus datos según lo establecido en este aviso.
                  </p>
                </Label>
              </div>
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
