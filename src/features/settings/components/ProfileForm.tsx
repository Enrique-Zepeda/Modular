import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetCurrentUserProfileQuery } from "@/features/settings/api/profileApi";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// usa tu schema real si ya existe; si no, uno mínimo local:
const PerfilSchema = z.object({
  nombre: z.string().optional(),
  username: z.string().optional(),
  correo: z.string().email().optional(),
  edad: z.number().int().positive().optional().or(z.string().optional()),
  peso: z.number().positive().optional().or(z.string().optional()),
  altura: z.number().positive().optional().or(z.string().optional()),
  objetivo: z.string().optional(),
  nivel_experiencia: z.string().optional(),
  sexo: z.string().optional(),
});

type PerfilForm = z.infer<typeof PerfilSchema>;

export function Perfil() {
  const { data: perfil, isLoading, isError, error } = useGetCurrentUserProfileQuery();

  const { register, reset } = useForm<PerfilForm>({
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
    },
  });

  // Cuando llegan los datos, poblar el form
  useEffect(() => {
    if (perfil) {
      reset({
        nombre: perfil.nombre ?? "",
        username: perfil.username ?? "",
        correo: perfil.correo ?? "",
        edad: perfil.edad ?? "",
        peso: perfil.peso ?? "",
        altura: perfil.altura ?? "",
        objetivo: perfil.objetivo ?? "",
        nivel_experiencia: perfil.nivel_experiencia ?? "",
        sexo: perfil.sexo ?? "",
      });
    }
  }, [perfil, reset]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Puedes usar Skeletons de tu lib de UI */}
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            No se pudo cargar tu perfil{(error as any)?.message ? `: ${(error as any).message}` : ""}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" {...register("nombre")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register("username")} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="correo">Correo</Label>
          <Input id="correo" {...register("correo")} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edad">Edad</Label>
          <Input id="edad" type="number" {...register("edad")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input id="peso" type="number" step="0.1" {...register("peso")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="altura">Altura (cm)</Label>
          <Input id="altura" type="number" step="0.1" {...register("altura")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objetivo">Objetivo</Label>
          <Input id="objetivo" {...register("objetivo")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nivel_experiencia">Nivel</Label>
          <Input id="nivel_experiencia" {...register("nivel_experiencia")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sexo">Sexo</Label>
          <Input id="sexo" {...register("sexo")} />
        </div>
      </CardContent>
    </Card>
  );
}
