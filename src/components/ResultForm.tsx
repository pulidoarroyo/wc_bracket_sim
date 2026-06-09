'use client'

import { useState } from 'react'
import { saveResult, deleteResult, togglePredictionsLocked } from '@/app/(admin)/results/actions'

export default function ResultForm({ match }: { match: any }) {
    const [home, setHome] = useState<number>(match.home_goals ?? 0)
    const [away, setAway] = useState<number>(match.away_goals ?? 0)
    const [saved, setSaved] = useState(match.result_locked ?? false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [predictionsLocked, setPredictionsLocked] = useState(match.predictions_locked ?? false)
    const [showLockConfirm, setShowLockConfirm] = useState(false)

    async function handleSubmit() {
        setLoading(true)
        setError('')
        try {
            await saveResult(match.id, home, away)
            setSaved(true)
            setShowConfirm(false)
        } catch (e: any) {
            setError(e.message ?? 'Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        setLoading(true)
        setError('')
        try {
            await deleteResult(match.id)
            setHome(0)
            setAway(0)
            setSaved(false)
            setShowDelete(false)
        } catch (e: any) {
            setError(e.message ?? 'Error al eliminar')
        } finally {
            setLoading(false)
        }
    }

    async function handleToggleLock() {
        setLoading(true)
        setError('')
        try {
            await togglePredictionsLocked(match.id, !predictionsLocked)
            setPredictionsLocked(!predictionsLocked)
            setShowLockConfirm(false)
        } catch (e: any) {
            setError(e.message ?? 'Error al cambiar bloqueo')
        } finally {
            setLoading(false)
        }
    }

    const formattedDate = match.match_date
        ? new Date(match.match_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Fecha por definir'

    const activeConfirm = showConfirm || showDelete || showLockConfirm

    return (
        <div className={`bg-gray-900 border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all duration-300 ${saved ? 'border-blue-500/30' : 'border-gray-800'}`}>
            {/* Date + saved badge */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formattedDate}</span>
                <div className="flex items-center gap-2">
                    {predictionsLocked && (
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-semibold">
                            🔒 Predicciones bloqueadas
                        </span>
                    )}
                    {saved && (
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-semibold">
                            ✓ Guardado
                        </span>
                    )}
                </div>
            </div>

            {/* Teams + inputs + action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 flex items-center justify-between sm:justify-center gap-3">
                    <span className="flex-1 text-right text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-none">{match.home_team.name}</span>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <input
                            type="number" min={0} value={home}
                            disabled={activeConfirm}
                            onChange={e => setHome(Number(e.target.value))}
                            className="w-10 h-10 text-center bg-gray-800 rounded-lg text-base sm:text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        />
                        <span className="text-gray-500 text-xs font-semibold">vs</span>
                        <input
                            type="number" min={0} value={away}
                            disabled={activeConfirm}
                            onChange={e => setAway(Number(e.target.value))}
                            className="w-10 h-10 text-center bg-gray-800 rounded-lg text-base sm:text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        />
                    </div>
                    <span className="flex-1 text-left text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-none">{match.away_team.name}</span>
                </div>

                {!activeConfirm && (
                    <div className="flex gap-2 sm:shrink-0">
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex-1 sm:w-20 h-9 text-xs bg-blue-500 hover:bg-blue-400 text-black font-semibold px-3 rounded-lg transition-colors border-0 cursor-pointer"
                        >
                            {saved ? 'Modificar' : 'Guardar'}
                        </button>
                        {saved && (
                            <button
                                onClick={() => setShowDelete(true)}
                                className="h-9 w-9 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-0 cursor-pointer bg-transparent"
                                title="Eliminar resultado"
                            >
                                🗑
                            </button>
                        )}
                        <button
                            onClick={() => setShowLockConfirm(true)}
                            className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors border-0 cursor-pointer bg-transparent ${predictionsLocked ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10' : 'text-gray-500 hover:text-orange-400 hover:bg-orange-500/10'}`}
                            title={predictionsLocked ? 'Desbloquear predicciones' : 'Bloquear predicciones'}
                        >
                            {predictionsLocked ? '🔒' : '🔓'}
                        </button>
                    </div>
                )}
            </div>

            {/* Save / modify confirmation banner */}
            {showConfirm && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base leading-none">⚠️</span>
                        <span className="text-xs text-yellow-500 font-medium leading-relaxed">
                            {saved
                                ? <>¿Modificar resultado? Esto <b>recalculará los puntajes</b> de todos los usuarios.</>
                                : <>¿Confirmar resultado? Esto bloqueará el partido y <b>calculará los puntajes automáticamente</b>.</>
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={loading}
                            className="text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border-0 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="text-[11px] bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm shadow-yellow-500/10 cursor-pointer border-0 disabled:opacity-50"
                        >
                            {loading ? '...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Delete confirmation banner */}
            {showDelete && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base leading-none">🗑</span>
                        <span className="text-xs text-red-400 font-medium leading-relaxed">
                            ¿Eliminar resultado? El partido quedará <b>desbloqueado</b> y los puntajes <b>no se recalcularán</b> hasta que guardes uno nuevo.
                        </span>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                            onClick={() => setShowDelete(false)}
                            disabled={loading}
                            className="text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border-0 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="text-[11px] bg-red-500 hover:bg-red-400 text-white font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm shadow-red-500/10 cursor-pointer border-0 disabled:opacity-50"
                        >
                            {loading ? '...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Lock / unlock predictions confirmation banner */}
            {showLockConfirm && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{predictionsLocked ? '🔓' : '🔒'}</span>
                        <span className="text-xs text-orange-400 font-medium leading-relaxed">
                            {predictionsLocked
                                ? <>¿Desbloquear predicciones? Los usuarios podrán <b>volver a editar</b> su pronóstico.</>
                                : <>¿Bloquear predicciones? Los usuarios <b>ya no podrán modificar</b> su pronóstico para este partido.</>
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                            onClick={() => setShowLockConfirm(false)}
                            disabled={loading}
                            className="text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border-0 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleToggleLock}
                            disabled={loading}
                            className="text-[11px] bg-orange-500 hover:bg-orange-400 text-black font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm shadow-orange-500/10 cursor-pointer border-0 disabled:opacity-50"
                        >
                            {loading ? '...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>
    )
}