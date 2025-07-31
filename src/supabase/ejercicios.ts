import { supabase } from './client'

export async function registrarEjercicio({ nombre, grupo_muscular, descripcion }: {
  nombre: string,
  grupo_muscular: string,
  descripcion: string
}) {
  const { data, error } = await supabase.from('Ejercicios').insert([{ nombre, grupo_muscular, descripcion }])
  return { data, error }
}