'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MatchCreateForm({ teams, phases }: { teams: any[], phases: any[] }) {
    const supabase = createClient()
    const [homeTeamId, setHomeTeamId] = useState('')
    const [awayTeamId, setAwayTeamId] = useState('')
    const [phase, setPhase] = useState('')
    const [matchDate, setMatchDate] = useState('')
    const [venue, setVenue] = useState('')
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit() {
        setError('')
        if (!homeTeamId || !awayTeamId || !phase) {
            return setError('Please fill in all required fields.')
        }
        if (homeTeamId === awayTeamId) {
            return setError('Home and away teams must be different.')
        }

        const { error } = await supabase.from('matches').insert({
            phase,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            match_date: matchDate || null,
            venue: venue || null,
        })

        if (error) return setError(error.message)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        setHomeTeamId('')
        setAwayTeamId('')
        setMatchDate('')
        setVenue('')
    }

    const knockoutPhases = phases.filter(p => p.phase !== 'group_stage')

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5 max-w-lg">
            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Phase *</label>
                <select
                    value={phase}
                    onChange={e => setPhase(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="">Select phase</option>
                    {knockoutPhases.map(p => (
                        <option key={p.id} value={p.phase}>
                            {p.phase.replace(/_/g, ' ')}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Home team *</label>
                <select
                    value={homeTeamId}
                    onChange={e => setHomeTeamId(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="">Select team</option>
                    {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Away team *</label>
                <select
                    value={awayTeamId}
                    onChange={e => setAwayTeamId(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="">Select team</option>
                    {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Match date</label>
                <input
                    type="datetime-local"
                    value={matchDate}
                    onChange={e => setMatchDate(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Venue</label>
                <input
                    type="text"
                    placeholder="e.g. MetLife Stadium"
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {saved && <p className="text-green-400 text-sm">✓ Match created successfully.</p>}

            <button
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg py-3 transition-colors"
            >
                Create match
            </button>
        </div>
    )
}