import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import {
  setRutinaActual,
  agregarEjercicioSeleccionado,
  removerEjercicioSeleccionado,
  limpiarEjerciciosSeleccionados,
  setFiltrosEjercicios,
  setLoading,
} from "../slices/rutinasSlice";
import type { Ejercicio, FiltrosEjercicios } from "../../../types/rutinas";

export const useRutinas = () => {
  const dispatch = useDispatch();
  const rutinasState = useSelector((state: RootState) => state.rutinas);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setRutinaActualAction = (rutina: any) => {
    dispatch(setRutinaActual(rutina));
  };

  const agregarEjercicioSeleccionadoAction = (ejercicio: Ejercicio) => {
    dispatch(agregarEjercicioSeleccionado(ejercicio));
  };

  const removerEjercicioSeleccionadoAction = (idEjercicio: number) => {
    dispatch(removerEjercicioSeleccionado(idEjercicio));
  };

  const limpiarEjerciciosSeleccionadosAction = () => {
    dispatch(limpiarEjerciciosSeleccionados());
  };

  const setFiltrosEjerciciosAction = (filtros: FiltrosEjercicios) => {
    dispatch(setFiltrosEjercicios(filtros));
  };

  const setLoadingAction = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  return {
    ...rutinasState,
    setRutinaActual: setRutinaActualAction,
    agregarEjercicioSeleccionado: agregarEjercicioSeleccionadoAction,
    removerEjercicioSeleccionado: removerEjercicioSeleccionadoAction,
    limpiarEjerciciosSeleccionados: limpiarEjerciciosSeleccionadosAction,
    setFiltrosEjercicios: setFiltrosEjerciciosAction,
    setLoading: setLoadingAction,
  };
};
