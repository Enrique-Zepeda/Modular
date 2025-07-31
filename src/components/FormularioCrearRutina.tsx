import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crearRutinaSchema, CrearRutinaFormData } from '../schemas/rutinaSchema';
import { IRutinaInput } from '../types/rutina';
import { 
  TIPOS_RUTINA_LABELS, 
  NIVELES_DIFICULTAD_LABELS, 
  DIAS_POR_SEMANA_OPTIONS 
} from '../constants/rutinaConstants';

interface IFormularioCrearRutinaProps {
  onSubmit: (rutina: IRutinaInput) => Promise<void>;
  isLoading?: boolean;
}

const FormularioCrearRutina: React.FC<IFormularioCrearRutinaProps> = ({ 
  onSubmit, 
  isLoading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<CrearRutinaFormData>({
    resolver: zodResolver(crearRutinaSchema),
    mode: 'onChange'
  });

  const onSubmitForm = async (data: CrearRutinaFormData) => {
    try {
      const rutinaInput: IRutinaInput = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        nivel_recomendado: data.nivelDificultad,
        objetivo: data.tipoRutina,
        duracion_estimada: data.diasPorSemana * 60 // Convertir días a minutos estimados
      };

      await onSubmit(rutinaInput);
      reset();
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Nombre de la Rutina */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
          Nombre de la Rutina *
        </label>
        <input
          {...register('nombre')}
          type="text"
          id="nombre"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ej: Rutina de Fuerza Superior"
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
          Descripción *
        </label>
        <textarea
          {...register('descripcion')}
          id="descripcion"
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Describe los objetivos y características de esta rutina..."
        />
        {errors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
        )}
      </div>

      {/* Tipo de Rutina */}
      <div>
        <label htmlFor="tipoRutina" className="block text-sm font-medium text-gray-700">
          Tipo de Rutina *
        </label>
        <select
          {...register('tipoRutina')}
          id="tipoRutina"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Selecciona un tipo</option>
          {Object.entries(TIPOS_RUTINA_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.tipoRutina && (
          <p className="mt-1 text-sm text-red-600">{errors.tipoRutina.message}</p>
        )}
      </div>

      {/* Días por Semana */}
      <div>
        <label htmlFor="diasPorSemana" className="block text-sm font-medium text-gray-700">
          Días por Semana *
        </label>
        <select
          {...register('diasPorSemana', { valueAsNumber: true })}
          id="diasPorSemana"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Selecciona días por semana</option>
          {DIAS_POR_SEMANA_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.diasPorSemana && (
          <p className="mt-1 text-sm text-red-600">{errors.diasPorSemana.message}</p>
        )}
      </div>

      {/* Nivel de Dificultad */}
      <div>
        <label htmlFor="nivelDificultad" className="block text-sm font-medium text-gray-700">
          Nivel de Dificultad *
        </label>
        <select
          {...register('nivelDificultad')}
          id="nivelDificultad"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Selecciona un nivel</option>
          {Object.entries(NIVELES_DIFICULTAD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.nivelDificultad && (
          <p className="mt-1 text-sm text-red-600">{errors.nivelDificultad.message}</p>
        )}
      </div>

      {/* Botón de Envío */}
      <div>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creando Rutina...' : 'Crear Rutina'}
        </button>
      </div>
    </form>
  );
};

export default FormularioCrearRutina; 