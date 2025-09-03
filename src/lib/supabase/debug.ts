// Util de diagnóstico temporal para debuggear problemas de RLS
// TODO: Eliminar después de resolver el problema 403

import { supabase } from "./client";

export async function debugAuthStatus() {
  try {
    console.log("=== DEBUG AUTH STATUS ===");
    
    // 1. Verificar sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("Session:", session);
    console.log("Session error:", sessionError);
    
    if (session?.user) {
      console.log("User ID:", session.user.id);
      console.log("User email:", session.user.email);
      
      // 2. Verificar si existe RPC current_usuario_id
      try {
        const { data: currentUserId, error: rpcError } = await supabase.rpc('current_usuario_id');
        console.log("current_usuario_id() result:", currentUserId);
        console.log("RPC error:", rpcError);
      } catch (e) {
        console.log("RPC current_usuario_id not available:", e);
      }
      
      // 3. Verificar si existe perfil en Usuarios
      const { data: usuario, error: usuarioError } = await supabase
        .from('Usuarios')
        .select('id_usuario, correo, auth_uid')
        .eq('auth_uid', session.user.id)
        .single();
      
      console.log("Usuario profile:", usuario);
      console.log("Usuario error:", usuarioError);
      
      // 4. Verificar permisos en tablas
      const { data: rutinasTest, error: rutinasError } = await supabase
        .from('Rutinas')
        .select('count')
        .limit(1);
      
      console.log("Rutinas access test:", rutinasTest);
      console.log("Rutinas error:", rutinasError);
      
      // 5. Verificar políticas RLS
      try {
        const { data: policies, error: policiesError } = await supabase
          .from('information_schema.policies')
          .select('*')
          .eq('table_name', 'Rutinas');
        
        console.log("RLS Policies for Rutinas:", policies);
        console.log("Policies error:", policiesError);
      } catch (e) {
        console.log("Could not check RLS policies:", e);
      }
      
    } else {
      console.log("No active session");
    }
    
    console.log("=== END DEBUG ===");
    
    return {
      session,
      sessionError,
      usuario: session?.user ? await supabase
        .from('Usuarios')
        .select('id_usuario, correo, auth_uid')
        .eq('auth_uid', session.user.id)
        .single() : null
    };
    
  } catch (error) {
    console.error("Debug error:", error);
    return { error };
  }
}

export async function debugCreateRutina() {
  try {
    console.log("=== DEBUG CREATE RUTINA ===");
    
    const testPayload = {
      nombre: "Test Debug Rutina",
      descripcion: "Rutina temporal para debug",
      nivel_recomendado: "principiante",
      objetivo: "fuerza",
      duracion_estimada: 30
    };
    
    console.log("Test payload:", testPayload);
    
    // 1. Verificar si podemos hacer INSERT
    const { data, error } = await supabase
      .from('Rutinas')
      .insert([testPayload])
      .select()
      .single();
    
    console.log("Insert result:", data);
    console.log("Insert error:", error);
    
    // Si se creó, limpiar
    if (data) {
      await supabase.from('Rutinas').delete().eq('id_rutina', data.id_rutina);
      console.log("Test rutina cleaned up");
    }
    
    console.log("=== END DEBUG ===");
    
    return { data, error };
    
  } catch (error) {
    console.error("Debug create rutina error:", error);
    return { error };
  }
}

export async function debugRLSStatus() {
  try {
    console.log("=== DEBUG RLS STATUS ===");
    
    // Verificar si RLS está habilitado
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('table_name, is_security_enabled')
      .eq('table_schema', 'public')
      .in('table_name', ['Rutinas', 'UsuarioRutina', 'EjerciciosRutinas']);
    
    console.log("RLS Status:", rlsStatus);
    console.log("RLS Status error:", rlsError);
    
    // Verificar políticas existentes
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_schema', 'public')
      .in('table_name', ['Rutinas', 'UsuarioRutina', 'EjerciciosRutinas']);
    
    console.log("Existing Policies:", policies);
    console.log("Policies error:", policiesError);
    
    console.log("=== END RLS DEBUG ===");
    
    return { rlsStatus, policies };
    
  } catch (error) {
    console.error("RLS Debug error:", error);
    return { error };
  }
}

export async function debugUserProfile() {
  try {
    console.log("=== DEBUG USER PROFILE ===");
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Verificar perfil en Usuarios
      const { data: usuario, error: usuarioError } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('auth_uid', session.user.id)
        .single();
      
      console.log("Usuario completo:", usuario);
      console.log("Usuario error:", usuarioError);
      
      // Si no existe, intentar crearlo manualmente
      if (!usuario && !usuarioError) {
        console.log("Intentando crear perfil manualmente...");
        
        const { data: newUsuario, error: createError } = await supabase
          .from('Usuarios')
          .insert([{
            auth_uid: session.user.id,
            correo: session.user.email,
            fecha_registro: new Date().toISOString().split('T')[0]
          }])
          .select()
          .single();
        
        console.log("Nuevo usuario creado:", newUsuario);
        console.log("Create error:", createError);
      }
    }
    
    console.log("=== END USER PROFILE DEBUG ===");
    
  } catch (error) {
    console.error("User Profile Debug error:", error);
  }
}
