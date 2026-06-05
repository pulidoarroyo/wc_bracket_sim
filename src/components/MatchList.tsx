'use client'

import { useState } from 'react'
import MatchDateEditor from './MatchDateEditor'

export default function MatchList({ initialMatches }: { initialMatches: any[] }) {
    const [matches, setMatches] = useState(initialMatches)

    function handleDelete(id: string) {
        setMatches(prev => prev.filter(m => m.id !== id))
    }

    return (
        <div className="flex flex-col gap-3">
            {matches.map(match => (
                <MatchDateEditor key={match.id} match={match} onDelete={handleDelete} />
            ))}
        </div>
    )
}