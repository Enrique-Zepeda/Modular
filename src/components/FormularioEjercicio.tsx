import { useState } from 'react'
import { registrarEjercicio } from "../supabase/ejercicios";


export default function FormularioEjercicio() {
  const [nombre, setNombre] = useState('')
  const [grupo, setGrupo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await registrarEjercicio({ nombre, grupo_muscular: grupo, descripcion })
    setMensaje(error ? '❌ Error al registrar' : '✅ Ejercicio registrado')
    if (!error) {
      setNombre('')
      setGrupo('')
      setDescripcion('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className="border p-2 w-full" />
      <input value={grupo} onChange={e => setGrupo(e.target.value)} placeholder="Grupo muscular" className="border p-2 w-full" />
      <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className="border p-2 w-full" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Registrar</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  )
}