'use client'

import { useState } from 'react'
import { updatePhaseStatus } from '@/app/(admin)/phases/actions'

const statusStyles: Record<string, string> = {
    open: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    closed: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    locked: 'bg-gray-700 text-gray-400 border border-gray-600',
}

const phaseLabels: Record<string, string> = {
    group_stage: 'Fase de grupos',
    round_of_32: 'Ronda de 32',
    round_of_16: 'Octavos de final',
    quarter_finals: 'Cuartos de final',
    semi_finals: 'Semifinales',
    third_place: 'Tercer lugar',
    final: 'Final',
}

export default function PhaseControls({ phase }: { phase: any }) {
    const [status, setStatus] = useState(phase.status)
    const [loading, setLoading] = useState(false)

    async function handleUpdate(newStatus: string) {
        setLoading(true)
        try {
            await updatePhaseStatus(phase.id, newStatus)
            setStatus(newStatus)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-center gap-3">
                <span className="font-semibold text-sm sm:text-base">{phaseLabels[phase.phase]}</span>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusStyles[status]}`}>{status}</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <button
                    onClick={() => handleUpdate('open')}
                    disabled={status === 'open' || loading}
                    className="flex-1 sm:flex-none text-xs px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 transition-colors"
                >
                    Abrir
                </button>
                <button
                    onClick={() => handleUpdate('closed')}
                    disabled={status === 'closed' || loading}
                    className="flex-1 sm:flex-none text-xs px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-30 transition-colors"
                >
                    Cerrar
                </button>
                <button
                    onClick={() => handleUpdate('locked')}
                    disabled={status === 'locked' || loading}
                    className="flex-1 sm:flex-none text-xs px-3 py-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 disabled:opacity-30 transition-colors"
                >
                    Bloquear
                </button>
            </div>
        </div>
    )
}