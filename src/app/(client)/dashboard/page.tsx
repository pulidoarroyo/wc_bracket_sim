import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardTour from '@/components/DashboardTour'

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
    open: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
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
                <div id="dashboard-stats" className="bg-gray-900 border border-gray-800/80 rounded-2xl p-6 grid grid-cols-2 md:flex md:items-center md:justify-between gap-6 shadow-md shadow-black/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400 text-xl leading-none">🏅</div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">Posición</span>
                            <span className="text-2xl font-black text-yellow-400">#{myStats.position}</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-800 hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 text-xl leading-none">⚡</div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">Puntos totales</span>
                            <span className="text-2xl font-black text-white">{myStats.total_points}</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-800 hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 text-xl leading-none">🎯</div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">Exactos</span>
                            <span className="text-2xl font-black text-sky-400">{myStats.exact_scores}</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-800 hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-500/10 rounded-xl text-slate-400 text-xl leading-none">🙌</div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">Ganador</span>
                            <span className="text-2xl font-black text-slate-400">{myStats.correct_winners}</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-800 hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 text-xl leading-none">⚽</div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">Jugados</span>
                            <span className="text-2xl font-black text-purple-300">{myStats.matches_scored}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="phase-cards-container">
                {phases?.map((phase, idx) => (
                    <div key={phase.id} className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4 border border-gray-800 hover:border-gray-700 hover:shadow-xl hover:shadow-blue-500/[0.02] transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-200 group-hover:text-white transition-colors">{phaseLabels[phase.phase]}</h2>
                            <span 
                                id={idx === 0 ? "first-phase-badge" : undefined}
                                className={`text-xs px-2 py-1 rounded-full ${statusStyles[phase.status]}`}
                            >
                                {statusLabels[phase.status] ?? phase.status}
                            </span>
                        </div>
                        {phase.status === 'open' && (
                            <a href={`/predictions/${phase.phase}`}
                                className="bg-blue-500 hover:bg-blue-400 text-black text-sm font-semibold text-center rounded-lg py-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/10">
                                Hacer predicciones
                            </a>
                        )}
                        {phase.status === 'closed' && (
                            <a href={`/predictions/${phase.phase}`}
                                className="bg-gray-800 hover:bg-gray-700 text-sm text-center rounded-lg py-2 transition-all hover:scale-[1.02] active:scale-[0.98] border border-gray-700">
                                Ver predicciones
                            </a>
                        )}
                        {phase.status === 'locked' && (
                            <span className="text-sm text-gray-600 text-center py-2 bg-gray-950/40 rounded-lg border border-gray-900">Aún no disponible</span>
                        )}
                    </div>
                ))}
            </div>
            <DashboardTour />
        </div>
    )
}