import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FormularioCrearRutina from '../components/FormularioCrearRutina';
import { useRutinas } from '../hooks/useRutinas';
import { IRutinaInput } from '../types/rutina';

const CrearRutina: React.FC = () => {
  const navigate = useNavigate();
  const { crearRutina, isLoading, error } = useRutinas();

  const handleCrearRutina = async (rutina: IRutinaInput): Promise<void> => {
    try {
      await crearRutina(rutina);
      
      // Mostrar mensaje de éxito
      toast.success('¡Rutina creada exitosamente!', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error al crear la rutina:', error);
      
      // Mostrar mensaje de error
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error al crear la rutina. Inténtalo de nuevo.',
        {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        }
      );
    }
  };

  const handleCancelar = (): void => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Crear Nueva Rutina
              </h1>
              <p className="mt-2 text-gray-600">
                Completa el formulario para crear una nueva rutina de entrenamiento
              </p>
            </div>
            <button
              onClick={handleCancelar}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white shadow rounded-lg p-6">
          <FormularioCrearRutina 
            onSubmit={handleCrearRutina}
            isLoading={isLoading}
          />
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Consejos para crear una buena rutina:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Elige un nombre descriptivo y fácil de recordar</li>
            <li>• Describe claramente los objetivos y ejercicios principales</li>
            <li>• Selecciona el tipo de rutina según tus objetivos</li>
            <li>• Considera tu nivel actual al elegir la dificultad</li>
            <li>• Planifica días de descanso entre sesiones</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CrearRutina; 