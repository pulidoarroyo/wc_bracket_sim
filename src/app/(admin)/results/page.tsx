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
        .eq('result_locked', false)
        .order('match_date')

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Ingresar resultados</h1>
                <p className="text-gray-400 mt-1">Los puntajes se calculan automáticamente al guardar.</p>
            </div>
            <div className="flex flex-col gap-3">
                {matches?.length === 0 && (
                    <p className="text-gray-500 text-sm">No hay partidos pendientes.</p>
                )}
                {matches?.map(match => (
                    <ResultForm key={match.id} match={match} />
                ))}
            </div>
        </div>
    )
}