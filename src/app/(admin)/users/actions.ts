'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function assertAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        throw new Error('No autorizado')
    }

    return user
}

export async function updateUserRole(userId: string, newRole: string) {
    await assertAdmin()
    const admin = createAdminClient()

    const { error } = await admin
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) throw new Error(error.message)
    revalidatePath('/users')
}

export async function deleteUser(userId: string) {
    const currentUser = await assertAdmin()
    if (currentUser.id === userId) {
        throw new Error('No puedes eliminar tu propia cuenta.')
    }

    const admin = createAdminClient()

    // Delete related data first to prevent foreign key errors if CASCADE is not fully configured
    await admin.from('predictions').delete().eq('user_id', userId)
    await admin.from('profiles').delete().eq('id', userId)
    
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) throw new Error(error.message)

    revalidatePath('/users')
}
