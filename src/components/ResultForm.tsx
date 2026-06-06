'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResultForm({ match }: { match: any }) {
    const supabase = createClient()
    const [home, setHome] = useState(0)
    const [away, setAway] = useState(0)
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit() {
        setLoading(true)
        await supabase
            .from('matches')
            .update({ home_goals: home, away_goals: away, result_locked: true })
            .eq('id', match.id)
        await supabase.rpc('calculate_match_scores', { p_match_id: match.id })
        setDone(true)
        setLoading(false)
    }

    if (done) return (
        <div className="bg-gray-900 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between">
            <span className="text-sm font-semibold">{match.home_team.name} {home} - {away} {match.away_team.name}</span>
            <span className="text-xs text-blue-400">✓ Guardado</span>
        </div>
    )

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
            <span className="flex-1 text-right text-sm font-semibold">{match.home_team.name}</span>
            <div className="flex items-center gap-2">
                <input
                    type="number" min={0} value={home}
                    onChange={e => setHome(Number(e.target.value))}
                    className="w-12 text-center bg-gray-800 rounded-lg py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 text-sm">vs</span>
                <input
                    type="number" min={0} value={away}
                    onChange={e => setAway(Number(e.target.value))}
                    className="w-12 text-center bg-gray-800 rounded-lg py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <span className="flex-1 text-left text-sm font-semibold">{match.away_team.name}</span>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-xs bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-black font-semibold px-3 py-2 rounded-lg transition-colors w-20"
            >
                {loading ? '...' : 'Guardar'}
            </button>
        </div>
    )
}