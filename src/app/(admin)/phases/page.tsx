import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PhaseControls from '@/components/PhaseControls'

export default async function PhasesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: phases } = await supabase.from('phases').select('*').order('id')

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Administrar fases</h1>
                <p className="text-gray-400 mt-1">Controla qué fases están abiertas para predicciones.</p>
            </div>
            <div className="flex flex-col gap-3">
                {phases?.map(phase => (
                    <PhaseControls key={phase.id} phase={phase} />
                ))}
            </div>
        </div>
    )
}