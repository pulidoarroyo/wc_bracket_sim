import { createClient } from '@/lib/supabase/server'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: leaderboard } = await supabase.from('leaderboard').select('*').order('position')

    return (
        <div className="flex flex-col gap-6">
            <div>
                <a href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5 mb-4 hover:translate-x-[-2px] transition-transform">
                    ← Volver al inicio
                </a>
                <h1 className="text-3xl font-bold">Clasificación 🏅</h1>
                <p className="text-gray-400 mt-1">Actualizado después de cada resultado.</p>
            </div>

            {/* Mobile: card list */}
            <div className="sm:hidden flex flex-col gap-2">
                {leaderboard?.map((entry, i) => {
                    const isCurrentUser = user && entry.user_id === user.id
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                    return (
                        <div
                            key={entry.user_id}
                            className={`rounded-2xl p-4 flex items-center gap-3 border transition-colors ${
                                isCurrentUser
                                    ? 'bg-blue-500/5 border-blue-500/30 border-l-2 border-l-blue-500'
                                    : 'bg-gray-900 border-gray-800'
                            }`}
                        >
                            <span className={`text-base font-black w-8 text-center shrink-0 ${i === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                {medal ?? `#${entry.position}`}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                                        {entry.username}
                                    </span>
                                    {isCurrentUser && (
                                        <span className="text-[9px] text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded-full border border-blue-500/20 shrink-0">Tú</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500">
                                    <span>🎯 {entry.exact_scores}</span>
                                    <span>🙌 {entry.correct_winners}</span>
                                    <span>⚽ {entry.matches_scored}</span>
                                </div>
                            </div>
                            <span className={`text-lg font-black shrink-0 ${i === 0 ? 'text-yellow-400' : isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                                {entry.total_points}
                                <span className="text-[10px] font-normal text-gray-500 ml-0.5">pts</span>
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg shadow-black/20">
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
                                    className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors ${i === 0 ? 'text-yellow-400' : ''} ${isCurrentUser ? 'bg-blue-500/5 text-blue-300 font-semibold border-l-2 border-l-blue-500' : ''}`}
                                >
                                    <td className="px-6 py-4 font-bold">{entry.position}</td>
                                    <td className="px-6 py-4 font-semibold">
                                        {entry.username} {isCurrentUser && <span className="text-[10px] text-blue-400 font-normal bg-blue-500/15 px-2 py-0.5 rounded-full ml-1.5 align-middle border border-blue-500/20">(Tú)</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold">{entry.total_points}</td>
                                    <td className={`px-6 py-4 text-right ${isCurrentUser ? 'text-blue-400/80' : 'text-gray-400'}`}>{entry.exact_scores}</td>
                                    <td className={`px-6 py-4 text-right ${isCurrentUser ? 'text-blue-400/80' : 'text-gray-400'}`}>{entry.correct_winners}</td>
                                    <td className={`px-6 py-4 text-right ${isCurrentUser ? 'text-blue-400/80' : 'text-gray-400'}`}>{entry.matches_scored}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}