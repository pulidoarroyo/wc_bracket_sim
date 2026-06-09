'use client'

import { useState } from 'react'
import { createMatch } from '@/app/(admin)/matches/actions'

export default function MatchCreateForm({ teams, phases }: { teams: any[], phases: any[] }) {
    const [homeTeamId, setHomeTeamId] = useState('')
    const [awayTeamId, setAwayTeamId] = useState('')
    const [phase, setPhase] = useState('')
    const [matchDate, setMatchDate] = useState('')
    const [venue, setVenue] = useState('')
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const homeTeam = teams.find(t => t.id === homeTeamId)
    const awayTeam = teams.find(t => t.id === awayTeamId)

    function handleConfirmClick() {
        setError('')
        if (!homeTeamId || !awayTeamId || !phase) {
            return setError('Por favor completa todos los campos requeridos.')
        }
        if (homeTeamId === awayTeamId) {
            return setError('El equipo local y visitante deben ser distintos.')
        }
        setShowConfirm(true)
    }

    async function handleSubmit() {
        setLoading(true)
        try {
            await createMatch({
                phase,
                home_team_id: homeTeamId,
                away_team_id: awayTeamId,
                match_date: matchDate || null,
                venue: venue || null,
            })
            setSaved(true)
            setShowConfirm(false)
            setTimeout(() => setSaved(false), 3000)
            setHomeTeamId('')
            setAwayTeamId('')
            setMatchDate('')
            setVenue('')
            setPhase('')
        } catch (e: any) {
            setError(e.message ?? 'Error al crear partido')
            setShowConfirm(false)
        } finally {
            setLoading(false)
        }
    }

    const knockoutPhases = phases.filter(p => p.phase !== 'group_stage')

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5 max-w-lg">
            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Fase *</label>
                <select
                    value={phase}
                    disabled={showConfirm}
                    onChange={e => setPhase(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <option value="">Seleccionar fase</option>
                    {knockoutPhases.map(p => (
                        <option key={p.id} value={p.phase}>
                            {p.phase.replace(/_/g, ' ')}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Equipo local *</label>
                <select
                    value={homeTeamId}
                    disabled={showConfirm}
                    onChange={e => setHomeTeamId(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <option value="">Seleccionar equipo</option>
                    {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Equipo visitante *</label>
                <select
                    value={awayTeamId}
                    disabled={showConfirm}
                    onChange={e => setAwayTeamId(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <option value="">Seleccionar equipo</option>
                    {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Fecha del partido</label>
                <input
                    type="datetime-local"
                    value={matchDate}
                    disabled={showConfirm}
                    onChange={e => setMatchDate(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Sede</label>
                <input
                    type="text"
                    placeholder="ej. MetLife Stadium"
                    value={venue}
                    disabled={showConfirm}
                    onChange={e => setVenue(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {saved && <p className="text-blue-400 text-sm">✓ Partido creado con éxito.</p>}

            {/* Confirmation banner */}
            {showConfirm ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base leading-none">⚠️</span>
                        <span className="text-xs text-yellow-500 font-medium leading-relaxed">
                            ¿Crear partido <b>{homeTeam?.name} vs {awayTeam?.name}</b>? Será visible para todos los usuarios.
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
            ) : (
                <button
                    onClick={handleConfirmClick}
                    className="bg-blue-500 hover:bg-blue-400 text-black font-semibold rounded-lg py-3 transition-colors border-0 cursor-pointer"
                >
                    Crear partido
                </button>
            )}
        </div>
    )
}