import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import LeaderboardClient from './LeaderboardClient'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Fetch leaderboard entries
    const { data: leaderboard } = await supabase
        .from('leaderboard')
        .select('*')

    // Fetch predictions using admin client only for matches that have finished.
    // This bypasses RLS safely on the server, while ensuring unfinished predictions are never exposed.
    const { data: predictions } = await adminSupabase
        .from('predictions')
        .select(`
            user_id,
            home_goals_pred,
            away_goals_pred,
            matches!inner (
                id,
                match_date,
                home_goals,
                away_goals,
                result_locked,
                home_team:home_team_id ( name ),
                away_team:away_team_id ( name )
            )
        `)
        .eq('matches.result_locked', true)

    return (
        <LeaderboardClient
            initialLeaderboard={leaderboard || []}
            predictions={predictions || []}
            currentUserId={user?.id || null}
        />
    )
}

