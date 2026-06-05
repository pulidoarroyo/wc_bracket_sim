import { createClient } from '@/lib/supabase/server'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: leaderboard } = await supabase.from('leaderboard').select('*').order('position')

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Leaderboard 🏅</h1>
                <p className="text-gray-400 mt-1">Updated after every result.</p>
            </div>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                            <th className="text-left px-6 py-4">#</th>
                            <th className="text-left px-6 py-4">Player</th>
                            <th className="text-right px-6 py-4">Points</th>
                            <th className="text-right px-6 py-4">Exact</th>
                            <th className="text-right px-6 py-4">Winner</th>
                            <th className="text-right px-6 py-4">Played</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard?.map((entry, i) => (
                            <tr key={entry.user_id} className={`border-b border-gray-800 last:border-0 ${i === 0 ? 'text-yellow-400' : ''}`}>
                                <td className="px-6 py-4 font-bold">{entry.position}</td>
                                <td className="px-6 py-4 font-semibold">{entry.username}</td>
                                <td className="px-6 py-4 text-right font-bold">{entry.total_points}</td>
                                <td className="px-6 py-4 text-right text-gray-400">{entry.exact_scores}</td>
                                <td className="px-6 py-4 text-right text-gray-400">{entry.correct_winners}</td>
                                <td className="px-6 py-4 text-right text-gray-400">{entry.matches_scored}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}