import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [{ data: profile }, { data: myStats }] = await Promise.all([
        supabase.from('profiles').select('username').eq('id', user.id).single(),
        supabase.from('leaderboard').select('*').eq('user_id', user.id).single(),
    ])

    return (
        <ProfileClient
            user={{ id: user.id, email: user.email }}
            initialUsername={profile?.username || ''}
            stats={myStats || null}
        />
    )
}
