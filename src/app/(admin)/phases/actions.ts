'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') throw new Error('No autorizado')

    return { supabase, user }
}

export async function updatePhaseStatus(phaseId: number, newStatus: string) {
    const { supabase } = await assertAdmin()

    const { error } = await supabase
        .from('phases')
        .update({ status: newStatus })
        .eq('id', phaseId)

    if (error) throw new Error(error.message)

    revalidatePath('/phases')
}
