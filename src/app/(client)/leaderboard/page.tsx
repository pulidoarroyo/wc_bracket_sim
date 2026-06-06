import { createClient } from '@/lib/supabase/server'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: leaderboard } = await supabase.from('leaderboard').select('*').order('position')

    return (
        <div className="flex flex-col gap-6">
            <div>
                <a href="/dashboard" className="text-sm text-green-400 hover:text-green-300 font-medium inline-flex items-center gap-1.5 mb-4 hover:translate-x-[-2px] transition-transform">
                    ← Volver al inicio
                </a>
                <h1 className="text-3xl font-bold">Clasificación 🏅</h1>
                <p className="text-gray-400 mt-1">Actualizado después de cada resultado.</p>
            </div>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg shadow-black/20">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400 bg-gray-950/20">
                            <th className="text-left px-6 py-4">#</th>
                            <th className="text-left px-6 py-4">Jugador</th>
                            <th className="text-right px-6 py-4">Puntos</th>
                            <th className="text-right px-6 py-4">Exactos</th>
                            <th className="text-right px-6 py-4">Ganador</th>
                            <th className="text-right px-6 py-4">Jugados</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard?.map((entry, i) => {
                            const isCurrentUser = user && entry.user_id === user.id
                            return (
                                <tr
                                    key={entry.user_id}
                                    className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors ${i === 0 ? 'text-yellow-400' : ''} ${isCurrentUser ? 'bg-green-500/5 text-green-300 font-semibold border-l-2 border-l-green-500' : ''}`}
                                >
                                    <td className="px-6 py-4 font-bold">{entry.position}</td>
                                    <td className="px-6 py-4 font-semibold">
                                        {entry.username} {isCurrentUser && <span className="text-[10px] text-green-400 font-normal bg-green-500/15 px-2 py-0.5 rounded-full ml-1.5 align-middle border border-green-500/20">(Tú)</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold">{entry.total_points}</td>
                                    <td className={`px-6 py-4 text-right ${isCurrentUser ? 'text-green-400/80' : 'text-gray-400'}`}>{entry.exact_scores}</td>
                                    <td className={`px-6 py-4 text-right ${isCurrentUser ? 'text-green-400/80' : 'text-gray-400'}`}>{entry.correct_winners}</td>
                                    <td className={`px-6 py-4 text-right ${isCurrentUser ? 'text-green-400/80' : 'text-gray-400'}`}>{entry.matches_scored}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}