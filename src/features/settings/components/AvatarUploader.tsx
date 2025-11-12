import * as React from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { UserAvatar } from "@/components/ui/user-avatar";

type Sexo = "masculino" | "femenino" | null;

type Props = {
  /** URL actual persistida en BD (puede ser null) */
  url: string | null;
  /** Sexo del usuario para fallback cuando no hay url */
  sexo?: Sexo;
  /** Callback tras persistir la nueva URL */
  onUpdated?: (publicUrl: string | null) => void;
};

/**
 * Muestra/actualiza la foto de perfil.
 * - Sube a Supabase Storage (bucket 'avatars', prefijo auth.uid()).
 * - Intenta persistir vía RPC update_current_user_avatar(p_url text).
 * - Si la RPC no existe (404/PGRST202), hace UPDATE directo en "Usuarios".
 */
export function AvatarUploader({ url, sexo, onUpdated }: Props) {
  const [uploading, setUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(url ?? null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setPreviewUrl(url ?? null);
  }, [url]);

  const handleSelectClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const persistUrl = React.useCallback(async (publicUrl: string) => {
    // 1) Intentar RPC
    const { error: rpcErr, status } = await supabase.rpc("update_current_user_avatar", { p_url: publicUrl });
    if (!rpcErr) return true;

    // 2) Si la RPC no existe aún, fallback a UPDATE directo por auth_uid
    const rpcNotFound = (rpcErr as any)?.code === "PGRST202" || status === 404;
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
    toast.error((rpcErr as any)?.message ?? "Error al guardar el avatar.");
    return false;
  }, []);

  const onFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        // Preview local
        const local = URL.createObjectURL(file);
        setPreviewUrl(local);

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
        setPreviewUrl(publicUrl);
        onUpdated?.(publicUrl);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message ?? "No se pudo actualizar el avatar.");
        // revert preview en fallo
        setPreviewUrl(url ?? null);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [persistUrl, url, onUpdated]
  );

  return (
    <Card className="border border-border/50 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Foto de perfil</CardTitle>
        <p className="text-sm text-muted-foreground">Sube una imagen para personalizar tu perfil</p>
      </CardHeader>

      <CardContent className="flex items-center gap-8 pt-0">
        <div className="relative">
          <UserAvatar
            url={previewUrl}
            sexo={sexo}
            alt="Avatar"
            size={96} // h-24 w-24
            className="border-4 border-primary/20 shadow-lg"
            fallbackText="AV"
          />
          {previewUrl && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
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

          <Button
            type="button"
            onClick={handleSelectClick}
            disabled={uploading}
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 min-w-40"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Cambiar foto
              </>
            )}
          </Button>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              <strong>Formatos permitidos:</strong> JPG, PNG o WEBP
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Tamaño máximo:</strong> 5MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AvatarUploader;
