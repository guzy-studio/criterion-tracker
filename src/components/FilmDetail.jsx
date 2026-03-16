import { useState, useEffect } from 'react'
import '../styles/film-detail.css'

export default function FilmDetail({ film, isWatched, note, onToggle, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 180)
  }

  return (
    <div className={`film-detail${visible ? ' visible' : ''}`}>
      <button className="film-detail-back" onClick={handleClose}>Back</button>

      <div className="film-detail-layout">
        <div className="film-detail-image">
          {film.poster ? (
            <img src={film.poster} alt={film.title} />
          ) : (
            <div className="film-detail-placeholder">#{film.spine}</div>
          )}
        </div>

        <div className="film-detail-info">
          <h2 className="film-detail-title">{film.title}</h2>

          <div className="film-detail-meta">
            <div className="film-detail-row">
              <span className="film-detail-label">Spine</span>
              <span>#{film.spine}</span>
            </div>
            <div className="film-detail-row">
              <span className="film-detail-label">Director</span>
              <span>{film.director}</span>
            </div>
            <div className="film-detail-row">
              <span className="film-detail-label">Year</span>
              <span>{film.year}</span>
            </div>
            {film.runtime && (
              <div className="film-detail-row">
                <span className="film-detail-label">Runtime</span>
                <span>{film.runtime}</span>
              </div>
            )}
            {film.country && (
              <div className="film-detail-row">
                <span className="film-detail-label">Country</span>
                <span>{film.country}</span>
              </div>
            )}
            {film.genre && (
              <div className="film-detail-row">
                <span className="film-detail-label">Genre</span>
                <span>{film.genre}</span>
              </div>
            )}
            {film.color && (
              <div className="film-detail-row">
                <span className="film-detail-label">Format</span>
                <span>{film.color === 'bw' ? 'Black & White' : 'Color'}</span>
              </div>
            )}
            {film.cast && film.cast.length > 0 && (
              <div className="film-detail-row">
                <span className="film-detail-label">Cast</span>
                <span>{film.cast.join(', ')}</span>
              </div>
            )}
          </div>

          {film.overview && (
            <div className="film-detail-synopsis">
              <span className="film-detail-label">Synopsis</span>
              <p>{film.overview}</p>
            </div>
          )}

          <div className="film-detail-trailer">
            <span className="film-detail-label">Trailer</span>
            <a
              className="film-detail-trailer-link"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${film.title} ${film.year} criterion trailer`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Search on YouTube
            </a>
          </div>

          {note && (
            <div className="film-detail-notes">
              <span className="film-detail-label">Your Notes</span>
              <p>{note}</p>
            </div>
          )}

          <button
            className={`film-detail-watched-btn${isWatched ? ' active' : ''}`}
            onClick={() => onToggle(film.spine)}
          >
            {isWatched ? 'Watched' : 'Mark as Watched'}
          </button>
        </div>
      </div>
    </div>
  )
}
