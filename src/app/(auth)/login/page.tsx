'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    async function handleLogin() {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return setError(error.message)
        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-8 flex flex-col gap-5">
                <h1 className="text-2xl font-bold text-center">Quiniela 2026 🏆</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    onClick={handleLogin}
                    className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg py-3 transition-colors"
                >
                    Login
                </button>
                <a href="/register" className="text-sm text-center text-gray-400 hover:text-white transition-colors">
                    Don't have an account? Register
                </a>
            </div>
        </div>
    )
}