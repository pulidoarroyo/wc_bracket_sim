'use client'

import { useState } from 'react'
import { saveResult } from '@/app/(admin)/results/actions'

export default function ResultForm({ match }: { match: any }) {
    const [home, setHome] = useState(0)
    const [away, setAway] = useState(0)
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit() {
        setLoading(true)
        setError('')
        try {
            await saveResult(match.id, home, away)
            setDone(true)
        } catch (e: any) {
            setError(e.message ?? 'Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    if (done) return (
        <div className="bg-gray-900 border border-blue-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold truncate">
                {match.home_team.name} <span className="font-black">{home} – {away}</span> {match.away_team.name}
            </span>
            <span className="text-xs text-blue-400 shrink-0">✓ Guardado</span>
        </div>
    )

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 flex items-center justify-between sm:justify-center gap-3">
                <span className="flex-1 text-right text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-none">{match.home_team.name}</span>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <input
                        type="number" min={0} value={home}
                        onChange={e => setHome(Number(e.target.value))}
                        className="w-10 h-10 text-center bg-gray-800 rounded-lg text-base sm:text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500 text-xs font-semibold">vs</span>
                    <input
                        type="number" min={0} value={away}
                        onChange={e => setAway(Number(e.target.value))}
                        className="w-10 h-10 text-center bg-gray-800 rounded-lg text-base sm:text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <span className="flex-1 text-left text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-none">{match.away_team.name}</span>
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-20 h-9 text-xs bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-black font-semibold px-3 rounded-lg transition-colors border-0 cursor-pointer"
            >
                {loading ? '...' : 'Guardar'}
            </button>
        </div>
    )
}