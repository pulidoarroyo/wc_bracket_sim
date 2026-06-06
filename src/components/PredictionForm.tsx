'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PredictionForm({ match, prediction, isLocked, userId }: {
    match: any
    prediction: any
    isLocked: boolean
    userId: string
}) {
    const supabase = createClient()
    const [home, setHome] = useState(prediction?.home_goals_pred ?? 0)
    const [away, setAway] = useState(prediction?.away_goals_pred ?? 0)
    const [saved, setSaved] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    async function handleSubmit() {
        await supabase.from('predictions').upsert({
            user_id: userId,
            match_id: match.id,
            home_goals_pred: home,
            away_goals_pred: away,
            is_locked: true,
        }, { onConflict: 'user_id,match_id' })
        setSaved(true)
        setShowConfirm(false)
    }

    const locked = isLocked || saved

    const formattedDate = match.match_date
        ? new Date(match.match_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Fecha por definir'

    const hasPrediction = prediction !== null
    const Hp = prediction?.home_goals_pred
    const Ap = prediction?.away_goals_pred
    const Ha = match.home_goals
    const Aa = match.away_goals

    const isExact = hasPrediction && Hp === Ha && Ap === Aa
    const isWinner = hasPrediction && !isExact && (
        (Hp > Ap && Ha > Aa) ||
        (Hp < Ap && Ha < Aa) ||
        (Hp === Ap && Ha === Aa)
    )

    let feedbackElement = null
    if (match.result_locked) {
        if (!hasPrediction) {
            feedbackElement = (
                <div className="mt-2 bg-gray-950/40 border border-gray-800/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-gray-500 font-medium">
                    <span>⚪</span>
                    <span>No ingresaste un pronóstico para este partido.</span>
                </div>
            )
        } else if (isExact) {
            feedbackElement = (
                <div className="mt-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-green-400 font-semibold shadow-sm shadow-green-500/5">
                    <span>🎯</span>
                    <span>¡Marcador exacto! Tu pronóstico: <b>{Hp}-{Ap}</b> | Resultado: <b>{Ha}-{Aa}</b>. Sumas <b>+3 puntos</b>.</span>
                </div>
            )
        } else if (isWinner) {
            feedbackElement = (
                <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-blue-400 font-semibold shadow-sm shadow-blue-500/5">
                    <span>🙌</span>
                    <span>¡Ganador/Empate acertado! Tu pronóstico: <b>{Hp}-{Ap}</b> | Resultado: <b>{Ha}-{Aa}</b>. Sumas <b>+1 punto</b>.</span>
                </div>
            )
        } else {
            feedbackElement = (
                <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-red-400/80 font-medium">
                    <span>❌</span>
                    <span>No sumaste puntos. Tu pronóstico: <b>{Hp}-{Ap}</b> | Resultado: <b>{Ha}-{Aa}</b>.</span>
                </div>
            )
        }
    }

    return (
        <div className={`bg-gray-900 border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 ${locked ? 'border-gray-800 opacity-70' : 'border-blue-500/20 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/[0.02]'}`}>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formattedDate}</span>
                {match.result_locked && (
                    <span className="bg-gray-850 px-2.5 py-0.5 rounded-md text-[10px] font-semibold text-gray-400 border border-gray-800">Partido finalizado</span>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                <span className="flex-1 text-right text-sm font-semibold">{match.home_team.name}</span>
                
                {match.result_locked ? (
                    <div className="flex items-center gap-2">
                        <span className="w-12 text-center bg-gray-950 border border-gray-850 text-white font-black rounded-lg py-2 text-lg">
                            {Ha}
                        </span>
                        <span className="text-gray-500 text-sm">vs</span>
                        <span className="w-12 text-center bg-gray-950 border border-gray-850 text-white font-black rounded-lg py-2 text-lg">
                            {Aa}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <input
                            type="number" min={0} value={home}
                            disabled={locked || showConfirm}
                            onChange={e => setHome(Number(e.target.value))}
                            className="w-12 text-center bg-gray-800 hover:bg-gray-700/80 focus:bg-gray-800 rounded-lg py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:hover:bg-gray-800 transition-colors"
                        />
                        <span className="text-gray-500 text-sm">vs</span>
                        <input
                            type="number" min={0} value={away}
                            disabled={locked || showConfirm}
                            onChange={e => setAway(Number(e.target.value))}
                            className="w-12 text-center bg-gray-800 hover:bg-gray-700/80 focus:bg-gray-800 rounded-lg py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:hover:bg-gray-800 transition-colors"
                        />
                    </div>
                )}
                
                <span className="flex-1 text-left text-sm font-semibold">{match.away_team.name}</span>
                
                {match.result_locked ? (
                    <span className="text-xs text-gray-400 w-20 text-center font-medium bg-gray-950/40 py-2 rounded-lg border border-gray-800/60">Finalizado</span>
                ) : locked ? (
                    <span className="text-xs text-gray-500 w-20 text-center font-medium bg-gray-950/40 py-2 rounded-lg border border-gray-800/60">🔒 Bloqueado</span>
                ) : showConfirm ? (
                    <div className="w-20" />
                ) : (
                    <button 
                        onClick={() => setShowConfirm(true)} 
                        className="text-xs bg-blue-500 hover:bg-blue-400 text-black font-semibold px-3 py-2 rounded-lg transition-all hover:scale-[1.05] active:scale-[0.95] w-20 shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                        Guardar
                    </button>
                )}
            </div>

            {/* Confirmation Banner */}
            {showConfirm && (
                <div className="mt-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base leading-none">⚠️</span>
                        <span className="text-xs text-yellow-500 font-medium leading-relaxed">
                            ¿Confirmar predicción? Una vez guardada <b>no podrás volver a editarla</b>.
                        </span>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border-0"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="text-[11px] bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm shadow-yellow-500/10 cursor-pointer border-0"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            )}

            {/* Recap Alert */}
            {feedbackElement}
        </div>
    )
}