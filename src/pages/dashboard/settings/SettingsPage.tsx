import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Palette, Shield, Settings } from "lucide-react";
import { AppearanceCard, ChangePasswordForm, Perfil } from "@/features/settings/components";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-border/30 glass-effect">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-6">
              <div className="p-2 sm:p-3 rounded-2xl bg-primary/10 border border-primary/20 glass-effect animate-scale-in">
                <Settings className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div className="animate-slide-in space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-pretty">
                  Configuración
                </h1>
                <p className="text-xs sm:text-base lg:text-lg text-muted-foreground font-medium text-pretty">
                  Personaliza tu experiencia y gestiona tu cuenta
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-8">
          {/* Tabs selector: grid en mobile para que no haga overflow */}
          <div className="animate-fade-in">
            <div className="mx-auto w-full max-w-md sm:max-w-3xl">
              <TabsList className="grid grid-cols-3 w-full gap-1 sm:gap-2 h-auto sm:h-14 p-1 sm:p-2 glass-card border-0 bg-background/60 rounded-xl sm:rounded-2xl">
                <TabsTrigger
                  value="profile"
                  className="flex flex-col sm:flex-row w-full min-w-0 items-center justify-center gap-1 sm:gap-3 px-1.5 sm:px-6 py-2 sm:py-3 text-[0.65rem] sm:text-sm font-semibold transition-all duration-300 data-[state=active]:glass-effect data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 rounded-lg sm:rounded-xl premium-hover"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="leading-none">Perfil</span>
                </TabsTrigger>

                <TabsTrigger
                  value="appearance"
                  className="flex flex-col sm:flex-row w-full min-w-0 items-center justify-center gap-1 sm:gap-3 px-1.5 sm:px-6 py-2 sm:py-3 text-[0.65rem] sm:text-sm font-semibold transition-all duration-300 data-[state=active]:glass-effect data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 rounded-lg sm:rounded-xl premium-hover"
                >
                  <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="leading-none">Tema</span>
                </TabsTrigger>

                <TabsTrigger
                  value="security"
                  className="flex flex-col sm:flex-row w-full min-w-0 items-center justify-center gap-1 sm:gap-3 px-1.5 sm:px-6 py-2 sm:py-3 text-[0.65rem] sm:text-sm font-semibold transition-all duration-300 data-[state=active]:glass-effect data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 rounded-lg sm:rounded-xl premium-hover"
                >
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="leading-none">Seguridad</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Perfil */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-8 animate-fade-in">
            <Card className="glass-card border-0 premium-hover">
              <CardHeader className="px-3 sm:px-6 pt-4 pb-3 sm:pb-6">
                <CardTitle className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-base sm:text-xl lg:text-2xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-xl glass-effect border border-primary/20">
                      <User className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <span>Información Personal</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="w-fit sm:ml-auto glass-effect border-0 text-[0.65rem] sm:text-xs text-green-400 bg-green-400/10 flex items-center"
                  >
                    <div className="status-dot status-available mr-1.5" />
                    Activo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                <Perfil />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apariencia */}
          <TabsContent value="appearance" className="space-y-4 sm:space-y-8 animate-fade-in">
            <Card className="glass-card border-0 premium-hover">
              <CardHeader className="px-3 sm:px-6 pt-4 pb-3 sm:pb-6">
                <CardTitle className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-base sm:text-xl lg:text-2xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-xl glass-effect border border-primary/20">
                      <Palette className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <span>Apariencia</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="w-fit sm:ml-auto glass-effect border-0 text-[0.65rem] sm:text-xs text-blue-400 bg-blue-400/10 flex items-center"
                  >
                    <div className="status-dot status-available mr-1.5" />
                    Personalizable
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                <AppearanceCard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seguridad */}
          <TabsContent value="security" className="space-y-4 sm:space-y-8 animate-fade-in">
            <Card className="glass-card border-0 premium-hover">
              <CardHeader className="px-3 sm:px-6 pt-4 pb-3 sm:pb-6">
                <CardTitle className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-base sm:text-xl lg:text-2xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-xl glass-effect border border-primary/20">
                      <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <span>Seguridad</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="w-fit sm:ml-auto glass-effect border-0 text-[0.65rem] sm:text-xs text-green-400 bg-green-400/10 flex items-center"
                  >
                    <div className="status-dot status-available mr-1.5" />
                    Protegido
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-6 sm:space-y-12">
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
