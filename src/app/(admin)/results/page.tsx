import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ResultForm from '@/components/ResultForm'

export default async function ResultsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') redirect('/dashboard')

    const { data: matches } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
        .order('match_date')

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
                <h1 className="text-3xl font-bold">Ingresar resultados</h1>
                <p className="text-gray-400 mt-1">Los puntajes se calculan automáticamente al guardar.</p>
            </div>

            {Object.keys(grouped).length === 0 && (
                <p className="text-gray-500 text-sm">No hay partidos registrados.</p>
            )}

            {Object.entries(grouped).map(([dateLabel, dayMatches]) => (
                <div key={dateLabel} className="flex flex-col gap-3">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 capitalize">
                        {dateLabel}
                    </h2>
                    {dayMatches!.map(match => (
                        <ResultForm key={match.id} match={match} />
                    ))}
                </div>
            ))}
        </div>
    )
}