import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PredictionForm from '@/components/PredictionForm'

const phaseLabels: Record<string, string> = {
    group_stage: 'Group Stage',
    round_of_32: 'Round of 32',
    round_of_16: 'Round of 16',
    quarter_finals: 'Quarter Finals',
    semi_finals: 'Semi Finals',
    third_place: 'Third Place',
    final: 'Final',
}

export default async function PredictionsPage({ params }: { params: Promise<{ phase: string }> }) {
    const { phase: phaseSlug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: phase } = await supabase
        .from('phases').select('*').eq('phase', phaseSlug).single()

    if (!phase) redirect('/dashboard')

    const { data: matches } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
        .eq('phase', phaseSlug)
        .order('match_date')

    const { data: predictions } = await supabase
        .from('predictions').select('*').eq('user_id', user.id)

    const predictionsMap = Object.fromEntries(
        predictions?.map(p => [p.match_id, p]) ?? []
    )

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">{phaseLabels[phaseSlug]}</h1>
                <p className="text-gray-400 mt-1">
                    {phase.status === 'open' ? 'Submit and lock your predictions.' : 'Predictions are locked.'}
                </p>
            </div>
            <div className="flex flex-col gap-3">
                {matches?.map(match => (
                    <PredictionForm
                        key={match.id}
                        match={match}
                        prediction={predictionsMap[match.id] ?? null}
                        isLocked={phase.status !== 'open' || !!predictionsMap[match.id]?.is_locked}
                        userId={user.id}
                    />
                ))}
            </div>
        </div>
    )
}