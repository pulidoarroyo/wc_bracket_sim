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

export async function createMatch(payload: {
    phase: string
    home_team_id: string
    away_team_id: string
    match_date: string | null
    venue: string | null
}) {
    const { supabase } = await assertAdmin()

    const { error } = await supabase.from('matches').insert(payload)

    if (error) throw new Error(error.message)

    revalidatePath('/matches')
}

export async function updateMatchDateTime(
    matchId: string,
    matchDate: string | null,
    venue: string | null
) {
    const { supabase } = await assertAdmin()

    const { error } = await supabase
        .from('matches')
        .update({ match_date: matchDate, venue })
        .eq('id', matchId)

    if (error) throw new Error(error.message)

    revalidatePath('/matches')
}

export async function deleteMatch(matchId: string) {
    const { supabase } = await assertAdmin()

    const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)

    if (error) throw new Error(error.message)

    revalidatePath('/matches')
}
