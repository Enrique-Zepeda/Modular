import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import toast from "react-hot-toast";
import { AvatarUploader } from "./AvatarUploader";

/**
 * Vista de Información Personal unificada con Avatar.
 * - Lee perfil del usuario actual desde public."Usuarios" por auth.uid().
 * - Muestra campos básicos con correo deshabilitado.
 * - Incluye uploader de avatar (guarda URL en Usuarios.url_avatar).
 *
 * Nota:
 * Si ya tenías esta vista con React Hook Form, puedes mantenerla.
 * Aquí uso estado local mínimo para no romper tu wiring actual.
 */

export function Perfil() {
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState({
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
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const user = authData?.user;
      if (!user) {
        setLoading(false);
        toast.error("No hay sesión activa.");
        return;
      }

      const { data, error } = await supabase.from("Usuarios").select("*").eq("auth_uid", user.id).single();

      if (error) throw error;

      setPerfil({
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

  return (
    <div className="grid gap-6">
      {/* Avatar unificado */}
      <AvatarUploader
        url={perfil.url_avatar || ""}
        onUpdated={(newUrl) => setPerfil((p) => ({ ...p, url_avatar: newUrl }))}
      />

      {/* Información personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
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
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={perfil.nombre} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={perfil.username} readOnly />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="correo">Correo</Label>
                <Input id="correo" value={perfil.correo} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input id="edad" value={perfil.edad} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input id="peso" value={perfil.peso} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input id="altura" value={perfil.altura} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo</Label>
                <Input id="objetivo" value={perfil.objetivo} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nivel_experiencia">Nivel</Label>
                <Input id="nivel_experiencia" value={perfil.nivel_experiencia} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Input id="sexo" value={perfil.sexo} readOnly />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
