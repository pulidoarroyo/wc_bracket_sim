'use client'

import { useState } from 'react'
import { updateMatchDateTime, deleteMatch } from '@/app/(admin)/matches/actions'

export default function MatchDateEditor({ match, onDelete }: { match: any, onDelete: (id: string) => void }) {
    const [matchDate, setMatchDate] = useState(
        match.match_date ? new Date(match.match_date).toISOString().slice(0, 16) : ''
    )
    const [venue, setVenue] = useState(match.venue ?? '')
    const [saved, setSaved] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleSave() {
        setSaving(true)
        try {
            await updateMatchDateTime(match.id, matchDate || null, venue || null)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!confirming) return setConfirming(true)
        setDeleting(true)
        try {
            await deleteMatch(match.id)
            onDelete(match.id)
        } finally {
            setDeleting(false)
        }
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
                disabled={saving}
                className="text-xs bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-black font-semibold px-3 py-2 rounded-lg transition-colors"
            >
                {saved ? '✓ Guardado' : saving ? '...' : 'Guardar'}
            </button>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${confirming ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-gray-800 hover:bg-gray-700 text-red-400'}`}
            >
                {deleting ? '...' : confirming ? '¿Confirmar?' : 'Eliminar'}
            </button>
        </div>
    )
}