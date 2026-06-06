'use client'

import { useState } from 'react'
import LogoutButton from './LogoutButton'
import ThemeToggle from './ThemeToggle'

interface NavbarClientProps {
    username: string | null
    isAdmin: boolean
}

export default function NavbarClient({ username, isAdmin }: NavbarClientProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const startTour = () => {
        localStorage.setItem('run_dashboard_tour', 'true')
        if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard'
        } else {
            window.dispatchEvent(new Event('trigger-dashboard-tour'))
        }
    }

    const links = [
        { href: '/leaderboard', label: 'Clasificación' },
        ...(isAdmin
            ? [
                { href: '/results', label: 'Resultados' },
                { href: '/phases', label: 'Fases' },
                { href: '/matches', label: 'Partidos' },
                { href: '/users', label: 'Usuarios' },
            ]
            : []),
    ]

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
                <a href="/dashboard" className="text-blue-400 font-bold text-lg flex items-center gap-2.5 hover:text-blue-300 transition-colors">
                    <img src="/favicon.ico" alt="Logo" className="w-7 h-7 object-contain" />
                    <span className="hidden xs:inline">Quiniela NAVIORCA Mundial 2026</span>
                    <span className="xs:hidden">Quiniela NAVIORCA</span>
                </a>

                {/* Desktop links */}
                <div className="hidden sm:flex items-center gap-6 text-sm">
                    {links.map(link => (
                        <a 
                            key={link.href} 
                            href={link.href} 
                            id={link.href === '/leaderboard' ? 'nav-leaderboard' : undefined}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                    <span className="text-gray-500">{username}</span>
                    <button 
                        onClick={startTour}
                        className="text-gray-400 hover:text-white transition-colors text-sm focus:outline-none flex items-center gap-1 cursor-pointer bg-transparent border-0 py-1"
                        title="Ver tutorial guiado"
                    >
                        <span>Ayuda ❓</span>
                    </button>
                    <ThemeToggle />
                    <LogoutButton />
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMenuOpen(prev => !prev)}
                    className="sm:hidden text-gray-400 hover:text-white transition-colors focus:outline-none"
                    aria-label="Abrir menú"
                >
                    {menuOpen ? (
                        /* X icon */
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        /* Hamburger icon */
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="sm:hidden mt-4 flex flex-col gap-3 border-t border-gray-800 pt-4 text-sm">
                    {links.map(link => (
                        <a
                            key={link.href}
                            href={link.href}
                            id={link.href === '/leaderboard' ? 'nav-leaderboard-mobile' : undefined}
                            className="text-gray-400 hover:text-white transition-colors py-1"
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <span className="text-gray-500">{username}</span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={startTour}
                                className="text-gray-400 hover:text-white transition-colors text-sm focus:outline-none cursor-pointer bg-transparent border-0"
                            >
                                Ayuda ❓
                            </button>
                            <ThemeToggle />
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
