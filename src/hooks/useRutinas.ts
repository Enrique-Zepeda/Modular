import { useState, useCallback } from 'react';
import { RutinasService } from '../services/rutinasService';
import { IRutina, IRutinaInput } from '../types/rutina';

interface IUseRutinasReturn {
  rutinas: IRutina[];
  isLoading: boolean;
  error: string | null;
  crearRutina: (rutina: IRutinaInput) => Promise<void>;
  obtenerRutinas: () => Promise<void>;
  obtenerRutinaPorId: (id: number) => Promise<IRutina | null>;
  actualizarRutina: (id: number, rutina: Partial<IRutinaInput>) => Promise<void>;
  eliminarRutina: (id: number) => Promise<void>;
  limpiarError: () => void;
}

export const useRutinas = (): IUseRutinasReturn => {
  const [rutinas, setRutinas] = useState<IRutina[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const limpiarError = useCallback((): void => {
    setError(null);
  }, []);

  const crearRutina = useCallback(async (rutina: IRutinaInput): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await RutinasService.crearRutina(rutina);
      // Recargar la lista de rutinas después de crear una nueva
      await obtenerRutinas();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la rutina';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerRutinas = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const rutinasData = await RutinasService.obtenerRutinas();
      setRutinas(rutinasData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener las rutinas';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerRutinaPorId = useCallback(async (id: number): Promise<IRutina | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const rutina = await RutinasService.obtenerRutinaPorId(id);
      return rutina;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener la rutina';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const actualizarRutina = useCallback(async (id: number, rutina: Partial<IRutinaInput>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await RutinasService.actualizarRutina(id, rutina);
      // Recargar la lista de rutinas después de actualizar
      await obtenerRutinas();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la rutina';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [obtenerRutinas]);

  const eliminarRutina = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await RutinasService.eliminarRutina(id);
      // Actualizar la lista de rutinas después de eliminar
      setRutinas(prevRutinas => prevRutinas.filter(rutina => rutina.id_rutina !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la rutina';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    rutinas,
    isLoading,
    error,
    crearRutina,
    obtenerRutinas,
    obtenerRutinaPorId,
    actualizarRutina,
    eliminarRutina,
    limpiarError,
  };
}; 