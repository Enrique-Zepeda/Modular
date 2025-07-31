import { supabase } from '../supabase/client';
import { IRutinaInput, IRutina } from '../types/rutina';

export class RutinasService {
  /**
   * Crea una nueva rutina en la base de datos
   * @param rutina - Datos de la rutina a crear
   * @returns Promise<void>
   */
  static async crearRutina(rutina: IRutinaInput): Promise<void> {
    try {
      const { error } = await supabase
        .from('Rutinas')
        .insert([rutina]);

      if (error) {
        throw new Error(`Error al crear la rutina: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en crearRutina:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las rutinas
   * @returns Promise<IRutina[]>
   */
  static async obtenerRutinas(): Promise<IRutina[]> {
    try {
      const { data, error } = await supabase
        .from('Rutinas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener rutinas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en obtenerRutinas:', error);
      throw error;
    }
  }

  /**
   * Obtiene una rutina por ID
   * @param id - ID de la rutina
   * @returns Promise<IRutina | null>
   */
  static async obtenerRutinaPorId(id: number): Promise<IRutina | null> {
    try {
      const { data, error } = await supabase
        .from('Rutinas')
        .select('*')
        .eq('id_rutina', id)
        .single();

      if (error) {
        throw new Error(`Error al obtener la rutina: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerRutinaPorId:', error);
      throw error;
    }
  }

  /**
   * Actualiza una rutina existente
   * @param id - ID de la rutina
   * @param rutina - Datos actualizados de la rutina
   * @returns Promise<void>
   */
  static async actualizarRutina(id: number, rutina: Partial<IRutinaInput>): Promise<void> {
    try {
      const { error } = await supabase
        .from('Rutinas')
        .update(rutina)
        .eq('id_rutina', id);

      if (error) {
        throw new Error(`Error al actualizar la rutina: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en actualizarRutina:', error);
      throw error;
    }
  }

  /**
   * Elimina una rutina
   * @param id - ID de la rutina
   * @returns Promise<void>
   */
  static async eliminarRutina(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('Rutinas')
        .delete()
        .eq('id_rutina', id);

      if (error) {
        throw new Error(`Error al eliminar la rutina: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en eliminarRutina:', error);
      throw error;
    }
  }
} 