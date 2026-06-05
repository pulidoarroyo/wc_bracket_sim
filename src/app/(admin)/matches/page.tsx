import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MatchCreateForm from '@/components/MatchCreateForm'
import MatchDateEditor from '@/components/MatchDateEditor'
import MatchList from '@/components/MatchList'

export default async function MatchesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: teams } = await supabase
        .from('teams').select('id, name, code').order('name')

    const { data: phases } = await supabase
        .from('phases').select('*').order('id')

    const { data: matches } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
        .order('phase')
        .order('match_date', { ascending: true, nullsFirst: true })

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold">Create match</h1>
                    <p className="text-gray-400 mt-1">Add knockout stage matches manually.</p>
                </div>
                <MatchCreateForm teams={teams ?? []} phases={phases ?? []} />
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Edit match dates</h2>
                    <p className="text-gray-400 mt-1">Set dates and venues for all matches.</p>
                </div>
                <div className="flex flex-col gap-3">
                    <MatchList initialMatches={matches ?? []} />
                </div>
            </div>
        </div>
    )
}