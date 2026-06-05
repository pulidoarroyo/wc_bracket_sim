import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', user!.id)
        .single()

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            <a href="/dashboard" className="text-green-400 font-bold text-lg">Quiniela 2026 🏆</a>
            <div className="flex items-center gap-6 text-sm">
                <a href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a>
                {profile?.role === 'admin' && (
                    <>
                        <a href="/results" className="text-gray-400 hover:text-white transition-colors">Results</a>
                        <a href="/phases" className="text-gray-400 hover:text-white transition-colors">Phases</a>
                    </>
                )}
                <span className="text-gray-500">{profile?.username}</span>
                <LogoutButton />
            </div>
        </nav>
    )
}