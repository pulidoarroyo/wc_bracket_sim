'use client'

import { useState } from 'react'
import { updateUserRole, deleteUser } from './actions'

interface UserItem {
    id: string
    username: string
    role: string
    email: string
    created_at: string
}

export default function UserListClient({
    initialUsers,
    currentUserId,
}: {
    initialUsers: UserItem[]
    currentUserId: string
}) {
    const [users, setUsers] = useState<UserItem[]>(initialUsers)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleRoleChange(userId: string, newRole: string) {
        setUpdatingId(userId)
        setError(null)
        try {
            await updateUserRole(userId, newRole)
            setUsers(prev =>
                prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
            )
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el rol.')
        } finally {
            setUpdatingId(null)
        }
    }

    async function handleDelete(userId: string) {
        if (confirmDeleteId !== userId) {
            setConfirmDeleteId(userId)
            return
        }

        setDeletingId(userId)
        setError(null)
        try {
            await deleteUser(userId)
            setUsers(prev => prev.filter(u => u.id !== userId))
            setConfirmDeleteId(null)
        } catch (err: any) {
            setError(err.message || 'Error al eliminar el usuario.')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold text-xs">
                        Dismiss
                    </button>
                </div>
            )}

            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg shadow-black/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 bg-gray-950/20">
                                <th className="text-left px-6 py-4">Usuario</th>
                                <th className="text-left px-6 py-4">Correo</th>
                                <th className="text-left px-6 py-4">Rol</th>
                                <th className="text-right px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                const isSelf = u.id === currentUserId
                                return (
                                    <tr
                                        key={u.id}
                                        className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gray-850 flex items-center justify-center font-bold text-blue-400 text-xs border border-gray-700">
                                                    {u.username ? u.username.substring(0, 2).toUpperCase() : '??'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white">
                                                        {u.username || 'Sin nombre'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">
                                                        Unido: {new Date(u.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 font-medium">{u.email}</td>
                                        <td className="px-6 py-4">
                                            {isSelf ? (
                                                <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg border border-blue-500/20 font-medium">
                                                    Administrador (Tú)
                                                </span>
                                            ) : (
                                                <select
                                                    value={u.role || 'user'}
                                                    disabled={updatingId === u.id}
                                                    onChange={e => handleRoleChange(u.id, e.target.value)}
                                                    className="bg-gray-800 hover:bg-gray-750 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none border border-gray-750 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer font-medium"
                                                >
                                                    <option value="user">Usuario</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isSelf && (
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    disabled={deletingId === u.id}
                                                    className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95 ${
                                                        confirmDeleteId === u.id
                                                            ? 'bg-red-500 hover:bg-red-400 text-white shadow-md shadow-red-500/10'
                                                            : 'bg-gray-800 hover:bg-gray-750 text-red-400 border border-gray-750'
                                                    }`}
                                                >
                                                    {deletingId === u.id
                                                        ? 'Eliminando...'
                                                        : confirmDeleteId === u.id
                                                        ? '¿Confirmar?'
                                                        : 'Eliminar'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
