import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Palette, Shield, Settings } from "lucide-react";
import { AppearanceCard, ChangePasswordForm, Perfil } from "@/features/settings/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="border-b border-border/30 glass-effect">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 glass-effect animate-scale-in">
                <Settings className="h-7 w-7 text-primary" />
              </div>
              <div className="animate-slide-in">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text ">
                  Configuración
                </h1>
                <p className="text-lg text-muted-foreground mt-1 font-medium">
                  Personaliza tu experiencia y gestiona tu cuenta
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <div className="flex justify-center animate-fade-in">
            <TabsList className="grid w-full max-w-3xl grid-cols-4 h-16 p-2 glass-card border-0 bg-transparent">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-3 px-8 py-4 text-sm font-semibold transition-all duration-300 data-[state=active]:glass-effect data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 rounded-xl premium-hover"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>

              <TabsTrigger
                value="appearance"
                className="flex items-center gap-3 px-8 py-4 text-sm font-semibold transition-all duration-300 data-[state=active]:glass-effect data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 rounded-xl premium-hover"
              >
                <Palette className="h-5 w-5" />
                <span className="hidden sm:inline">Apariencia</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-3 px-8 py-4 text-sm font-semibold transition-all duration-300 data-[state=active]:glass-effect data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 rounded-xl premium-hover"
              >
                <Shield className="h-5 w-5" />
                <span className="hidden sm:inline">Seguridad</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-8 animate-fade-in">
            <Card className="glass-card border-0 premium-hover">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <div className="p-3 rounded-xl glass-effect border border-primary/20">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  Información Personal
                  <Badge variant="secondary" className="ml-auto glass-effect border-0 text-green-400 bg-green-400/10">
                    <div className="status-dot status-available mr-2"></div>
                    Activo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Perfil />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-8 animate-fade-in">
            <Card className="glass-card border-0 premium-hover">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <div className="p-3 rounded-xl glass-effect border border-primary/20">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  Apariencia
                  <Badge variant="secondary" className="ml-auto glass-effect border-0 text-blue-400 bg-blue-400/10">
                    <div className="status-dot status-available mr-2"></div>
                    Personalizable
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AppearanceCard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-8 animate-fade-in">
            <Card className="glass-card border-0 premium-hover">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <div className="p-3 rounded-xl glass-effect border border-primary/20">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  Seguridad
                  <Badge variant="secondary" className="ml-auto glass-effect border-0 text-green-400 bg-green-400/10">
                    <div className="status-dot status-available mr-2"></div>
                    Protegido
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-12">
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
