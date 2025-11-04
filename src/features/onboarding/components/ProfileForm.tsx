import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  onboardingSchema,
  type OnboardingFormValues,
  NIVELES,
  OBJETIVOS,
  SEXOS,
} from "@/lib/validations/schemas/onboardingSchema";
import { checkUsernameAvailability, upsertCurrentUserProfile } from "../api/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { CalendarIcon, Loader2, Check, X, User, AlertCircle, Sparkles, Target, Settings } from "lucide-react";
import { format, parse, isValid, isAfter, isBefore } from "date-fns";
import toast from "react-hot-toast";
import { DatePicker } from "@/components/ui/date-picker";

type Props = {
  defaults?: Partial<OnboardingFormValues> & { fecha_nacimiento?: string | null };
  onCompleted?: () => void | Promise<void>;
};

const DEBUG_ONBOARD = import.meta.env.DEV;
const log = (...a: any[]) => DEBUG_ONBOARD && console.log("[ONBOARD][form]", ...a);

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Parse "yyyy-MM-dd" como fecha LOCAL (evita saltos por zona/UTC) */
const parseLocalISODate = (s?: string | null): Date | undefined => {
  if (!s) return undefined;
  const clean = String(s).slice(0, 10);
  const d = parse(clean, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
};

/** Edad desde DOB (usando fecha local) */
const ageFromDOB = (dob: string | null | undefined): number | null => {
  if (!dob) return null;
  const d = parse(String(dob).slice(0, 10), "yyyy-MM-dd", new Date());
  if (!isValid(d)) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

export default function ProfileForm({ defaults, onCompleted }: Props) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // límites del input date (min: hoy - 100 años, max: hoy - 13 años) a mediodía local
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

  const form = useForm<OnboardingFormValues & { fecha_nacimiento?: string }>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: defaults?.username ?? "",
      nombre: defaults?.nombre ?? "",
      // 👇 normalizamos a "yyyy-MM-dd" (local)
      fecha_nacimiento: (defaults?.fecha_nacimiento ? String(defaults.fecha_nacimiento).slice(0, 10) : "") as any,
      peso: (defaults?.peso ?? ("" as unknown as number)) as number,
      altura: (defaults?.altura ?? ("" as unknown as number)) as number,
      nivel_experiencia: (defaults?.nivel_experiencia as any) ?? ("" as any),
      objetivo: (defaults?.objetivo as any) ?? ("" as any),
      sexo: (defaults?.sexo as any) ?? ("" as any),
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const usernameValue = form.watch("username") ?? "";
  const usernameHasUppercase = /[A-ZÁÉÍÓÚÑ]/.test(usernameValue);

  const blockNonDigits: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const bad = ["e", "E", "+", "-", ".", ","];
    if (bad.includes(e.key)) e.preventDefault();
  };

  const handleCheckAvailability = async () => {
    const username = form.getValues("username");
    if (!username || !onboardingSchema.shape.username.safeParse(username).success) {
      setAvailable(null);
      return;
    }
    try {
      setChecking(true);
      const ok = await checkUsernameAvailability(username);
      setAvailable(ok);
      if (!ok) form.setError("username", { type: "validate", message: "Este usuario ya existe" });
      else form.clearErrors("username");
    } catch (e: any) {
      setAvailable(null);
      toast.error(e?.message ?? "Error al verificar usuario");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    setAvailable(null);
    form.clearErrors("username");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("username")]);

  const onSubmit = async (values: OnboardingFormValues & { fecha_nacimiento?: string }) => {
    setSubmitError(null);
    try {
      log("submit values", values);
      const username = values.username.trim();
      const nombre = values.nombre.trim();

      const ok = await checkUsernameAvailability(username);
      if (!ok) {
        form.setError("username", { type: "validate", message: "Este usuario ya existe" });
        toast.error("El nombre de usuario ya está en uso.");
        return;
      }

      // Edad derivada desde DOB (local)
      const derivedAge = ageFromDOB(values.fecha_nacimiento ?? null);

      await upsertCurrentUserProfile({
        username,
        nombre,
        fecha_nacimiento: values.fecha_nacimiento || null,
        edad: derivedAge ?? null, // compat si el backend la acepta
        peso: Number(values.peso),
        altura: Number(values.altura),
        nivel_experiencia: values.nivel_experiencia,
        objetivo: values.objetivo,
        sexo: values.sexo as any,
      });

      toast.success("Perfil completado. ¡Bienvenido!");
      await onCompleted?.();
    } catch (e: any) {
      console.error("[ONBOARD][form] submit error", e);
      const errorMessage = e?.message ?? "No se pudo guardar el perfil";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const watchedValues = form.watch();
  const hasData = watchedValues.username || watchedValues.nombre || (watchedValues as any).fecha_nacimiento;

  const step1Complete = !!(watchedValues.username && watchedValues.nombre);
  const step2Complete = !!((watchedValues as any).fecha_nacimiento && watchedValues.peso && watchedValues.altura);
  const step3Complete = !!(watchedValues.nivel_experiencia && watchedValues.objetivo && watchedValues.sexo);

  let currentStep = 1;
  let completedSteps = 0;
  if (step1Complete) {
    completedSteps = 1;
    currentStep = 2;
  }
  if (step2Complete) {
    completedSteps = 2;
    currentStep = 3;
  }
  if (step3Complete) {
    completedSteps = 3;
    currentStep = 3;
  }
  const progressValue = (completedSteps / 3) * 100;

  const calculatedAge = useMemo(() => ageFromDOB((watchedValues as any).fecha_nacimiento ?? null), [watchedValues]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-muted-foreground">Progreso del perfil</span>
              <span className="text-primary">Paso {currentStep} de 3</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div
                className={`flex items-center gap-3 text-sm transition-opacity ${
                  step1Complete ? "opacity-100" : "opacity-60"
                }`}
              >
                <div className={`p-2 rounded-lg ${step1Complete ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Cuenta</div>
                  <div className="text-xs text-muted-foreground">Usuario y nombre</div>
                </div>
              </div>
              <div
                className={`flex items-center gap-3 text-sm transition-opacity ${
                  step2Complete ? "opacity-100" : "opacity-60"
                }`}
              >
                <div className={`p-2 rounded-lg ${step2Complete ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Datos personales</div>
                  <div className="text-xs text-muted-foreground">Fecha de nacimiento, edad, peso, altura</div>
                </div>
              </div>
              <div
                className={`flex items-center gap-3 text-sm transition-opacity ${
                  step3Complete ? "opacity-100" : "opacity-60"
                }`}
              >
                <div className={`p-2 rounded-lg ${step3Complete ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Objetivos</div>
                  <div className="text-xs text-muted-foreground">Experiencia y metas</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-lg border-0 bg-card">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Completa tu perfil</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Toda la información es necesaria para personalizar tu experiencia
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Información de cuenta</h3>
                    <Badge variant={step1Complete ? "default" : "secondary"} className="text-xs">
                      Paso 1
                    </Badge>
                  </div>

                  {/* Username */}
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Nombre de usuario
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          id="username"
                          placeholder="tu_usuario"
                          {...form.register("username")}
                          onBlur={handleCheckAvailability}
                          autoComplete="username"
                          className="h-11"
                          aria-invalid={!!form.formState.errors.username || usernameHasUppercase}
                          aria-describedby="username-rules username-error-help"
                          onKeyDown={(e) => {
                            if (e.key === " ") e.preventDefault();
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCheckAvailability}
                        disabled={checking}
                        className="h-11 px-4 bg-transparent"
                      >
                        {checking ? <CalendarIcon className="h-4 w-4 animate-spin" /> : "Verificar"}
                      </Button>
                      <AnimatePresence mode="wait">
                        {available === true && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center justify-center w-11 h-11"
                          >
                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          </motion.div>
                        )}
                        {available === false && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center justify-center w-11 h-11"
                          >
                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {form.formState.errors.username && (
                      <motion.p
                        id="username-error-help"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive flex items-center gap-2"
                        role="alert"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {form.formState.errors.username.message}
                      </motion.p>
                    )}
                    {!form.formState.errors.username && usernameHasUppercase && (
                      <p id="username-error-help" className="text-xs text-destructive" role="alert">
                        El username debe estar en <b>minúsculas</b>.
                      </p>
                    )}
                    <p id="username-rules" className="text-xs text-muted-foreground">
                      3–20 caracteres, solo <b>minúsculas</b>, números y “_”
                    </p>
                  </div>

                  {/* Nombre */}
                  <div className="space-y-3">
                    <Label htmlFor="nombre" className="text-sm font-medium">
                      Nombre completo
                    </Label>
                    <Input id="nombre" placeholder="Tu nombre completo" {...form.register("nombre")} className="h-11" />
                    {form.formState.errors.nombre && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive flex items-center gap-2"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {form.formState.errors.nombre.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Datos personales</h3>
                    <Badge variant={step2Complete ? "default" : "secondary"} className="text-xs">
                      Paso 2
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fecha de nacimiento (con fix local) */}
                    <div className="space-y-3">
                      <Label htmlFor="fecha_nacimiento" className="text-sm font-medium">
                        Fecha de nacimiento
                      </Label>
                      <Controller
                        control={form.control}
                        name="fecha_nacimiento"
                        render={({ field }) => (
                          <DatePicker
                            date={parseLocalISODate(field.value)}
                            onDateChange={(date) => {
                              if (date) field.onChange(format(date, "yyyy-MM-dd"));
                            }}
                            disabled={(date) => isAfter(date, maxDOB) || isBefore(date, minDOB)}
                            minDate={minDOB}
                            maxDate={maxDOB}
                            captionLayout="dropdown"
                            fromYear={minDOB.getFullYear()}
                            toYear={maxDOB.getFullYear()}
                          />
                        )}
                      />
                      {(form.formState.errors as any).fecha_nacimiento && (
                        <p className="text-xs text-destructive">
                          {(form.formState.errors as any).fecha_nacimiento.message as string}
                        </p>
                      )}
                    </div>

                    {/* Edad (solo lectura) */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Edad</Label>
                      <div className="flex items-center h-11">
                        {calculatedAge !== null ? (
                          <Badge variant="secondary" className="text-base px-4 py-2">
                            {calculatedAge} años
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>

                    {/* Peso */}
                    <div className="space-y-3">
                      <Label htmlFor="peso" className="text-sm font-medium">
                        Peso (kg)
                      </Label>
                      <Input
                        id="peso"
                        type="number"
                        step={0.1}
                        min={1}
                        inputMode="decimal"
                        placeholder="70.5"
                        onKeyDown={(e) => {
                          const bad = ["e", "E", "+", "-"];
                          if (bad.includes(e.key)) e.preventDefault();
                        }}
                        {...form.register("peso", { valueAsNumber: true })}
                        className="h-11"
                      />
                      {form.formState.errors.peso && (
                        <p className="text-xs text-destructive">{form.formState.errors.peso.message}</p>
                      )}
                    </div>

                    {/* Altura */}
                    <div className="space-y-3">
                      <Label htmlFor="altura" className="text-sm font-medium">
                        Altura (cm)
                      </Label>
                      <Input
                        id="altura"
                        type="number"
                        step={1}
                        min={100}
                        max={999}
                        inputMode="numeric"
                        pattern="\d{3}"
                        placeholder="175"
                        onKeyDown={blockNonDigits}
                        {...form.register("altura", { valueAsNumber: true })}
                        className="h-11"
                      />
                      {form.formState.errors.altura && (
                        <p className="text-xs text-destructive">{form.formState.errors.altura.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Objetivos de entrenamiento</h3>
                    <Badge variant={step3Complete ? "default" : "secondary"} className="text-xs">
                      Paso 3
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nivel experiencia */}
                    <div className="space-y-3">
                      <Label htmlFor="nivel_experiencia" className="text-sm font-medium">
                        Nivel de experiencia
                      </Label>
                      <Controller
                        control={form.control}
                        name="nivel_experiencia"
                        render={({ field }) => (
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger id="nivel_experiencia" className="h-11">
                              <SelectValue placeholder="Selecciona tu nivel" />
                            </SelectTrigger>
                            <SelectContent>
                              {NIVELES.map((n) => (
                                <SelectItem key={n} value={n}>
                                  {capitalize(n)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.nivel_experiencia && (
                        <p className="text-xs text-destructive">{form.formState.errors.nivel_experiencia.message}</p>
                      )}
                    </div>

                    {/* Objetivo */}
                    <div className="space-y-3">
                      <Label htmlFor="objetivo" className="text-sm font-medium">
                        Objetivo principal
                      </Label>
                      <Controller
                        control={form.control}
                        name="objetivo"
                        render={({ field }) => (
                          <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger id="objetivo" className="h-11">
                              <SelectValue placeholder="¿Cuál es tu meta?" />
                            </SelectTrigger>
                            <SelectContent>
                              {OBJETIVOS.map((o) => (
                                <SelectItem key={o} value={o}>
                                  {capitalize(o)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.objetivo && (
                        <p className="text-xs text-destructive">{form.formState.errors.objetivo.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Sexo */}
                  <div className="space-y-3">
                    <Label htmlFor="sexo" className="text-sm font-medium">
                      Sexo
                    </Label>
                    <Controller
                      control={form.control}
                      name="sexo"
                      render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <SelectTrigger id="sexo" className="h-11 max-w-xs">
                            <SelectValue placeholder="Selecciona una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            {SEXOS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {capitalize(s)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.sexo && (
                      <p className="text-xs text-destructive">{form.formState.errors.sexo.message}</p>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando perfil...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Completar perfil
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-2xl shadow-lg border-0 bg-muted/30 backdrop-blur-sm sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasData ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {(watchedValues as any).username && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Usuario:</span>
                      <Badge variant="outline">@{(watchedValues as any).username}</Badge>
                    </div>
                  )}
                  {(watchedValues as any).nombre && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Nombre:</span>
                      <span className="text-sm font-medium">{(watchedValues as any).nombre}</span>
                    </div>
                  )}
                  {(watchedValues as any).fecha_nacimiento && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fecha de nacimiento:</span>
                      <span className="text-sm font-medium">{(watchedValues as any).fecha_nacimiento}</span>
                    </div>
                  )}
                  {calculatedAge !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Edad:</span>
                      <Badge variant="secondary">{calculatedAge} años</Badge>
                    </div>
                  )}
                  {(watchedValues as any).peso && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Peso:</span>
                      <span className="text-sm font-medium">{(watchedValues as any).peso} kg</span>
                    </div>
                  )}
                  {(watchedValues as any).altura && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Altura:</span>
                      <span className="text-sm font-medium">{(watchedValues as any).altura} cm</span>
                    </div>
                  )}
                  {(watchedValues as any).nivel_experiencia && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Nivel:</span>
                      <Badge variant="secondary">{capitalize((watchedValues as any).nivel_experiencia)}</Badge>
                    </div>
                  )}
                  {(watchedValues as any).objetivo && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Objetivo:</span>
                      <Badge variant="secondary">{capitalize((watchedValues as any).objetivo)}</Badge>
                    </div>
                  )}
                  {(watchedValues as any).sexo && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Sexo:</span>
                      <span className="text-sm font-medium">{capitalize((watchedValues as any).sexo)}</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-3 rounded-full bg-muted mx-auto w-fit mb-3">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Completa el formulario para ver un resumen de tu perfil
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
