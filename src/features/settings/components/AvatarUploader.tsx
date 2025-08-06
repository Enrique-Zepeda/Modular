import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload, User, X } from "lucide-react";

export default function AvatarUploader() {
  // Mock data para mostrar la UI
  const avatarUrl = null; // Cambiar a string para mostrar avatar
  const isUploading = false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Avatar" className="object-cover" />
          ) : (
            <AvatarFallback className="text-2xl">
              <User className="h-12 w-12" />
            </AvatarFallback>
          )}
        </Avatar>

        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Foto de perfil</h3>
            <p className="text-sm text-muted-foreground">JPG, PNG o WebP. Máximo 2MB.</p>
          </div>

          <div className="flex gap-2">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={isUploading} />

            <Button type="button" variant="outline" disabled={isUploading} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {isUploading ? "Subiendo..." : "Subir foto"}
            </Button>

            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                disabled={isUploading}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
