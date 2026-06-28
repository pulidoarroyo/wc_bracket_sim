'use client'

import React, { useState } from 'react'

interface LeaderboardEntry {
    user_id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    total_points: number
    matches_scored: number
    exact_scores: number
    correct_winners: number
    position: number
}

interface LeaderboardClientProps {
    initialLeaderboard: LeaderboardEntry[]
    predictions: any[]
    currentUserId: string | null
}

export default function LeaderboardClient({
    initialLeaderboard,
    predictions,
    currentUserId
}: LeaderboardClientProps) {
    const [activeTab, setActiveTab] = useState<'groups' | 'knockout' | 'general'>('general')
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

    // Process predictions by user
    const userPredictionsMap: Record<string, Array<{
        matchId: string
        matchDate: string
        homeTeam: string
        awayTeam: string
        pred: string
        actual: string
        status: 'exact' | 'winner' | 'wrong'
        pts: number
    }>> = {}

    // Initialize userStatsMap for all users
    const userStatsMap: Record<string, {
        total_points: number
        exact_scores: number
        correct_winners: number
        matches_scored: number
    }> = {}

    initialLeaderboard.forEach(entry => {
        userStatsMap[entry.user_id] = {
            total_points: 0,
            exact_scores: 0,
            correct_winners: 0,
            matches_scored: 0
        }
    })

    predictions.forEach(p => {
        // Handle case where matches could be an array or a single object
        const match = Array.isArray(p.matches) ? p.matches[0] : p.matches
        if (!match || !match.result_locked) return

        // Filter based on activeTab
        const isGroupStage = match.phase === 'group_stage'
        if (activeTab === 'groups' && !isGroupStage) return
        if (activeTab === 'knockout' && isGroupStage) return

        const hp = p.home_goals_pred
        const ap = p.away_goals_pred
        const ha = match.home_goals
        const aa = match.away_goals

        const isExact = hp === ha && ap === aa
        const isWinner = !isExact && (
            (hp > ap && ha > aa) ||
            (hp < ap && ha < aa) ||
            (hp === ap && ha === aa)
        )

        const status = isExact ? 'exact' : isWinner ? 'winner' : 'wrong'
        const pts = isExact ? 3 : isWinner ? 1 : 0

        // Handle case where home_team/away_team could be an array or a single object
        const homeTeamObj = Array.isArray(match.home_team) ? match.home_team[0] : match.home_team
        const awayTeamObj = Array.isArray(match.away_team) ? match.away_team[0] : match.away_team

        const homeTeamName = homeTeamObj?.name || 'Local'
        const awayTeamName = awayTeamObj?.name || 'Visitante'

        if (!userPredictionsMap[p.user_id]) {
            userPredictionsMap[p.user_id] = []
        }

        userPredictionsMap[p.user_id].push({
            matchId: match.id,
            matchDate: match.match_date,
            homeTeam: homeTeamName,
            awayTeam: awayTeamName,
            pred: `${hp}-${ap}`,
            actual: `${ha}-${aa}`,
            status,
            pts
        })

        if (!userStatsMap[p.user_id]) {
            userStatsMap[p.user_id] = {
                total_points: 0,
                exact_scores: 0,
                correct_winners: 0,
                matches_scored: 0
            }
        }

        userStatsMap[p.user_id].total_points += pts
        if (isExact) {
            userStatsMap[p.user_id].exact_scores += 1
        } else if (isWinner) {
            userStatsMap[p.user_id].correct_winners += 1
        }
        userStatsMap[p.user_id].matches_scored += 1
    })

    // Sort predictions for each user by date descending
    Object.keys(userPredictionsMap).forEach(userId => {
        userPredictionsMap[userId].sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    })

    // Map initialLeaderboard entries to their dynamically computed stats
    const computedLeaderboard = initialLeaderboard.map(entry => {
        const stats = userStatsMap[entry.user_id] || {
            total_points: 0,
            exact_scores: 0,
            correct_winners: 0,
            matches_scored: 0
        }
        return {
            ...entry,
            total_points: stats.total_points,
            exact_scores: stats.exact_scores,
            correct_winners: stats.correct_winners,
            matches_scored: stats.matches_scored
        }
    })

    // 1. Sort the leaderboard using tie-breaking rules
    const sortedLeaderboard = [...computedLeaderboard].sort((a, b) => {
        if (b.total_points !== a.total_points) {
            return b.total_points - a.total_points
        }
        if (b.exact_scores !== a.exact_scores) {
            return b.exact_scores - a.exact_scores
        }
        if (b.correct_winners !== a.correct_winners) {
            return b.correct_winners - a.correct_winners
        }
        // Fallback stable sorting by username
        return a.username.localeCompare(b.username)
    })

    // 2. Assign position based on tie-breaking rules
    let currentPosition = 1
    const rankedLeaderboard = sortedLeaderboard.map((entry, index) => {
        if (index > 0) {
            const prev = sortedLeaderboard[index - 1]
            // Draw exists if and only if points, exact scores AND correct winners are equal
            const isDraw =
                entry.total_points === prev.total_points &&
                entry.exact_scores === prev.exact_scores &&
                entry.correct_winners === prev.correct_winners

            if (!isDraw) {
                currentPosition = index + 1
            }
        }
        return {
            ...entry,
            calculatedPosition: currentPosition
        }
    })

    const toggleRow = (userId: string) => {
        setExpandedUserId(expandedUserId === userId ? null : userId)
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <a href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5 mb-4 hover:translate-x-[-2px] transition-transform">
                    ← Volver al inicio
                </a>
                <h1 className="text-3xl font-bold">Clasificación 🏅</h1>
                <p className="text-gray-400 mt-1">Criterio de desempate: 1º Puntos, 2º Marcadores Exactos, 3º Ganadores Acertados.</p>
            </div>
            {/* Phase Tabs Switcher */}
            <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-2xl self-start gap-1 w-full sm:w-auto">
                <button
                    onClick={() => { setActiveTab('general'); setExpandedUserId(null); }}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === 'general'
                            ? 'bg-blue-500 text-black shadow-md shadow-blue-500/10'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                    }`}
                >
                    Clasificación General
                </button>
                <button
                    onClick={() => { setActiveTab('groups'); setExpandedUserId(null); }}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === 'groups'
                            ? 'bg-blue-500 text-black shadow-md shadow-blue-500/10'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                    }`}
                >
                    Fase de Grupos
                </button>
                <button
                    onClick={() => { setActiveTab('knockout'); setExpandedUserId(null); }}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === 'knockout'
                            ? 'bg-blue-500 text-black shadow-md shadow-blue-500/10'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                    }`}
                >
                    Eliminatorias (R32+)
                </button>
            </div>

            {/* Tie-breaker Rules Info Banner */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">ℹ️</span>
                    <div>
                        <h3 className="font-semibold text-white text-sm">¿Cómo se rompen los empates?</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Si dos jugadores tienen los mismos puntos, se posiciona arriba quien tenga más <b>Marcadores Exactos (🎯)</b>.
                            Si persiste el empate, se considera quien tenga más <b>Ganadores Acertados (🙌)</b>.
                            Solo comparten puesto si coinciden en todas las anteriores.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 border-gray-800 pt-3 md:pt-0">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                        <span>Exacto (+3)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
                        <span>Ganador (+1)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                        <span>Incorrecto (+0)</span>
                    </div>
                </div>
            </div>

            {/* Transparency & Drive Link Banner */}
            <div className="bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border border-blue-900/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">🔍</span>
                    <div>
                        <h3 className="font-semibold text-white text-sm">Transparencia del Juego</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Para garantizar la transparencia de los resultados, puedes acceder a las planillas completas de Excel con todas las predicciones y cálculos del torneo.
                        </p>
                    </div>
                </div>
                <a 
                    href="https://drive.google.com/drive/folders/1WqS7crV-fTSM4wU4eGEFaXy3RgR2r8fb?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] shadow-md shadow-blue-500/20 shrink-0"
                >
                    <span>Ver Excel en Drive</span>
                    <span>↗</span>
                </a>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden flex flex-col gap-2.5">
                {rankedLeaderboard.map((entry) => {
                    const isCurrentUser = currentUserId && entry.user_id === currentUserId
                    const pos = entry.calculatedPosition
                    const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : null
                    const userForm = (userPredictionsMap[entry.user_id] || []).slice(0, 7)
                    const isExpanded = expandedUserId === entry.user_id

                    return (
                        <div
                            key={entry.user_id}
                            className={`rounded-2xl border transition-all ${
                                isCurrentUser
                                    ? 'bg-blue-950/20 border-blue-500/40 shadow-md shadow-blue-500/[0.02]'
                                    : 'bg-gray-900 border-gray-800'
                            }`}
                        >
                            <div
                                onClick={() => toggleRow(entry.user_id)}
                                className="p-4 flex items-center gap-3 cursor-pointer select-none active:bg-gray-800/10"
                            >
                                <span className={`text-base font-black w-8 text-center shrink-0 ${pos === 1 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                    {medal ?? `#${pos}`}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`font-bold text-sm truncate ${isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                                            {entry.username}
                                        </span>
                                        {isCurrentUser && (
                                            <span className="text-[9px] text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded-full border border-blue-500/20 shrink-0">Tú</span>
                                        )}
                                    </div>
                                    {/* Sub-info stats */}
                                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                                        <span title="Marcadores exactos">🎯 {entry.exact_scores}</span>
                                        <span title="Ganadores correctos">🙌 {entry.correct_winners}</span>
                                        <span title="Partidos pronosticados">⚽ {entry.matches_scored}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className={`text-lg font-black ${pos === 1 ? 'text-yellow-400' : isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                                        {entry.total_points}
                                        <span className="text-[10px] font-normal text-gray-500 ml-0.5">pts</span>
                                    </span>
                                    {/* Simple miniature form indicators for mobile */}
                                    {userForm.length > 0 && (
                                        <div className="flex gap-1">
                                            {userForm.map((pf, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        pf.status === 'exact'
                                                            ? 'bg-emerald-500'
                                                            : pf.status === 'winner'
                                                            ? 'bg-blue-500'
                                                            : 'bg-rose-500'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Expanded predictions */}
                            {isExpanded && (
                                <div className="border-t border-gray-800 p-4 bg-gray-950/40 rounded-b-2xl flex flex-col gap-3">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Últimos pronósticos</h4>
                                    {userForm.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic">No hay predicciones registradas para partidos finalizados.</p>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {userForm.map((pf) => (
                                                <div key={pf.matchId} className="flex items-center justify-between text-xs py-1 border-b border-gray-850 last:border-0">
                                                    <span className="text-gray-400 truncate max-w-[150px]">{pf.homeTeam} vs {pf.awayTeam}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-gray-500">Pred: <b className="text-gray-300">{pf.pred}</b></span>
                                                        <span className="text-gray-500">Real: <b className="text-gray-300">{pf.actual}</b></span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            pf.status === 'exact'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                : pf.status === 'winner'
                                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                        }`}>
                                                            +{pf.pts}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-lg shadow-black/20">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400 bg-gray-950/20">
                            <th className="text-left px-6 py-4 w-16">#</th>
                            <th className="text-left px-6 py-4">Jugador</th>
                            <th className="text-center px-6 py-4 w-56">Últimos Pronósticos</th>
                            <th className="text-right px-6 py-4 w-28">Puntos</th>
                            <th className="text-right px-6 py-4 w-24">Exactos (🎯)</th>
                            <th className="text-right px-6 py-4 w-24">Ganador (🙌)</th>
                            <th className="text-right px-6 py-4 w-24">Jugados (⚽)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankedLeaderboard.map((entry) => {
                            const isCurrentUser = currentUserId && entry.user_id === currentUserId
                            const pos = entry.calculatedPosition
                            const userForm = (userPredictionsMap[entry.user_id] || []).slice(0, 7)
                            const isExpanded = expandedUserId === entry.user_id

                            return (
                                <React.Fragment key={entry.user_id}>
                                    <tr
                                        onClick={() => toggleRow(entry.user_id)}
                                        className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors cursor-pointer select-none ${
                                            pos === 1 ? 'text-yellow-400 font-semibold' : ''
                                        } ${
                                            isCurrentUser
                                                ? 'bg-blue-500/5 text-blue-300 font-semibold border-l-2 border-l-blue-500'
                                                : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 font-bold">{pos}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold">{entry.username}</span>
                                            {isCurrentUser && (
                                                <span className="text-[10px] text-blue-400 font-normal bg-blue-500/15 px-2 py-0.5 rounded-full ml-1.5 align-middle border border-blue-500/20">
                                                    (Tú)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                {userForm.length === 0 ? (
                                                    <span className="text-xs text-gray-500 italic">-</span>
                                                ) : (
                                                    userForm.map((pf) => (
                                                        <div
                                                            key={pf.matchId}
                                                            className="group relative"
                                                        >
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md cursor-help transition-transform hover:scale-110 ${
                                                                pf.status === 'exact'
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                                    : pf.status === 'winner'
                                                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                                            }`}>
                                                                {pf.status === 'exact' ? '🎯' : pf.status === 'winner' ? '🙌' : '❌'}
                                                            </div>
                                                            
                                                            {/* Tooltip */}
                                                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-950 border border-gray-800 text-white text-[11px] p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-50">
                                                                <div className="font-semibold border-b border-gray-850 pb-1 mb-1 text-gray-300">
                                                                    {pf.homeTeam} vs {pf.awayTeam}
                                                                </div>
                                                                <div className="flex justify-between mt-0.5">
                                                                    <span className="text-gray-400">Predicción:</span>
                                                                    <span className="font-bold text-white">{pf.pred}</span>
                                                                </div>
                                                                <div className="flex justify-between mt-0.5">
                                                                    <span className="text-gray-400">Resultado:</span>
                                                                    <span className="font-bold text-white">{pf.actual}</span>
                                                                </div>
                                                                <div className="flex justify-between mt-1 pt-1 border-t border-gray-850/60 font-semibold">
                                                                    <span className="text-gray-400">Puntos:</span>
                                                                    <span className={pf.pts > 0 ? 'text-emerald-400' : 'text-rose-400'}>+{pf.pts} pts</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-base">{entry.total_points}</td>
                                        <td className={`px-6 py-4 text-right ${isCurrentUser ? 'text-blue-400/80 font-bold' : 'text-gray-400'}`}>{entry.exact_scores}</td>
                                        <td className={`px-6 py-4 text-right ${isCurrentUser ? 'text-blue-400/80 font-bold' : 'text-gray-400'}`}>{entry.correct_winners}</td>
                                        <td className={`px-6 py-4 text-right ${isCurrentUser ? 'text-blue-400/80 font-bold' : 'text-gray-400'}`}>{entry.matches_scored}</td>
                                    </tr>

                                    {/* Expandable predictions row */}
                                    {isExpanded && (
                                        <tr className="bg-gray-950/35">
                                            <td colSpan={7} className="px-8 py-4 border-b border-gray-800">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between border-b border-gray-850 pb-2 mb-1">
                                                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Historial de Predicciones Recientes</h4>
                                                        <span className="text-[11px] text-gray-500 italic">Mostrando los últimos 7 partidos finalizados</span>
                                                    </div>
                                                    
                                                    {userForm.length === 0 ? (
                                                        <p className="text-xs text-gray-500 italic py-2">No hay predicciones registradas para partidos finalizados.</p>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                                                            {userForm.map((pf) => (
                                                                <div
                                                                    key={pf.matchId}
                                                                    className={`flex flex-col p-3 rounded-xl border ${
                                                                        pf.status === 'exact'
                                                                            ? 'bg-emerald-500/[0.02] border-emerald-500/20'
                                                                            : pf.status === 'winner'
                                                                            ? 'bg-blue-500/[0.02] border-blue-500/20'
                                                                            : 'bg-rose-500/[0.02] border-rose-500/20'
                                                                    }`}
                                                                >
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-[10px] text-gray-500">
                                                                            {new Date(pf.matchDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                                                        </span>
                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                            pf.status === 'exact'
                                                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                                                : pf.status === 'winner'
                                                                                ? 'bg-blue-500/10 text-blue-400'
                                                                                : 'bg-rose-500/10 text-rose-400'
                                                                        }`}>
                                                                            {pf.status === 'exact' ? 'Marcador Exacto (+3)' : pf.status === 'winner' ? 'Ganador/Empate (+1)' : 'Sin Acierto (+0)'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                                                                        <span className="truncate max-w-[90px]">{pf.homeTeam}</span>
                                                                        <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                                                                            <span className="text-gray-400 font-normal">Pred:</span>
                                                                            <span className="font-mono">{pf.pred}</span>
                                                                            <span className="text-gray-500 mx-1">|</span>
                                                                            <span className="text-gray-400 font-normal">Real:</span>
                                                                            <span className="font-mono text-blue-300">{pf.actual}</span>
                                                                        </div>
                                                                        <span className="truncate max-w-[90px] text-right">{pf.awayTeam}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
