import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import UserListClient from './UserListClient'

export default async function UsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    const admin = createAdminClient()
    
    // Fetch profiles and auth users in parallel
    const [profilesRes, usersRes] = await Promise.all([
        admin.from('profiles').select('*').order('username'),
        admin.auth.admin.listUsers()
    ])

    const profiles = profilesRes.data ?? []
    const authUsers = usersRes.data?.users ?? []

    // Map profiles with their email from authUsers
    const usersList = profiles.map(p => {
        const authUser = authUsers.find(u => u.id === p.id)
        return {
            id: p.id,
            username: p.username || 'Sin nombre',
            role: p.role || 'user',
            email: authUser?.email ?? 'N/A',
            created_at: authUser?.created_at ?? p.created_at
        }
    })

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Administrar usuarios 👥</h1>
                <p className="text-gray-400 mt-1">Gestiona roles y elimina usuarios registrados.</p>
            </div>
            <UserListClient initialUsers={usersList} currentUserId={user.id} />
        </div>
    )
}
