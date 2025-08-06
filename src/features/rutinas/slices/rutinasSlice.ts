import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Rutina, Ejercicio, FiltrosEjercicios } from "../../../types/rutinas";

interface RutinasState {
  rutinaActual: Rutina | null;
  ejerciciosSeleccionados: Ejercicio[];
  filtrosEjercicios: FiltrosEjercicios;
  isLoading: boolean;
}

const initialState: RutinasState = {
  rutinaActual: null,
  ejerciciosSeleccionados: [],
  filtrosEjercicios: {},
  isLoading: false,
};

const rutinasSlice = createSlice({
  name: "rutinas",
  initialState,
  reducers: {
    setRutinaActual: (state, action: PayloadAction<Rutina | null>) => {
      state.rutinaActual = action.payload;
    },
    agregarEjercicioSeleccionado: (state, action: PayloadAction<Ejercicio>) => {
      const ejercicio = action.payload;
      const existe = state.ejerciciosSeleccionados.some(e => e.id === ejercicio.id);
      if (!existe) {
        state.ejerciciosSeleccionados.push(ejercicio);
      }
    },
    removerEjercicioSeleccionado: (state, action: PayloadAction<number>) => {
      state.ejerciciosSeleccionados = state.ejerciciosSeleccionados.filter(
        e => e.id !== action.payload
      );
    },
    limpiarEjerciciosSeleccionados: (state) => {
      state.ejerciciosSeleccionados = [];
    },
    setFiltrosEjercicios: (state, action: PayloadAction<FiltrosEjercicios>) => {
      state.filtrosEjercicios = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setRutinaActual,
  agregarEjercicioSeleccionado,
  removerEjercicioSeleccionado,
  limpiarEjerciciosSeleccionados,
  setFiltrosEjercicios,
  setLoading,
} = rutinasSlice.actions;

export default rutinasSlice.reducer; 