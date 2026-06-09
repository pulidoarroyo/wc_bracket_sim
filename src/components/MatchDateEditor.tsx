'use client'

import { useState } from 'react'
import { updateMatchDateTime, deleteMatch } from '@/app/(admin)/matches/actions'

export default function MatchDateEditor({ match, onDelete }: { match: any, onDelete: (id: string) => void }) {
    const [matchDate, setMatchDate] = useState(
        match.match_date ? new Date(match.match_date).toISOString().slice(0, 16) : ''
    )
    const [venue, setVenue] = useState(match.venue ?? '')
    const [saved, setSaved] = useState(!!(match.match_date || match.venue))
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showDelete, setShowDelete] = useState(false)

    const hasData = !!(matchDate || venue)
    const activeConfirm = showConfirm || showDelete

    async function handleSave() {
        setLoading(true)
        try {
            await updateMatchDateTime(match.id, matchDate || null, venue || null)
            setSaved(true)
            setShowConfirm(false)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        setLoading(true)
        try {
            await deleteMatch(match.id)
            onDelete(match.id)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`bg-gray-900 border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all duration-300 ${saved ? 'border-blue-500/30' : 'border-gray-800'}`}>
            {/* Phase + saved badge */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="uppercase tracking-wider font-medium">{match.phase.replace(/_/g, ' ')}</span>
                {saved && (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-semibold">
                        ✓ Guardado
                    </span>
                )}
            </div>

            {/* Teams + inputs + buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 text-sm font-semibold">
                    {match.home_team.name} <span className="text-gray-500 font-normal">vs</span> {match.away_team.name}
                </div>
                <input
                    type="datetime-local"
                    value={matchDate}
                    disabled={activeConfirm}
                    onChange={e => setMatchDate(e.target.value)}
                    className="bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                />
                <input
                    type="text"
                    placeholder="Sede"
                    value={venue}
                    disabled={activeConfirm}
                    onChange={e => setVenue(e.target.value)}
                    className="bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors w-full sm:w-48"
                />

                {!activeConfirm && (
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={!hasData}
                            className="text-xs bg-blue-500 hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold px-3 py-2 h-9 rounded-lg transition-colors border-0 cursor-pointer"
                        >
                            {saved ? 'Modificar' : 'Guardar'}
                        </button>
                        <button
                            onClick={() => setShowDelete(true)}
                            className="h-9 w-9 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-0 cursor-pointer bg-transparent"
                            title="Eliminar partido"
                        >
                            🗑
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
                                ? <>¿Modificar fecha/sede? Esto <b>actualizará el partido</b> para todos los usuarios.</>
                                : <>¿Confirmar fecha y sede? Los cambios serán <b>visibles para todos los usuarios</b>.</>
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
                            onClick={handleSave}
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
                            ¿Eliminar partido? Esta acción es <b>irreversible</b> y eliminará también todas las predicciones asociadas.
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
        </div>
    )
}