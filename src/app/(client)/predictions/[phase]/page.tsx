import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PredictionForm from '@/components/PredictionForm'

const phaseLabels: Record<string, string> = {
    group_stage: 'Fase de grupos',
    round_of_32: 'Ronda de 32',
    round_of_16: 'Octavos de final',
    quarter_finals: 'Cuartos de final',
    semi_finals: 'Semifinales',
    third_place: 'Tercer lugar',
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

    // Group matches by date
    const grouped = (matches ?? []).reduce<Record<string, typeof matches>>((acc, match) => {
        const label = match.match_date
            ? new Date(match.match_date).toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
            : 'Fecha por definir'
        if (!acc[label]) acc[label] = []
        acc[label]!.push(match)
        return acc
    }, {})

    return (
        <div className="flex flex-col gap-6">
            <div>
                <a href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5 mb-4 hover:translate-x-[-2px] transition-transform">
                    ← Volver al inicio
                </a>
                <h1 className="text-3xl font-bold">{phaseLabels[phaseSlug]}</h1>
                <p className="text-gray-400 mt-1">
                    {phase.status === 'open' ? 'Envía y bloquea tus predicciones.' : 'Las predicciones están bloqueadas.'}
                </p>
            </div>

            {Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <span className="text-5xl">🏗️</span>
                    <p className="text-lg font-semibold text-gray-300">Aún no hay partidos en esta fase</p>
                    <p className="text-sm text-gray-500 max-w-xs">El administrador todavía no ha cargado los partidos. Vuelve más tarde.</p>
                    <a href="/dashboard" className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        ← Volver al inicio
                    </a>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {Object.entries(grouped).map(([dateLabel, dayMatches]) => (
                        <div key={dateLabel} className="flex flex-col gap-3">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 capitalize">
                                {dateLabel}
                            </h2>
                            {dayMatches!.map(match => (
                                <PredictionForm
                                    key={match.id}
                                    match={match}
                                    prediction={predictionsMap[match.id] ?? null}
                                    isLocked={phase.status !== 'open' || !!predictionsMap[match.id]?.is_locked}
                                    userId={user.id}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}