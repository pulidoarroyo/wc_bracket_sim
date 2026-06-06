'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    const supabase = createClient()
    const [status, setStatus] = useState(phase.status)

    async function updateStatus(newStatus: string) {
        await supabase.from('phases').update({ status: newStatus }).eq('id', phase.id)
        setStatus(newStatus)
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <span className="font-semibold">{phaseLabels[phase.phase]}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[status]}`}>{status}</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => updateStatus('open')}
                    disabled={status === 'open'}
                    className="text-xs px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 transition-colors"
                >
                    Abrir
                </button>
                <button
                    onClick={() => updateStatus('closed')}
                    disabled={status === 'closed'}
                    className="text-xs px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-30 transition-colors"
                >
                    Cerrar
                </button>
                <button
                    onClick={() => updateStatus('locked')}
                    disabled={status === 'locked'}
                    className="text-xs px-3 py-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 disabled:opacity-30 transition-colors"
                >
                    Bloquear
                </button>
            </div>
        </div>
    )
}