import * as React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "react-hot-toast";
import { Loader2, Check, X } from "lucide-react";

type Props = {
  defaults?: Partial<OnboardingFormValues>;
  onCompleted?: () => void | Promise<void>;
};

const DEBUG_ONBOARD = import.meta.env.DEV;
const log = (...a: any[]) => DEBUG_ONBOARD && console.log("[ONBOARD][form]", ...a);

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export default function ProfileForm({ defaults, onCompleted }: Props) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: defaults?.username ?? "",
      nombre: defaults?.nombre ?? "",
      edad: (defaults?.edad ?? ("" as unknown as number)) as number,
      peso: (defaults?.peso ?? ("" as unknown as number)) as number,
      altura: (defaults?.altura ?? ("" as unknown as number)) as number,
      nivel_experiencia: (defaults?.nivel_experiencia as any) ?? ("" as any),
      objetivo: (defaults?.objetivo as any) ?? ("" as any),
      sexo: (defaults?.sexo as any) ?? ("" as any), // 👈 nuevo
    },
    mode: "onBlur",
  });

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

  const onSubmit = async (values: OnboardingFormValues) => {
    try {
      log("submit values", values);
      const username = values.username.trim();
      const nombre = values.nombre.trim();

      const ok = await checkUsernameAvailability(username);
      log("username available?", username, ok);
      if (!ok) {
        form.setError("username", { type: "validate", message: "Este usuario ya existe" });
        toast.error("El nombre de usuario ya está en uso.");
        return;
      }

      const saved = await upsertCurrentUserProfile({
        username,
        nombre,
        edad: Number(values.edad),
        peso: Number(values.peso),
        altura: Number(values.altura),
        nivel_experiencia: values.nivel_experiencia,
        objetivo: values.objetivo,
        sexo: values.sexo as any, // 👈 nuevo
      });

      log("saved profile", saved);
      toast.success("Perfil completado. ¡Bienvenido!");
      await onCompleted?.();
    } catch (e: any) {
      console.error("[ONBOARD][form] submit error", e);
      toast.error(e?.message ?? "No se pudo guardar el perfil");
    }
  };

  return (
    <div className="mx-auto max-w-xl p-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Completa tu perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="username"
                  placeholder="tu_usuario"
                  {...form.register("username")}
                  onBlur={handleCheckAvailability}
                  autoComplete="username"
                />
                <Button type="button" variant="secondary" onClick={handleCheckAvailability} disabled={checking}>
                  {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Comprobar"}
                </Button>
                {available === true && <Check className="h-4 w-4 text-green-500" aria-label="disponible" />}
                {available === false && <X className="h-4 w-4 text-red-500" aria-label="no disponible" />}
              </div>
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
              )}
              <p className="text-xs text-muted-foreground">3-20 caracteres, minúsculas, números y “_”.</p>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" placeholder="Tu nombre" {...form.register("nombre")} />
              {form.formState.errors.nombre && (
                <p className="text-sm text-red-500">{form.formState.errors.nombre.message}</p>
              )}
            </div>

            {/* Edad / Peso / Altura */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  type="number"
                  min={13}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  pattern="\d*"
                  onKeyDown={blockNonDigits}
                  {...form.register("edad", { valueAsNumber: true })}
                />
                {form.formState.errors.edad && (
                  <p className="text-sm text-red-500">{form.formState.errors.edad.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step={0.1}
                  min={1}
                  inputMode="decimal"
                  onKeyDown={(e) => {
                    const bad = ["e", "E", "+", "-"];
                    if (bad.includes(e.key)) e.preventDefault();
                  }}
                  {...form.register("peso", { valueAsNumber: true })}
                />
                {form.formState.errors.peso && (
                  <p className="text-sm text-red-500">{form.formState.errors.peso.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  type="number"
                  step={1}
                  min={100}
                  max={999}
                  inputMode="numeric"
                  pattern="\d{3}"
                  onKeyDown={blockNonDigits}
                  {...form.register("altura", { valueAsNumber: true })}
                />
                {form.formState.errors.altura && (
                  <p className="text-sm text-red-500">{form.formState.errors.altura.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Solo números, 3 dígitos (ej. 173).</p>
              </div>
            </div>

            {/* Nivel experiencia */}
            <div className="space-y-2">
              <Label htmlFor="nivel_experiencia">Nivel de experiencia</Label>
              <Controller
                control={form.control}
                name="nivel_experiencia"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="nivel_experiencia">
                      <SelectValue placeholder="Selecciona un nivel" />
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
                <p className="text-sm text-red-500">{form.formState.errors.nivel_experiencia.message}</p>
              )}
            </div>

            {/* Objetivo */}
            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo</Label>
              <Controller
                control={form.control}
                name="objetivo"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="objetivo">
                      <SelectValue placeholder="Selecciona un objetivo" />
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
                <p className="text-sm text-red-500">{form.formState.errors.objetivo.message}</p>
              )}
            </div>

            {/* 👇 Nuevo: Sexo */}
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Controller
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="sexo">
                      <SelectValue placeholder="Selecciona tu sexo" />
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
                <p className="text-sm text-red-500">{form.formState.errors.sexo.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Guardar y continuar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
