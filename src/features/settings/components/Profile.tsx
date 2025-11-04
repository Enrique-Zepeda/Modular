import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2, Search } from "lucide-react"; // Import Loader2 and Search icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, parse, isValid, isAfter, isBefore } from "date-fns";

import { DatePicker } from "@/components/ui/date-picker";

import { canChangeUsername } from "@/features/settings/utils/checkUsername";
import { AvatarUploader } from "./AvatarUploader";

/* -------------------- Opciones en línea para los selects -------------------- */
const SEX_OPTIONS = ["masculino", "femenino"] as const;
const OBJETIVO_OPTIONS = ["hipertrofia", "fuerza", "resistencia"] as const;
const NIVEL_OPTIONS = ["principiante", "intermedio", "avanzado"] as const;

/* ---------------------------- Validación con Zod ---------------------------- */
/** Validamos DOB (13–100 años) y eliminamos 'edad' del formulario */
const PerfilSchema = z.object({
  nombre: z.string().trim().max(120, "Máximo 120 caracteres").optional().or(z.literal("")),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,20}$/, "3–20 chars, minúsculas, números, . _ -")
    .optional()
    .or(z.literal("")),
  correo: z.string().email().optional().or(z.literal("")),
  fecha_nacimiento: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Fecha inválida")
    .refine((v) => {
      if (!v) return true;
      const d = new Date(v);
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      return age >= 13 && age <= 100;
    }, "Debes tener entre 13 y 100 años"),
  peso: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 500), "Peso inválido"),
  altura: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 300), "Altura inválida"),
  objetivo: z.string().optional().or(z.literal("")),
  nivel_experiencia: z.string().optional().or(z.literal("")),
  sexo: z.string().optional().or(z.literal("")),
  url_avatar: z.string().url().optional().or(z.literal("")),
});

