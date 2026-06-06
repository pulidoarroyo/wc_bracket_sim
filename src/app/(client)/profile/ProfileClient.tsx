'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProfileClientProps {
    user: { id: string; email?: string }
    initialUsername: string
    stats: {
        position: number
        total_points: number
        exact_scores: number
        correct_winners: number
        matches_scored: number
    } | null
}

export default function ProfileClient({ user, initialUsername, stats }: ProfileClientProps) {
    const supabase = createClient()
    const [username, setUsername] = useState(initialUsername)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    // Status states
    const [usernameLoading, setUsernameLoading] = useState(false)
    const [usernameMessage, setUsernameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    async function handleUpdateUsername(e: React.FormEvent) {
        e.preventDefault()
        if (!username.trim()) {
            return setUsernameMessage({ type: 'error', text: 'El nombre de usuario no puede estar vacío.' })
        }
        setUsernameLoading(true)
        setUsernameMessage(null)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username: username.trim() })
                .eq('id', user.id)

            if (error) throw error
            setUsernameMessage({ type: 'success', text: '¡Nombre de usuario actualizado con éxito!' })
            // Refresh page/navbar state if necessary
            window.location.reload()
        } catch (err: any) {
            setUsernameMessage({ type: 'error', text: err.message || 'Error al actualizar el usuario.' })
        } finally {
            setUsernameLoading(false)
        }
    }

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault()
        if (password.length < 6) {
            return setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
        }
        if (password !== confirmPassword) {
            return setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
        }
        setPasswordLoading(true)
        setPasswordMessage(null)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setPasswordMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' })
            setPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            setPasswordMessage({ type: 'error', text: err.message || 'Error al actualizar la contraseña.' })
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Configuración de Perfil ⚙️</h1>
                <p className="text-gray-400 mt-1">Administra tu cuenta y revisa tus estadísticas de juego.</p>
            </div>

            {/* Stats summary card */}
            {stats && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md shadow-black/20">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">🏆 Resumen de Estadísticas</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="flex flex-col p-3 bg-gray-950/40 border border-gray-850 rounded-xl items-center text-center">
                            <span className="text-xs text-gray-400 font-medium mb-1">Posición</span>
                            <span className="text-2xl font-black text-yellow-400">#{stats.position}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-gray-950/40 border border-gray-850 rounded-xl items-center text-center">
                            <span className="text-xs text-gray-400 font-medium mb-1">Puntos</span>
                            <span className="text-2xl font-black text-white">{stats.total_points}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-gray-950/40 border border-gray-850 rounded-xl items-center text-center">
                            <span className="text-xs text-gray-400 font-medium mb-1">Exactos</span>
                            <span className="text-2xl font-black text-sky-400">{stats.exact_scores}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-gray-950/40 border border-gray-850 rounded-xl items-center text-center">
                            <span className="text-xs text-gray-400 font-medium mb-1">Ganador</span>
                            <span className="text-2xl font-black text-slate-400">{stats.correct_winners}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-gray-950/40 border border-gray-850 rounded-xl items-center text-center col-span-2 md:col-span-1">
                            <span className="text-xs text-gray-400 font-medium mb-1">Jugados</span>
                            <span className="text-2xl font-black text-purple-300">{stats.matches_scored}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {/* Username Form */}
                <form onSubmit={handleUpdateUsername} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 shadow-md shadow-black/20">
                    <div>
                        <h2 className="text-lg font-bold text-white">Nombre de Usuario</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Este es el nombre visible en la tabla de clasificación.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400">Correo Electrónico (No editable)</label>
                        <input
                            type="text"
                            disabled
                            value={user.email || ''}
                            className="bg-gray-950 text-gray-500 rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-850 cursor-not-allowed"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-750 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {usernameMessage && (
                        <p className={`text-sm font-medium ${usernameMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {usernameMessage.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={usernameLoading}
                        className="bg-blue-500 hover:bg-blue-400 text-black font-semibold rounded-lg py-2.5 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer w-full md:w-auto md:px-6 md:self-end"
                    >
                        {usernameLoading ? 'Guardando...' : 'Actualizar Nombre'}
                    </button>
                </form>

                {/* Password Form */}
                <form onSubmit={handleUpdatePassword} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 shadow-md shadow-black/20">
                    <div>
                        <h2 className="text-lg font-bold text-white">Cambiar Contraseña</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Asegúrate de usar una contraseña segura.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400">Nueva Contraseña</label>
                        <input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-750 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-400">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            placeholder="Repite la nueva contraseña"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-750 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {passwordMessage && (
                        <p className={`text-sm font-medium ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {passwordMessage.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-blue-500 hover:bg-blue-400 text-black font-semibold rounded-lg py-2.5 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer w-full md:w-auto md:px-6 md:self-end"
                    >
                        {passwordLoading ? 'Guardando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    )
}
