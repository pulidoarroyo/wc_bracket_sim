'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PredictionForm({ match, prediction, isLocked, userId }: {
    match: any
    prediction: any
    isLocked: boolean
    userId: string
}) {
    const supabase = createClient()
    const [home, setHome] = useState(prediction?.home_goals_pred ?? 0)
    const [away, setAway] = useState(prediction?.away_goals_pred ?? 0)
    const [saved, setSaved] = useState(false)

    async function handleSubmit() {
        await supabase.from('predictions').upsert({
            user_id: userId,
            match_id: match.id,
            home_goals_pred: home,
            away_goals_pred: away,
            is_locked: true,
        }, { onConflict: 'user_id,match_id' })
        setSaved(true)
    }

    const locked = isLocked || saved

    const formattedDate = match.match_date
        ? new Date(match.match_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Fecha por definir'

    return (
        <div className={`bg-gray-900 border rounded-2xl p-5 flex flex-col gap-3 ${locked ? 'border-gray-800 opacity-75' : 'border-green-500/30'}`}>
            <span className="text-xs text-gray-500">{formattedDate}</span>
            <div className="flex items-center gap-4">
                <span className="flex-1 text-right text-sm font-semibold">{match.home_team.name}</span>
                <div className="flex items-center gap-2">
                    <input
                        type="number" min={0} value={home}
                        disabled={locked}
                        onChange={e => setHome(Number(e.target.value))}
                        className="w-12 text-center bg-gray-800 rounded-lg py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    />
                    <span className="text-gray-500 text-sm">vs</span>
                    <input
                        type="number" min={0} value={away}
                        disabled={locked}
                        onChange={e => setAway(Number(e.target.value))}
                        className="w-12 text-center bg-gray-800 rounded-lg py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    />
                </div>
                <span className="flex-1 text-left text-sm font-semibold">{match.away_team.name}</span>
                {locked
                    ? <span className="text-xs text-gray-500 w-20 text-center">🔒 Bloqueado</span>
                    : <button onClick={handleSubmit} className="text-xs bg-green-500 hover:bg-green-400 text-black font-semibold px-3 py-2 rounded-lg transition-colors w-20">
                        Guardar
                    </button>
                }
            </div>
        </div>
    )
}