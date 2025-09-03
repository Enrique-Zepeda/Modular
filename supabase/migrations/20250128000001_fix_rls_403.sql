-- Migración de emergencia para resolver error 403 al crear rutinas
-- Fecha: 2025-01-28
-- Descripción: Configuración mínima de RLS para permitir inserción de rutinas

-- 1. Verificar que la columna auth_uid existe en Usuarios
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Usuarios' AND column_name = 'auth_uid') THEN
        ALTER TABLE public."Usuarios" ADD COLUMN auth_uid uuid;
    END IF;
END $$;

-- 2. Crear función current_usuario_id si no existe
CREATE OR REPLACE FUNCTION public.current_usuario_id()
RETURNS integer
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
SET search_path = public 
AS $$
  SELECT id_usuario FROM public."Usuarios" WHERE auth_uid = auth.uid()
$$;

-- 3. Vincular usuarios existentes por email si es posible
UPDATE public."Usuarios" u
SET auth_uid = au.id
FROM auth.users au
WHERE au.email = u.correo AND u.auth_uid IS NULL;

-- 4. Crear perfil automáticamente para usuarios autenticados que no tengan uno
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_user_id integer;
BEGIN
  -- Solo proceder si hay un usuario autenticado
  IF v_uid IS NULL THEN
    RETURN;
  END IF;

  -- Verificar si ya existe el perfil
  SELECT id_usuario INTO v_user_id FROM public."Usuarios" WHERE auth_uid = v_uid;
  
  -- Si no existe, crearlo
  IF v_user_id IS NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
    
    INSERT INTO public."Usuarios"(auth_uid, correo, fecha_registro)
    VALUES (v_uid, v_email, current_date)
    ON CONFLICT (auth_uid) DO NOTHING;
  END IF;
END;
$$;

-- 5. Habilitar RLS en las tablas principales
ALTER TABLE public."Rutinas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."UsuarioRutina" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EjerciciosRutinas" ENABLE ROW LEVEL SECURITY;

-- 6. Conceder permisos básicos
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Rutinas" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."UsuarioRutina" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."EjerciciosRutinas" TO authenticated;

-- 7. Política temporal para INSERT en Rutinas (PERMITIR TODO por ahora)
DROP POLICY IF EXISTS rutinas_insert_temp ON public."Rutinas";
CREATE POLICY rutinas_insert_temp
ON public."Rutinas" FOR INSERT
WITH CHECK (true);

-- 8. Política temporal para SELECT en Rutinas (PERMITIR TODO por ahora)
DROP POLICY IF EXISTS rutinas_select_temp ON public."Rutinas";
CREATE POLICY rutinas_select_temp
ON public."Rutinas" FOR SELECT
USING (true);

-- 9. Política temporal para UsuarioRutina
DROP POLICY IF EXISTS ur_insert_temp ON public."UsuarioRutina";
CREATE POLICY ur_insert_temp
ON public."UsuarioRutina" FOR INSERT
WITH CHECK (true);

-- 10. Trigger simple para vincular rutina con usuario
CREATE OR REPLACE FUNCTION public.link_rutina_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_user_id integer;
BEGIN
  -- Solo proceder si hay un usuario autenticado
  IF v_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Asegurar que existe el perfil del usuario
  PERFORM public.ensure_user_profile();
  
  -- Obtener el ID del usuario
  SELECT id_usuario INTO v_user_id FROM public."Usuarios" WHERE auth_uid = v_uid;
  
  -- Si se pudo obtener el ID, crear el vínculo
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public."UsuarioRutina"(id_usuario, id_rutina)
    VALUES (v_user_id, NEW.id_rutina)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 11. Crear el trigger
DROP TRIGGER IF EXISTS trg_link_rutina_user ON public."Rutinas";
CREATE TRIGGER trg_link_rutina_user
  AFTER INSERT ON public."Rutinas"
  FOR EACH ROW
  EXECUTE FUNCTION public.link_rutina_to_user();

-- 12. Comentario sobre políticas temporales
COMMENT ON POLICY rutinas_insert_temp ON public."Rutinas" IS 'POLÍTICA TEMPORAL - Permitir inserción de rutinas. REEMPLAZAR con políticas RLS apropiadas después de resolver 403.';
COMMENT ON POLICY rutinas_select_temp ON public."Rutinas" IS 'POLÍTICA TEMPORAL - Permitir selección de rutinas. REEMPLAZAR con políticas RLS apropiadas después de resolver 403.';
