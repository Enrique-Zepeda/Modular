import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2, UserCheck, Calendar, Weight, Zap, Target, TrendingUp, User, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parse, isValid, isAfter, isBefore } from "date-fns";

import { DatePicker } from "@/components/ui/date-picker";

import { canChangeUsername } from "@/features/settings/utils/checkUsername";
import { AvatarUploader } from "./AvatarUploader";

import { useWeightUnit } from "@/hooks/useWeightUnit";

const SEX_OPTIONS = ["masculino", "femenino"] as const;
const OBJETIVO_OPTIONS = ["hipertrofia", "fuerza", "resistencia"] as const;
const NIVEL_OPTIONS = ["principiante", "intermedio", "avanzado"] as const;

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

  const { unit, setUnit } = useWeightUnit();

  const parseLocalISODate = (s?: string | null): Date | undefined => {
    if (!s) return undefined;
    const clean = String(s).slice(0, 10);
    const d = parse(clean, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  };

  const { minDOB, maxDOB } = useMemo(() => {
    const today = new Date();
    const min = new Date(today);
    min.setFullYear(min.getFullYear() - 100);
    const max = new Date(today);
    max.setFullYear(max.getFullYear() - 13);
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

  const onSubmit = async (values: z.infer<typeof PerfilSchema>) => {
    try {
      setSaving(true);

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
      <p className="text-xs sm:text-sm text-destructive mt-1">{String((errors as any)[field].message)}</p>
    ) : null;

  const sexoValue = watch("sexo");
  const sexoForAvatar = (sexoValue === "femenino" ? "femenino" : "masculino") as string;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {justSaved ? "Cambios guardados correctamente." : ""}
      </div>

      <div className="animate-slide-in">
        <AvatarUploader
          url={watch("url_avatar") || ""}
          sexo={sexoForAvatar}
          onUpdated={(newUrl) => setValue("url_avatar", newUrl, { shouldDirty: true })}
        />
      </div>

      <Card className="glass-card border-0 premium-hover w-full max-w-full">
        <CardHeader className="flex flex-col gap-3 pb-3 px-2 pt-3 sm:px-6 sm:pt-6 sm:gap-4 sm:pb-6">
          <div className="space-y-1 sm:space-y-1.5">
            <CardTitle className="text-base sm:text-xl lg:text-2xl font-bold">Información personal</CardTitle>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">
              Actualiza tu información personal y preferencias de entrenamiento
            </p>
            {justSaved && (
              <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg glass-effect border border-green-500/20 animate-scale-in">
                <div className="status-dot status-available"></div>
                <span className="text-xs sm:text-sm font-semibold text-green-400">
                  ¡Cambios guardados correctamente!
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={saving || loading}
            className="premium-button w-full sm:w-auto sm:min-w-40 h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl text-sm sm:text-base font-semibold px-4 sm:px-6"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> Guardando…
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </CardHeader>

        <CardContent className="grid gap-4 sm:gap-6 lg:gap-8 px-2 pb-3 sm:px-6 sm:pb-6 pt-0 w-full max-w-full overflow-x-hidden">
          {loading ? (
            <>
              <div className="h-12 sm:h-14 glass-effect rounded-lg animate-shimmer" />
              <div className="h-12 sm:h-14 glass-effect rounded-lg animate-shimmer" />
              <div className="h-12 sm:h-14 glass-effect rounded-lg animate-shimmer" />
              <div className="h-12 sm:h-14 glass-effect rounded-lg animate-shimmer" />
              <div className="h-12 sm:h-14 glass-effect rounded-lg animate-shimmer" />
              <div className="h-12 sm:h-14 glass-effect rounded-lg animate-shimmer" />
              <div className="h-12 sm:h-14 glass-effect rounded-lg animate-shimmer" />
            </>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4 p-2 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/10 dark:to-primary/5 w-full max-w-full">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-primary flex items-center gap-1.5 sm:gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Datos personales
                </h3>

                <div className="grid gap-2 sm:gap-4 md:grid-cols-2">
                  {/* Nombre */}
                  <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-4 lg:p-6 rounded-lg bg-white dark:bg-black/20 border-2 border-primary/30 shadow-sm">
                    <Label
                      htmlFor="nombre"
                      className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5"
                    >
                      <User className="w-3 h-3 text-primary" />
                      Nombre completo
                    </Label>
                    <Input
                      id="nombre"
                      {...register("nombre")}
                      className="h-10 sm:h-11 border-2 border-primary/20 bg-primary/5 dark:bg-primary/10 text-sm placeholder:text-muted-foreground/60 focus:border-primary/60 focus:bg-primary/10 dark:focus:bg-primary/15 transition-colors"
                      placeholder="Ingresa tu nombre"
                    />
                    {renderError("nombre")}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-4 lg:p-6 rounded-lg bg-white dark:bg-black/20 border-2 border-primary/30 shadow-sm">
                    <Label
                      htmlFor="correo"
                      className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5"
                    >
                      <Mail className="w-3 h-3 text-primary" />
                      Correo electrónico
                    </Label>
                    <Input
                      id="correo"
                      {...register("correo")}
                      disabled
                      className="h-10 sm:h-11 border-2 border-primary/20 bg-muted/30 text-sm text-muted-foreground cursor-not-allowed opacity-70"
                    />
                    <p className="text-[0.65rem] sm:text-xs text-muted-foreground/70">
                      No se puede modificar por seguridad
                    </p>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-4 lg:p-6 rounded-lg bg-white dark:bg-black/20 border-2 border-primary/30 shadow-sm md:col-span-2">
                    <Label
                      htmlFor="username"
                      className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3 h-3 text-primary" />
                      Nombre de usuario
                    </Label>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Input
                        id="username"
                        {...register("username")}
                        className="h-10 sm:h-11 border-2 border-primary/20 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:border-primary/60 transition-colors flex-1 min-w-0"
                        placeholder="tu_username"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCheckUsername}
                        disabled={checkingUser}
                        className="h-10 sm:h-11 px-3 sm:px-4 border-2 border-primary/30 bg-white dark:bg-black/20 hover:border-primary/50 transition-colors flex-shrink-0"
                        aria-label="Verificar disponibilidad de username"
                      >
                        {checkingUser ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {usernameStatus === "available" && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
                        <div className="status-dot status-available"></div>
                        Disponible ✅
                      </div>
                    )}
                    {usernameStatus === "taken" && (
                      <div className="flex items-center gap-1.5 text-xs text-destructive font-semibold">
                        <div className="status-dot status-error"></div>
                        No disponible. Elige otro.
                      </div>
                    )}
                    {usernameStatus === "unchanged" && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                        <div className="status-dot status-warning"></div>
                        Es tu username actual.
                      </div>
                    )}
                    {renderError("username")}
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 p-2 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/10 dark:to-primary/5 shadow-sm w-full max-w-full">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-primary flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  Información de edad
                </h3>
                <div className="grid gap-2 sm:gap-4 md:grid-cols-2">
                  {/* Fecha de nacimiento */}
                  <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-4 lg:p-6 rounded-lg bg-white dark:bg-black/20 border-2 border-primary/30 shadow-sm">
                    <Label htmlFor="fecha_nacimiento" className="text-xs font-semibold uppercase text-muted-foreground">
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
                          className="h-10 sm:h-11 border-2 border-primary/20 bg-transparent text-sm w-full focus:border-primary/60 transition-colors"
                        />
                      )}
                    />
                    {renderError("fecha_nacimiento")}
                  </div>

                  {/* Edad Display */}
                  <div className="p-2 sm:p-4 lg:p-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/15 dark:to-primary/8 border-2 border-primary/60 flex flex-col items-center justify-center shadow-sm">
                    <div className="text-center space-y-1 sm:space-y-1.5 w-full">
                      <p className="text-[0.65rem] sm:text-xs font-bold text-primary/80 uppercase tracking-widest">
                        Tu edad
                      </p>
                      {dobWatch && calculatedAge !== null ? (
                        <div className="space-y-0.5 sm:space-y-1">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {calculatedAge}
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-primary/70">años cumplidos</p>
                        </div>
                      ) : (
                        <div className="text-muted-foreground/60 text-xs py-3 sm:py-4 font-medium">
                          Selecciona tu fecha
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 p-2 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/10 dark:to-primary/5 shadow-sm w-full max-w-full">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-primary flex items-center gap-1.5 sm:gap-2">
                  <Weight className="w-4 h-4 sm:w-5 sm:h-5" />
                  Medidas corporales
                </h3>

                <div className="p-2 sm:p-4 lg:p-6 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/15 dark:to-primary/8 border-2 border-primary/50 shadow-sm">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">
                        Unidad de peso preferida
                      </p>
                      <p className="text-primary/80 text-xs font-medium">Selecciona la unidad que prefieres usar</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {/* KG Card */}
                      <button
                        type="button"
                        onClick={() => setUnit("kg")}
                        className={`relative p-2 sm:p-3 lg:p-4 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer group ${
                          unit === "kg"
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/30 scale-105"
                            : "border-primary/30 bg-white dark:bg-black/30 hover:border-primary/60 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-sm"
                        }`}
                        aria-pressed={unit === "kg"}
                        aria-label="Seleccionar kilogramos"
                      >
                        <span className="text-lg sm:text-xl lg:text-2xl group-hover:scale-110 transition-transform">
                          ⚖️
                        </span>
                        <div className="text-center w-full">
                          <p className="font-bold text-xs sm:text-sm text-foreground">Kilogramos</p>
                        </div>

                        {unit === "kg" && (
                          <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center animate-scale-in">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-foreground rounded-full" />
                          </div>
                        )}
                      </button>

                      {/* LBS Card */}
                      <button
                        type="button"
                        onClick={() => setUnit("lbs")}
                        className={`relative p-2 sm:p-3 lg:p-4 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer group ${
                          unit === "lbs"
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/30 scale-105"
                            : "border-primary/30 bg-white dark:bg-black/30 hover:border-primary/60 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-sm"
                        }`}
                        aria-pressed={unit === "lbs"}
                        aria-label="Seleccionar libras"
                      >
                        <span className="text-lg sm:text-xl lg:text-2xl group-hover:scale-110 transition-transform">
                          🏋️
                        </span>
                        <div className="text-center w-full">
                          <p className="font-bold text-xs sm:text-sm text-foreground">Libras</p>
                        </div>

                        {unit === "lbs" && (
                          <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center animate-scale-in">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-foreground rounded-full" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Peso y Altura */}
                <div className="grid gap-2 sm:gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-4 lg:p-6 rounded-lg bg-white dark:bg-black/20 border-2 border-primary/30 shadow-sm">
                    <Label
                      htmlFor="peso"
                      className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5"
                    >
                      <Weight className="w-3 h-3 text-primary" />
                      Peso actual
                    </Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      {...register("peso")}
                      className="h-10 sm:h-11 border-2 border-primary/20 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:border-primary/60 transition-colors font-semibold"
                      placeholder="70.5"
                    />
                    {renderError("peso")}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-4 lg:p-6 rounded-lg bg-white dark:bg-black/20 border-2 border-primary/30 shadow-sm">
                    <Label
                      htmlFor="altura"
                      className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5"
                    >
                      <TrendingUp className="w-3 h-3 text-primary" />
                      Altura
                    </Label>
                    <Input
                      id="altura"
                      type="number"
                      step="0.1"
                      {...register("altura")}
                      className="h-10 sm:h-11 border-2 border-primary/20 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:border-primary/60 transition-colors font-semibold"
                      placeholder="175"
                    />
                    {renderError("altura")}
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 p-2 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/10 dark:to-primary/5 shadow-sm w-full max-w-full">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-primary flex items-center gap-1.5 sm:gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  Preferencias de entrenamiento
                </h3>

                <div className="grid gap-2 sm:gap-4 md:grid-cols-2">
                  {/* Objetivo */}
                  <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-4 lg:p-6 rounded-lg bg-white dark:bg-black/20 border-2 border-primary/30 shadow-sm">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                      <Target className="w-3 h-3 text-primary" />
                      Objetivo
                    </Label>
                    <Select
                      value={watch("objetivo") ?? ""}
                      onValueChange={(v) => setValue("objetivo", v, { shouldDirty: true })}
                    >
                      <SelectTrigger className="h-10 sm:h-11 border-2 border-primary/20 bg-white dark:bg-black/20 text-sm hover:border-primary/40 transition-colors">
                        <SelectValue placeholder="Selecciona tu objetivo" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border">
                        {OBJETIVO_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="capitalize premium-hover text-sm py-2">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderError("objetivo")}
                  </div>

                  {/* Nivel de experiencia */}
                  <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-4 lg:p-6 rounded-lg bg-white dark:bg-black/20 border-2 border-primary/30 shadow-sm">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      Experiencia
                    </Label>
                    <Select
                      value={watch("nivel_experiencia") ?? ""}
                      onValueChange={(v) => setValue("nivel_experiencia", v, { shouldDirty: true })}
                    >
                      <SelectTrigger className="h-10 sm:h-11 border-2 border-primary/20 bg-white dark:bg-black/20 text-sm hover:border-primary/40 transition-colors">
                        <SelectValue placeholder="Selecciona tu nivel" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border">
                        {NIVEL_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="capitalize premium-hover text-sm py-2">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderError("nivel_experiencia")}
                  </div>

                  {/* Sexo */}
                  <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-4 lg:p-6 rounded-lg bg-white dark:bg-black/20 border-2 border-primary/30 shadow-sm md:col-span-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3 h-3 text-primary" />
                      Sexo
                    </Label>
                    <Select
                      value={watch("sexo") ?? ""}
                      onValueChange={(v) => setValue("sexo", v, { shouldDirty: true })}
                    >
                      <SelectTrigger className="h-10 sm:h-11 border-2 border-primary/20 bg-white dark:bg-black/20 text-sm hover:border-primary/40 transition-colors">
                        <SelectValue placeholder="Selecciona tu sexo" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border">
                        {SEX_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="capitalize premium-hover text-sm py-2">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderError("sexo")}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
