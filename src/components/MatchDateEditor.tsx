'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MatchDateEditor({ match, onDelete }: { match: any, onDelete: (id: string) => void }) {
    const supabase = createClient()
    const [matchDate, setMatchDate] = useState(
        match.match_date ? new Date(match.match_date).toISOString().slice(0, 16) : ''
    )
    const [venue, setVenue] = useState(match.venue ?? '')
    const [saved, setSaved] = useState(false)
    const [confirming, setConfirming] = useState(false)

    async function handleSave() {
        await supabase
            .from('matches')
            .update({ match_date: matchDate || null, venue: venue || null })
            .eq('id', match.id)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    async function handleDelete() {
        if (!confirming) return setConfirming(true)
        await supabase.from('matches').delete().eq('id', match.id)
        onDelete(match.id)
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 text-sm font-semibold">
                <span className="text-gray-400 text-xs block mb-1">{match.phase.replace(/_/g, ' ')}</span>
                {match.home_team.name} vs {match.away_team.name}
            </div>
            <input
                type="datetime-local"
                value={matchDate}
                onChange={e => setMatchDate(e.target.value)}
                className="bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="text"
                placeholder="Sede"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                className="bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <button
                onClick={handleSave}
                className="text-xs bg-blue-500 hover:bg-blue-400 text-black font-semibold px-3 py-2 rounded-lg transition-colors"
            >
                {saved ? '✓ Guardado' : 'Guardar'}
            </button>
            <button
                onClick={handleDelete}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${confirming ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-gray-800 hover:bg-gray-700 text-red-400'}`}
            >
                {confirming ? '¿Confirmar?' : 'Eliminar'}
            </button>
        </div>
    )
}