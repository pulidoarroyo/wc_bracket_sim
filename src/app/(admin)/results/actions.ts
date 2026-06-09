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

export async function saveResult(matchId: string, homeGoals: number, awayGoals: number) {
    const { supabase } = await assertAdmin()

    const { error } = await supabase
        .from('matches')
        .update({ home_goals: homeGoals, away_goals: awayGoals, result_locked: true })
        .eq('id', matchId)

    if (error) throw new Error(error.message)

    await supabase.rpc('calculate_match_scores', { p_match_id: matchId })

    revalidatePath('/results')
}

export async function deleteResult(matchId: string) {
    const { supabase } = await assertAdmin()

    const { error } = await supabase
        .from('matches')
        .update({ home_goals: null, away_goals: null, result_locked: false })
        .eq('id', matchId)

    if (error) throw new Error(error.message)

    revalidatePath('/results')
}