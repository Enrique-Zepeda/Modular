import React from "react";

interface Props {
  nombre: string;
  ejemplo: string; // URL del GIF
}

const EjercicioCard: React.FC<Props> = ({ nombre, ejemplo }) => {
  return (
    <div className="border rounded-2xl shadow p-4 text-center">
      <h2 className="text-xl font-bold mb-2">{nombre}</h2>
      <img
        src={ejemplo}
        alt={nombre}
        className="mx-auto w-full h-auto rounded-lg"
      />
    </div>
  );
};

export default EjercicioCard;