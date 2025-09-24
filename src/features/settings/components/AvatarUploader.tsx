import { useCallback, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Muestra/actualiza la foto de perfil.
 * - Sube a Supabase Storage (bucket 'avatars', prefijo auth.uid()).
 * - Intenta persistir vía RPC update_current_user_avatar(p_url text).
 * - Si la RPC no existe aún (404/PGRST202), hace fallback a UPDATE directo en "Usuarios".
 */
export function AvatarUploader({ url, onUpdated }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fallback = useMemo(() => "👤", []);

  const handleSelectClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const persistUrl = useCallback(async (publicUrl) => {
    // 1) Intentar RPC
    const { error: rpcErr, status } = await supabase.rpc("update_current_user_avatar", { p_url: publicUrl });
    if (!rpcErr) return true;

    // 2) Si la RPC no existe aún, fallback a UPDATE directo por auth_uid
    const rpcNotFound = rpcErr?.code === "PGRST202" || status === 404;
    if (rpcNotFound) {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        toast.error("No hay sesión activa.");
        return false;
      }
      const uid = authData.user.id;
      const { error: upErr } = await supabase.from("Usuarios").update({ url_avatar: publicUrl }).eq("auth_uid", uid);
      if (upErr) {
        console.error(upErr);
        toast.error("No se pudo guardar el avatar en tu perfil.");
        return false;
      }
      return true;
    }

    // 3) Otro error de RPC
    console.error(rpcErr);
    toast.error(rpcErr?.message ?? "Error al guardar el avatar.");
    return false;
  }, []);

  const onFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        toast.error("Formato no permitido. Usa JPG, PNG o WEBP.");
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error("La imagen supera los 5MB.");
        return;
      }

      setUploading(true);
      try {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        const user = authData?.user;
        if (!user) throw new Error("No hay sesión activa.");

        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `avatar_${Date.now()}.${ext}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadErr } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
        if (uploadErr) throw uploadErr;

        const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        const publicUrl = publicData?.publicUrl;
        if (!publicUrl) throw new Error("No se pudo obtener la URL pública del avatar.");

        const ok = await persistUrl(publicUrl);
        if (!ok) throw new Error("No se pudo guardar el avatar en tu perfil.");

        toast.success("Avatar actualizado.");
        onUpdated?.(publicUrl);
      } catch (err) {
        console.error(err);
        toast.error(err?.message ?? "No se pudo actualizar el avatar.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [persistUrl, onUpdated]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto de perfil</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          {url ? <AvatarImage src={url} alt="Avatar" loading="lazy" /> : <AvatarFallback>{fallback}</AvatarFallback>}
        </Avatar>

        <div className="flex flex-col gap-2">
          <Label htmlFor="avatar-file" className="sr-only">
            Subir avatar
          </Label>
          <Input
            id="avatar-file"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFileChange}
          />
          <Button type="button" onClick={handleSelectClick} disabled={uploading} className="w-fit">
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {uploading ? "Subiendo..." : "Cambiar foto"}
          </Button>
          <p className="text-xs text-muted-foreground">Formatos: JPG, PNG o WEBP. Máx. 5MB.</p>
        </div>
      </CardContent>
    </Card>
  );
}
