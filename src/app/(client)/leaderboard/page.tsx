import { createClient } from '@/lib/supabase/server'
import LeaderboardClient from './LeaderboardClient'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Fetch leaderboard entries
    const { data: leaderboard } = await supabase
        .from('leaderboard')
        .select('*')

    // Fetch predictions for all matches that have finished
    const { data: predictions } = await supabase
        .from('predictions')
        .select(`
            user_id,
            home_goals_pred,
            away_goals_pred,
            matches (
                id,
                match_date,
                home_goals,
                away_goals,
                result_locked,
                home_team:home_team_id ( name ),
                away_team:away_team_id ( name )
            )
        `)

    return (
        <LeaderboardClient
            initialLeaderboard={leaderboard || []}
            predictions={predictions || []}
            currentUserId={user?.id || null}
        />
    )
}
