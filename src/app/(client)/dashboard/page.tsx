import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const phaseLabels: Record<string, string> = {
    group_stage: 'Group Stage',
    round_of_32: 'Round of 32',
    round_of_16: 'Round of 16',
    quarter_finals: 'Quarter Finals',
    semi_finals: 'Semi Finals',
    third_place: 'Third Place',
    final: 'Final',
}

const statusStyles: Record<string, string> = {
    open: 'bg-green-500/20 text-green-400 border border-green-500/30',
    closed: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    locked: 'bg-gray-700 text-gray-400 border border-gray-600',
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: phases } = await supabase.from('phases').select('*').order('id')
    const { data: profile } = await supabase
        .from('profiles').select('username, role').eq('id', user.id).single()

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome, {profile?.username} 👋</h1>
                <p className="text-gray-400 mt-1">Select a phase to enter your predictions.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {phases?.map(phase => (
                    <div key={phase.id} className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">{phaseLabels[phase.phase]}</h2>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[phase.status]}`}>
                                {phase.status}
                            </span>
                        </div>
                        {phase.status === 'open' && (
                            <a href={`/predictions/${phase.phase}`}
                                className="bg-green-500 hover:bg-green-400 text-black text-sm font-semibold text-center rounded-lg py-2 transition-colors">
                                Make predictions
                            </a>
                        )}
                        {phase.status === 'closed' && (
                            <a href={`/predictions/${phase.phase}`}
                                className="bg-gray-800 hover:bg-gray-700 text-sm text-center rounded-lg py-2 transition-colors">
                                View predictions
                            </a>
                        )}
                        {phase.status === 'locked' && (
                            <span className="text-sm text-gray-600 text-center">Not available yet</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}