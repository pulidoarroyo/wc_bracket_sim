import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const phaseLabels: Record<string, string> = {
    group_stage: 'Fase de grupos',
    round_of_32: 'Ronda de 32',
    round_of_16: 'Octavos de final',
    quarter_finals: 'Cuartos de final',
    semi_finals: 'Semifinales',
    third_place: 'Tercer lugar',
    final: 'Final',
}

const statusStyles: Record<string, string> = {
    open: 'bg-green-500/20 text-green-400 border border-green-500/30',
    closed: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    locked: 'bg-gray-700 text-gray-400 border border-gray-600',
}

const statusLabels: Record<string, string> = {
    open: 'Abierto',
    closed: 'Cerrado',
    locked: 'Bloqueado',
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [{ data: phases }, { data: profile }, { data: myStats }] = await Promise.all([
        supabase.from('phases').select('*').order('id'),
        supabase.from('profiles').select('username, role').eq('id', user.id).single(),
        supabase.from('leaderboard').select('*').eq('user_id', user.id).single(),
    ])

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold">¡Bienvenido, {profile?.username}! 👋</h1>
                <p className="text-gray-400 mt-1">Selecciona una fase para ingresar tus predicciones.</p>
            </div>

            {/* Score summary card */}
            {myStats && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-6 flex-wrap">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">Posición</span>
                        <span className="text-2xl font-bold text-yellow-400">#{myStats.position}</span>
                    </div>
                    <div className="w-px h-10 bg-gray-800 hidden sm:block" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">Puntos totales</span>
                        <span className="text-2xl font-bold">{myStats.total_points}</span>
                    </div>
                    <div className="w-px h-10 bg-gray-800 hidden sm:block" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">Marcadores exactos</span>
                        <span className="text-2xl font-bold text-green-400">{myStats.exact_scores}</span>
                    </div>
                    <div className="w-px h-10 bg-gray-800 hidden sm:block" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">Ganador correcto</span>
                        <span className="text-2xl font-bold text-blue-400">{myStats.correct_winners}</span>
                    </div>
                    <div className="w-px h-10 bg-gray-800 hidden sm:block" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500">Partidos jugados</span>
                        <span className="text-2xl font-bold text-gray-300">{myStats.matches_scored}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {phases?.map(phase => (
                    <div key={phase.id} className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">{phaseLabels[phase.phase]}</h2>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[phase.status]}`}>
                                {statusLabels[phase.status] ?? phase.status}
                            </span>
                        </div>
                        {phase.status === 'open' && (
                            <a href={`/predictions/${phase.phase}`}
                                className="bg-green-500 hover:bg-green-400 text-black text-sm font-semibold text-center rounded-lg py-2 transition-colors">
                                Hacer predicciones
                            </a>
                        )}
                        {phase.status === 'closed' && (
                            <a href={`/predictions/${phase.phase}`}
                                className="bg-gray-800 hover:bg-gray-700 text-sm text-center rounded-lg py-2 transition-colors">
                                Ver predicciones
                            </a>
                        )}
                        {phase.status === 'locked' && (
                            <span className="text-sm text-gray-600 text-center">Aún no disponible</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}