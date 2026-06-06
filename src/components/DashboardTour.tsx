'use client'

import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export default function DashboardTour() {
    useEffect(() => {
        const runTour = () => {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                allowClose: true,
                overlayColor: 'rgba(0, 0, 0, 0.75)',
                nextBtnText: 'Siguiente →',
                prevBtnText: '← Anterior',
                doneBtnText: '¡Comenzar!',
                steps: [
                    {
                        element: '#dashboard-stats',
                        popover: {
                            title: '📊 Tu Panel de Puntos',
                            description: 'Aquí verás tu posición actual en la tabla, tus puntos totales, y cuántos marcadores exactos o ganadores has acertado.',
                            side: 'bottom',
                            align: 'start'
                        }
                    },
                    {
                        element: '#first-phase-badge',
                        popover: {
                            title: '🏷️ Estado de la Fase',
                            description: 'Las fases pueden estar <b>Abiertas</b> (puedes pronosticar), <b>Cerradas</b> (en juego, ya no se edita) o <b>Bloqueadas</b> (aún no disponibles).',
                            side: 'bottom',
                            align: 'start'
                        }
                    },
                    {
                        element: '#phase-cards-container',
                        popover: {
                            title: '⚽ Fases del Torneo',
                            description: 'Haz clic en "Hacer predicciones" o "Ver predicciones" en cualquiera de estas tarjetas para pronosticar los partidos correspondientes.',
                            side: 'top',
                            align: 'start'
                        }
                    },
                    {
                        element: typeof window !== 'undefined' && window.innerWidth < 640 ? '#nav-leaderboard-mobile' : '#nav-leaderboard',
                        popover: {
                            title: '🏆 Tabla de Clasificación',
                            description: 'Accede aquí para ver la tabla general de posiciones y compararte con todos los participantes del torneo.',
                            side: 'bottom',
                            align: 'center'
                        }
                    },
                    {
                        popover: {
                            title: '🎉 ¡Todo Listo!',
                            description: 'Ya conoces el funcionamiento básico del sistema. ¡Mucha suerte con tus predicciones y a ganar!',
                        }
                    }
                ],
                onDestroyed: () => {
                    localStorage.setItem('has_seen_tour', 'true')
                    localStorage.removeItem('run_dashboard_tour')
                }
            })

            driverObj.drive()
        }

        // Check if the user needs the tour automatically on first load, or if they requested it manually
        const hasSeenTour = localStorage.getItem('has_seen_tour')
        const runManualTour = localStorage.getItem('run_dashboard_tour') === 'true'

        if (!hasSeenTour || runManualTour) {
            // Short delay to ensure everything is mounted and animated in
            const timer = setTimeout(runTour, 600)
            return () => clearTimeout(timer)
        }

        // Listen for manual trigger events from the navbar
        const handleTrigger = () => {
            runTour()
        }

        window.addEventListener('trigger-dashboard-tour', handleTrigger)
        return () => {
            window.removeEventListener('trigger-dashboard-tour', handleTrigger)
        }
    }, [])

    return null
}
