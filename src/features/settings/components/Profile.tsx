import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Loader2 } from "lucide-react";
import { AvatarUploader } from "./AvatarUploader";

/* -------------------- Opciones en línea para los selects -------------------- */
const SEX_OPTIONS = ["masculino", "femenino"];
const OBJETIVO_OPTIONS = ["hipertrofia", "fuerza", "resistencia"];
const NIVEL_OPTIONS = ["principiante", "intermedio", "avanzado"];

/* ---------------------------- Validación con Zod ---------------------------- */
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
  edad: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 120), "Edad inválida"),
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

export function Perfil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false); // <-- NUEVO
  const initialUsernameRef = useRef("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    resolver: zodResolver(PerfilSchema),
    defaultValues: {
      nombre: "",
      username: "",
      correo: "",
      edad: "",
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
        edad: data?.edad ?? "",
        peso: data?.peso ?? "",
        altura: data?.altura ?? "",
        objetivo: data?.objetivo ?? "",
        nivel_experiencia: data?.nivel_experiencia ?? "",
        sexo: data?.sexo ?? "",
        url_avatar: data?.url_avatar ?? "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "No se pudo cargar tu perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* ---------- Chequeo de disponibilidad de username (RPC existente) --------- */
  const checkUsernameAvailability = async (candidate) => {
    const current = (candidate ?? "").trim().toLowerCase();
    const initial = (initialUsernameRef.current ?? "").trim().toLowerCase();
    if (!current || current === initial) return { available: true };

    const { data, error } = await supabase.rpc("username_is_available", { p_username: current });
    if (error) {
      console.error(error);
      toast.error("No se pudo verificar el username.");
      return { available: false, reason: "rpc_error" };
    }
    return { available: !!data };
  };

  const onUsernameBlur = async () => {
    const { available } = await checkUsernameAvailability(usernameWatch);
    if (!available) toast.error("Ese username ya está en uso.");
  };

  /* ------------------------------ Guardar datos ----------------------------- */
  const onSubmit = async (values) => {
    try {
      setSaving(true);

      // Validar username si cambió
      const { available } = await checkUsernameAvailability(values.username);
      if (!available) {
        setSaving(false);
        return;
      }

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const user = authData?.user;
      if (!user) throw new Error("No hay sesión activa.");

      const norm = (v) => (v === "" ? null : v);
      const payload = {
        nombre: norm(values.nombre),
        username: norm(values.username?.toLowerCase()),
        edad: values.edad ?? null,
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
        if (error.code === "23505") {
          toast.error("El username ya está en uso.");
        } else {
          toast.error(error.message ?? "No se pudo guardar.");
        }
        return;
      }

      // Sincroniza el form y muestra confirmaciones
      reset({
        nombre: data?.nombre ?? "",
        username: data?.username ?? "",
        correo: data?.correo ?? "",
        edad: data?.edad ?? "",
        peso: data?.peso ?? "",
        altura: data?.altura ?? "",
        objetivo: data?.objetivo ?? "",
        nivel_experiencia: data?.nivel_experiencia ?? "",
        sexo: data?.sexo ?? "",
        url_avatar: data?.url_avatar ?? "",
      });
      initialUsernameRef.current = data?.username ?? initialUsernameRef.current;

      toast.success("Cambios guardados correctamente."); // toast visible
      setJustSaved(true); // banner + botón “Guardado”
      setTimeout(() => setJustSaved(false), 3000); // se oculta en 3s
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const renderError = (field) =>
    errors?.[field]?.message ? <p className="text-sm text-destructive mt-1">{String(errors[field].message)}</p> : null;

  return (
    <div className="grid gap-6">
      {/* Región aria-live para lectores de pantalla */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {justSaved ? "Cambios guardados correctamente." : ""}
      </div>

      {/* Avatar unificado */}
      <AvatarUploader
        url={watch("url_avatar") || ""}
        onUpdated={(newUrl) => setValue("url_avatar", newUrl, { shouldDirty: true })}
      />

      {/* Información personal */}
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Información personal</CardTitle>
            {justSaved && (
              <Alert className="mt-1 border-green-500/50">
                <AlertTitle className="text-green-600">¡Guardado!</AlertTitle>
                <AlertDescription>Los cambios se guardaron correctamente.</AlertDescription>
              </Alert>
            )}
          </div>

          <Button onClick={handleSubmit(onSubmit)} disabled={saving || loading || (!isDirty && !justSaved)}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…
              </>
            ) : justSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Guardado
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          {loading ? (
            <>
              <div className="h-10 bg-muted rounded animate-pulse md:col-span-2" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
            </>
          ) : (
            <>
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" {...register("nombre")} />
                {renderError("nombre")}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username")} onBlur={onUsernameBlur} />
                {renderError("username")}
              </div>

              {/* Correo (no editable) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="correo">Correo</Label>
                <Input id="correo" {...register("correo")} disabled />
              </div>

              {/* Edad */}
              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input id="edad" type="number" step="1" {...register("edad")} />
                {renderError("edad")}
              </div>

              {/* Peso */}
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input id="peso" type="number" step="0.1" {...register("peso")} />
                {renderError("peso")}
              </div>

              {/* Altura */}
              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input id="altura" type="number" step="0.1" {...register("altura")} />
                {renderError("altura")}
              </div>

              {/* Objetivo */}
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Select
                  value={watch("objetivo") ?? ""}
                  onValueChange={(v) => setValue("objetivo", v, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {OBJETIVO_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError("objetivo")}
              </div>

              {/* Nivel de experiencia */}
              <div className="space-y-2">
                <Label>Nivel</Label>
                <Select
                  value={watch("nivel_experiencia") ?? ""}
                  onValueChange={(v) => setValue("nivel_experiencia", v, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError("nivel_experiencia")}
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select value={watch("sexo") ?? ""} onValueChange={(v) => setValue("sexo", v, { shouldDirty: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEX_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
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
