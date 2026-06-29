import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function TodayPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // match_date is stored as a local datetime string (e.g. "2026-06-29T20:00")
    // so we filter by the date prefix "YYYY-MM-DD" to match today regardless of timezone
    const todayPrefix = new Date().toLocaleDateString('en-CA') // "2026-06-29"

    const { data: matches } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
        .gte('match_date', `${todayPrefix}T00:00`)
        .lte('match_date', `${todayPrefix}T23:59`)
        .eq('result_locked', false) // not finished yet
        .order('match_date')

    // Fetch all predictions for today's matches
    let predictionsData: Record<string, { username: string; home_goals_pred: number; away_goals_pred: number; isMe: boolean }[]> = {}

    if (matches && matches.length > 0) {
        const matchIds = matches.map((m: any) => m.id)

        const [{ data: predictions }, { data: profiles }] = await Promise.all([
            supabase
                .from('predictions')
                .select('match_id, home_goals_pred, away_goals_pred, user_id')
                .in('match_id', matchIds)
                .eq('is_locked', true),
            supabase.from('profiles').select('id, username'),
        ])

        const profileMap = Object.fromEntries(profiles?.map((p: any) => [p.id, p.username]) ?? [])

        for (const matchId of matchIds) {
            predictionsData[matchId] = (predictions ?? [])
                .filter((p: any) => p.match_id === matchId)
                .map((p: any) => ({
                    username: profileMap[p.user_id] ?? 'Desconocido',
                    home_goals_pred: p.home_goals_pred,
                    away_goals_pred: p.away_goals_pred,
                    isMe: p.user_id === user.id,
                }))
                .sort((a: any, b: any) => a.username.localeCompare(b.username))
        }
    }

    const formatTime = (dateStr: string) => {
        // match_date has no timezone, treat as local
        const [datePart, timePart] = dateStr.split('T')
        if (!timePart) return 'Hora por definir'
        const [h, m] = timePart.split(':')
        return `${h}:${m}`
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <a href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5 mb-4 hover:translate-x-[-2px] transition-transform">
                    ← Volver al inicio
                </a>
                <h1 className="text-3xl font-bold">Partidos de hoy</h1>
                <p className="text-gray-400 mt-1">
                    Pronósticos de todos los participantes — visibles antes de que inicie cada partido.
                </p>
            </div>

            {!matches || matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <span className="text-5xl">😴</span>
                    <p className="text-lg font-semibold text-gray-300">No hay partidos hoy</p>
                    <p className="text-sm text-gray-500 max-w-xs">Vuelve cuando haya partidos programados o revisa la clasificación.</p>
                    <a href="/leaderboard" className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        Ver clasificación →
                    </a>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {matches.map((match: any) => {
                        const preds = predictionsData[match.id] ?? []
                        const kickoffTime = formatTime(match.match_date)

                        return (
                            <div key={match.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
                                {/* Match header */}
                                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-lg font-bold text-white truncate">
                                            {match.home_team.name}
                                        </span>
                                        <span className="text-gray-500 font-medium shrink-0">vs</span>
                                        <span className="text-lg font-bold text-white truncate">
                                            {match.away_team.name}
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold text-blue-400">⏰ {kickoffTime}</p>
                                        <p className="text-xs text-gray-500">{preds.length} pronóstico{preds.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>

                                {/* Predictions grid */}
                                {preds.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-500 text-sm">
                                        Nadie ha enviado su pronóstico aún.
                                    </div>
                                ) : (
                                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {preds.map((pred, i) => (
                                            <div
                                                key={i}
                                                className={`rounded-xl p-3 flex items-center justify-between gap-2 border ${pred.isMe
                                                    ? 'bg-blue-500/10 border-blue-500/30'
                                                    : 'bg-gray-800/60 border-gray-700/50'
                                                    }`}
                                            >
                                                <span className="text-xs text-gray-300 font-medium truncate">
                                                    {pred.username}{pred.isMe ? ' 👤' : ''}
                                                </span>
                                                <span className="text-sm font-black text-white shrink-0 bg-gray-700 px-2 py-0.5 rounded-lg">
                                                    {pred.home_goals_pred} – {pred.away_goals_pred}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}