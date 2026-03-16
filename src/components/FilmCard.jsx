import { memo, useCallback } from 'react'
import { useLongPress } from '../hooks/useLongPress'
import '../styles/film-card.css'

export default memo(function FilmCard({ film, isWatched, onToggle, onWatched, onOpenNotes, listView, aiReason }) {
  const handleClick = useCallback(() => {
    onToggle(film.spine)
  }, [film.spine, onToggle])

  const handleLongPress = useCallback(() => {
    onOpenNotes(film.spine)
  }, [film.spine, onOpenNotes])

  const handleWatched = useCallback((e) => {
    e.stopPropagation()
    onWatched(film.spine)
  }, [film.spine, onWatched])

  const longPressProps = useLongPress(handleLongPress, handleClick)

  if (listView) {
    return (
      <div
        className={`film-list-item${isWatched ? ' watched' : ''}`}
        {...longPressProps}
      >
        <span className="film-list-spine">#{film.spine}</span>
        <span className="film-list-title">
          {film.title}
          {aiReason && <span className="ai-reason"> — {aiReason}</span>}
        </span>
        <span className="film-list-director">{film.director}</span>
        <span className="film-list-year">{film.year}</span>
        <button className={`film-list-watch-btn${isWatched ? ' active' : ''}`} onClick={handleWatched}>
          {isWatched ? '●' : '○'}
        </button>
      </div>
    )
  }

  return (
    <div
      className={`film-card${isWatched ? ' watched' : ''}`}
      {...longPressProps}
    >
      <div className="film-card-image">
        {film.poster ? (
          <img
            className="film-card-poster"
            src={film.poster}
            alt={film.title}
            loading="lazy"
          />
        ) : null}
        <button
          className={`film-card-watch-btn${isWatched ? ' active' : ''}`}
          onClick={handleWatched}
        />
      </div>
      <div className="film-card-info">
        <div className="film-card-title">{film.title}</div>
        <div className="film-card-meta">
          #{film.spine} &middot; {film.director} &middot; {film.year}
        </div>
        {aiReason && <div className="ai-reason">{aiReason}</div>}
      </div>
    </div>
  )
})