/* ------------------------- Utilidad: edad desde DOB ------------------------- */
const ageFromDOB = (dob?: string | null): number | null => {
  if (!dob) return null;
  const d = parse(String(dob).slice(0, 10), "yyyy-MM-dd", new Date());
  if (!isValid(d)) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

export function Perfil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"available" | "taken" | "unchanged" | "empty" | "error" | null>(
    null
  );
  const initialUsernameRef = useRef("");

  const parseLocalISODate = (s?: string | null): Date | undefined => {
    if (!s) return undefined;
    const clean = String(s).slice(0, 10); // soporta "2001-05-08" o "2001-05-08T00:00:00Z"
    const d = parse(clean, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  };
  // límites de DOB: min = hoy - 100 años, max = hoy - 13 años
  const { minDOB, maxDOB } = useMemo(() => {
    const today = new Date();
    const min = new Date(today);
    min.setFullYear(min.getFullYear() - 100);
    const max = new Date(today);
    max.setFullYear(max.getFullYear() - 13);
    // ponerlas a mediodía local para evitar bordes de DST
    min.setHours(12, 0, 0, 0);
    max.setHours(12, 0, 0, 0);
    return { minDOB: min, maxDOB: max };
  }, []);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<z.infer<typeof PerfilSchema>>({
    resolver: zodResolver(PerfilSchema),
    defaultValues: {
      nombre: "",
      username: "",
      correo: "",
      fecha_nacimiento: "",
      peso: "",
      altura: "",
      objetivo: "",
      nivel_experiencia: "",
      sexo: "",
      url_avatar: "",
    },
    mode: "onBlur",
  });

  const usernameWatch = watch("username");
  const dobWatch = watch("fecha_nacimiento");
  const calculatedAge = ageFromDOB(dobWatch || "");

  /* ----------------------------- Cargar perfil ------------------------------ */
  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const user = authData?.user;
      if (!user) {
        toast.error("No hay sesión activa.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("Usuarios").select("*").eq("auth_uid", user.id).single();
      if (error) throw error;

      initialUsernameRef.current = data?.username ?? "";

      reset({
        nombre: data?.nombre ?? "",
        username: data?.username ?? "",
        correo: data?.correo ?? "",
        // ✅ usamos DOB desde BD (si existe)
        fecha_nacimiento: data?.fecha_nacimiento ? String(data.fecha_nacimiento).slice(0, 10) : "",
        peso: data?.peso ?? "",
        altura: data?.altura ?? "",
        objetivo: data?.objetivo ?? "",
        nivel_experiencia: data?.nivel_experiencia ?? "",
        sexo: data?.sexo ?? "",
        url_avatar: data?.url_avatar ?? "",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "No se pudo cargar tu perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* --------- Botón/función para comprobar si se puede cambiar username ------- */
  const handleCheckUsername = async () => {
    try {
      setCheckingUser(true);
      setUsernameStatus(null);
      const res = await canChangeUsername(initialUsernameRef.current, usernameWatch || "");

      if (res.reason === "empty") {
        setUsernameStatus("empty");
        toast.error("Escribe un username.");
        return;
      }

      if (res.reason === "unchanged") {
        setUsernameStatus("unchanged");
        toast("Tu username actual ya es ese.");
        return;
      }

      if (res.available) {
        setUsernameStatus("available");
        toast.success("Username disponible ✅");
      } else if (res.reason === "rpc_error") {
        setUsernameStatus("error");
        toast.error("No se pudo verificar el username.");
      } else {
        setUsernameStatus("taken");
        toast.error("Ese username ya está en uso.");
      }
    } catch (e) {
      console.error(e);
      setUsernameStatus("error");
      toast.error("Error al comprobar el username.");
    } finally {
      setCheckingUser(false);
    }
  };

  /* ------------------------------ Guardar datos ----------------------------- */
  const onSubmit = async (values: z.infer<typeof PerfilSchema>) => {
    try {
      setSaving(true);

      // Vuelve a validar username antes de guardar
      const res = await canChangeUsername(initialUsernameRef.current, values.username || "");
      if (!res.canChange) {
        if (res.reason === "taken") toast.error("Ese username ya está en uso.");
        else if (res.reason === "empty") toast.error("Escribe un username válido.");
        else toast.error("No se pudo verificar el username.");
        setUsernameStatus(res.reason === "available" ? "available" : (res.reason as any) || "error");
        setSaving(false);
        return;
      }

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const user = authData?.user;
      if (!user) throw new Error("No hay sesión activa.");

      const norm = (v: any) => (v === "" ? null : v);
      const payload: Record<string, any> = {
        nombre: norm(values.nombre),
        username: norm(values.username?.toLowerCase()),
        // ✅ Enviamos fecha_nacimiento; 'edad' la calcula el trigger en BD (si está configurado)
        fecha_nacimiento: norm(values.fecha_nacimiento),
        peso: values.peso ?? null,
        altura: values.altura ?? null,
        objetivo: norm(values.objetivo),
        nivel_experiencia: norm(values.nivel_experiencia),
        sexo: norm(values.sexo),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("Usuarios")
        .update(payload)
        .eq("auth_uid", user.id)
        .select("*")
        .single();

      if (error) {
        if ((error as any).code === "23505") {
          toast.error("El username ya está en uso.");
          setUsernameStatus("taken");
        } else {
          toast.error((error as any).message ?? "No se pudo guardar.");
        }
        return;
      }

      // Sincroniza y feedback
      reset({
        nombre: data?.nombre ?? "",
        username: data?.username ?? "",
        correo: data?.correo ?? "",
        fecha_nacimiento: data?.fecha_nacimiento ? String(data.fecha_nacimiento).slice(0, 10) : "",
        peso: data?.peso ?? "",
        altura: data?.altura ?? "",
        objetivo: data?.objetivo ?? "",
        nivel_experiencia: data?.nivel_experiencia ?? "",
        sexo: data?.sexo ?? "",
        url_avatar: data?.url_avatar ?? "",
      });
      initialUsernameRef.current = data?.username ?? initialUsernameRef.current;
      setUsernameStatus("available");

      toast.success("Cambios guardados correctamente.");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const renderError = (field: keyof z.infer<typeof PerfilSchema>) =>
    (errors?.[field] as any)?.message ? (
      <p className="text-sm text-destructive mt-1">{String((errors as any)[field].message)}</p>
    ) : null;

  return (
    <div className="grid gap-12">
      {/* Región aria-live */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {justSaved ? "Cambios guardados correctamente." : ""}
      </div>

      <div className="animate-slide-in">
        <AvatarUploader
          url={watch("url_avatar") || ""}
          onUpdated={(newUrl) => setValue("url_avatar", newUrl, { shouldDirty: true })}
        />
      </div>

      <Card className="glass-card border-0 premium-hover">
        <CardHeader className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pb-8">
          <div className="space-y-3">
            <CardTitle className="text-2xl font-bold">Información personal</CardTitle>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Actualiza tu información personal y preferencias de entrenamiento
            </p>
            {justSaved && (
              <div className="flex items-center gap-3 p-4 rounded-xl glass-effect border border-green-500/20 animate-scale-in">
                <div className="status-dot status-available"></div>
                <span className="text-base font-semibold text-green-400">¡Cambios guardados correctamente!</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={saving || loading}
            className="premium-button min-w-40 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl text-base font-semibold px-8"
          >
            {saving ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Guardando…
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </CardHeader>

        <CardContent className="grid gap-8 md:grid-cols-2 pt-0">
          {loading ? (
            <>
              <div className="h-16 glass-effect rounded-xl animate-shimmer md:col-span-2" />
              <div className="h-16 glass-effect rounded-xl animate-shimmer" />
              <div className="h-16 glass-effect rounded-xl animate-shimmer" />
              <div className="h-16 glass-effect rounded-xl animate-shimmer" />
              <div className="h-16 glass-effect rounded-xl animate-shimmer" />
              <div className="h-16 glass-effect rounded-xl animate-shimmer" />
              <div className="h-16 glass-effect rounded-xl animate-shimmer" />
            </>
          ) : (
            <>
              {/* Nombre */}
              <div className="space-y-4">
                <Label htmlFor="nombre" className="text-base font-semibold">
                  Nombre completo
                </Label>
                <Input
                  id="nombre"
                  {...register("nombre")}
                  className="h-14 glass-input border-0 bg-transparent text-base placeholder:text-muted-foreground/60"
                  placeholder="Ingresa tu nombre completo"
                />
                {renderError("nombre")}
              </div>

              {/* Username + Verificar */}
              <div className="space-y-4">
                <Label htmlFor="username" className="text-base font-semibold">
                  Nombre de usuario
                </Label>
                <div className="flex gap-4">
                  <Input
                    id="username"
                    {...register("username")}
                    className="h-14 glass-input border-0 bg-transparent text-base placeholder:text-muted-foreground/60"
                    placeholder="tu_username"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCheckUsername}
                    disabled={checkingUser}
                    className="h-14 px-6 glass-effect border-0 hover:glass-card premium-hover bg-transparent"
                    aria-label="Verificar disponibilidad de username"
                  >
                    {checkingUser ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                  </Button>
                </div>
                {usernameStatus === "available" && (
                  <div className="flex items-center gap-3 text-base text-green-400">
                    <div className="status-dot status-available"></div>
                    Disponible ✅
                  </div>
                )}
                {usernameStatus === "taken" && (
                  <div className="flex items-center gap-3 text-base text-destructive">
                    <div className="status-dot status-error"></div>
                    No disponible. Elige otro.
                  </div>
                )}
                {usernameStatus === "unchanged" && (
                  <div className="flex items-center gap-3 text-base text-muted-foreground">
                    <div className="status-dot status-warning"></div>
                    Es tu username actual.
                  </div>
                )}
                {renderError("username")}
              </div>

              {/* Correo */}
              <div className="space-y-4 md:col-span-2">
                <Label htmlFor="correo" className="text-base font-semibold">
                  Correo electrónico
                </Label>
                <Input
                  id="correo"
                  {...register("correo")}
                  disabled
                  className="h-14 glass-effect border-0 bg-transparent text-muted-foreground cursor-not-allowed opacity-60"
                />
                <p className="text-sm text-muted-foreground/80">
                  El correo electrónico no se puede modificar por seguridad
                </p>
              </div>

              {/* Fecha de nacimiento (calendario) */}
              <div className="space-y-4">
                <Label htmlFor="fecha_nacimiento" className="text-base font-semibold">
                  Fecha de nacimiento
                </Label>
                <Controller
                  control={control}
                  name="fecha_nacimiento"
                  render={({ field }) => (
                    <DatePicker
                      date={parseLocalISODate(field.value)}
                      onDateChange={(date) => {
                        if (date) field.onChange(format(date, "yyyy-MM-dd"));
                      }}
                      placeholder="Selecciona tu fecha"
                      disabled={(date) => isAfter(date, maxDOB) || isBefore(date, minDOB)}
                      minDate={minDOB}
                      maxDate={maxDOB}
                      className="h-14 glass-input border-0 bg-transparent text-base"
                    />
                  )}
                />
                {renderError("fecha_nacimiento")}
                {dobWatch && calculatedAge !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Edad:</span>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {calculatedAge} años
                    </Badge>
                  </div>
                )}
              </div>

              {/* Peso */}
              <div className="space-y-4">
                <Label htmlFor="peso" className="text-base font-semibold">
                  Peso (kg)
                </Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  {...register("peso")}
                  className="h-14 glass-input border-0 bg-transparent text-base placeholder:text-muted-foreground/60"
                  placeholder="70.5"
                />
                {renderError("peso")}
              </div>

              {/* Altura */}
              <div className="space-y-4">
                <Label htmlFor="altura" className="text-base font-semibold">
                  Altura (cm)
                </Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.1"
                  {...register("altura")}
                  className="h-14 glass-input border-0 bg-transparent text-base placeholder:text-muted-foreground/60"
                  placeholder="175"
                />
                {renderError("altura")}
              </div>

              {/* Objetivo */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Objetivo de entrenamiento</Label>
                <Select
                  value={watch("objetivo") ?? ""}
                  onValueChange={(v) => setValue("objetivo", v, { shouldDirty: true })}
                >
                  <SelectTrigger
                    className="h-14 glass-input text-base bg-muted/20 hover:bg-muted/20
             focus:bg-muted/20 border border-border/60
             data-[placeholder]:text-muted-foreground"
                  >
                    <SelectValue placeholder="Selecciona tu objetivo" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border">
                    {OBJETIVO_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="capitalize premium-hover text-base py-3">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError("objetivo")}
              </div>

              {/* Nivel de experiencia */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Nivel de experiencia</Label>
                <Select
                  value={watch("nivel_experiencia") ?? ""}
                  onValueChange={(v) => setValue("nivel_experiencia", v, { shouldDirty: true })}
                >
                  <SelectTrigger
                    className="h-14 glass-input text-base bg-muted/20 hover:bg-muted/20
             focus:bg-muted/20 border border-border/60
             data-[placeholder]:text-muted-foreground"
                  >
                    <SelectValue placeholder="Selecciona tu nivel" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border">
                    {NIVEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="capitalize premium-hover text-base py-3">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError("nivel_experiencia")}
              </div>

              {/* Sexo */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Sexo</Label>
                <Select value={watch("sexo") ?? ""} onValueChange={(v) => setValue("sexo", v, { shouldDirty: true })}>
                  <SelectTrigger
                    className="h-14 glass-input text-base bg-muted/20 hover:bg-muted/20
             focus:bg-muted/20 border border-border/60
             data-[placeholder]:text-muted-foreground"
                  >
                    <SelectValue placeholder="Selecciona tu sexo" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border">
                    {SEX_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="capitalize premium-hover text-base py-3">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError("sexo")}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
