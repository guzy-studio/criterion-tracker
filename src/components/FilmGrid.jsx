import { useRef, useEffect, useState } from 'react'
import FilmCard from './FilmCard'
import '../styles/film-grid.css'

export default function FilmGrid({ films, density, watched, onToggle, onWatched, onOpenNotes, aiReasons }) {
  const [transitioning, setTransitioning] = useState(false)
  const prevDensity = useRef(density)

  useEffect(() => {
    if (prevDensity.current !== density) {
      setTransitioning(true)
      const timer = setTimeout(() => setTransitioning(false), 50)
      prevDensity.current = density
      return () => clearTimeout(timer)
    }
  }, [density])

  const isList = density === 'list'

  return (
    <div className={`film-grid ${isList ? 'density-list' : `density-${density}`}${transitioning ? ' transitioning' : ''}`}>
      {films.map((film) => (
        <FilmCard
          key={film.spine}
          film={film}
          isWatched={watched.has(film.spine)}
          onToggle={onToggle}
          onWatched={onWatched}
          onOpenNotes={onOpenNotes}
          listView={isList}
          aiReason={aiReasons?.get(film.spine)}
        />
      ))}
    </div>
  )
}
