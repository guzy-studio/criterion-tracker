import { useState, useCallback, useMemo, useEffect } from 'react'
import filmsData from './data/films.json'

const films = [...filmsData].sort((a, b) => a.spine - b.spine)
import { useAuth } from './hooks/useAuth'
import { useUserData } from './hooks/useUserData'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import StatsBar from './components/StatsBar'
import FilmGrid from './components/FilmGrid'
import FilmDetail from './components/FilmDetail'
import NotesModal from './components/NotesModal'

function getDecade(year) {
  const d = Math.floor(year / 10) * 10
  return `${d}s`
}

export default function App() {
  const { user, loading: authLoading, signUp, signIn, signOut } = useAuth()
  const {
    watched: watchedArr, setWatched: setWatchedArr,
    notes, setNotes,
    density, setDensity,
    theme, setTheme,
    loaded: dataLoaded,
  } = useUserData(user)

  const [activeNoteSpine, setActiveNoteSpine] = useState(null)
  const [detailSpine, setDetailSpine] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  const [filters, setFilters] = useState({
    query: '',
    decade: null,
    genre: null,
    country: null,
    color: null,
    watched: null,
  })
  const [randomSpines, setRandomSpines] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [setTheme])

  const watched = useMemo(() => new Set(watchedArr), [watchedArr])

  const handleRandomize = useCallback(() => {
    const shuffled = [...films].sort(() => Math.random() - 0.5)
    setRandomSpines(new Set(shuffled.slice(0, 12).map(f => f.spine)))
  }, [])

  const clearRandom = useCallback(() => {
    setRandomSpines(null)
  }, [])

  const filteredFilms = useMemo(() => {
    let source = films

    if (randomSpines) {
      source = source.filter(f => randomSpines.has(f.spine))
    }

    const q = filters.query.toLowerCase().trim()
    return source.filter((film) => {
      if (q) {
        const haystack = [
          film.title,
          film.director,
          film.country,
          film.genre,
          ...(film.cast || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.decade && film.year && getDecade(film.year) !== filters.decade) return false
      if (filters.genre && (!film.genre || !film.genre.includes(filters.genre))) return false
      if (filters.country && film.country !== filters.country) return false
      if (filters.color && film.color !== filters.color) return false
      if (filters.watched === 'watched' && !watched.has(film.spine)) return false
      if (filters.watched === 'unwatched' && watched.has(film.spine)) return false
      return true
    })
  }, [filters, watched, randomSpines])

  const toggleWatched = useCallback((spine) => {
    setWatchedArr((prev) => {
      const set = new Set(prev)
      if (set.has(spine)) {
        set.delete(spine)
      } else {
        set.add(spine)
      }
      return [...set]
    })
  }, [setWatchedArr])

  const openDetail = useCallback((spine) => {
    setDetailSpine(spine)
    window.history.pushState({ spine }, '', `/film/${spine}`)
  }, [])

  const openNotes = useCallback((spine) => {
    setActiveNoteSpine(spine)
  }, [])

  const saveNote = useCallback((text) => {
    if (activeNoteSpine == null) return
    setNotes((prev) => ({ ...prev, [activeNoteSpine]: text }))
  }, [activeNoteSpine, setNotes])

  const closeNotes = useCallback(() => {
    setActiveNoteSpine(null)
  }, [])

  const activeFilm = activeNoteSpine != null
    ? films.find((f) => f.spine === activeNoteSpine)
    : null

  // Handle browser back/forward
  useEffect(() => {
    const handlePop = () => {
      const match = window.location.pathname.match(/^\/film\/(\d+)$/)
      setDetailSpine(match ? Number(match[1]) : null)
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  // Load PDP from URL on initial mount
  useEffect(() => {
    const match = window.location.pathname.match(/^\/film\/(\d+)$/)
    if (match) setDetailSpine(Number(match[1]))
  }, [])

  const detailFilm = detailSpine != null
    ? films.find((f) => f.spine === detailSpine)
    : null

  if (authLoading || !dataLoaded) return null

  return (
    <>
      <div>
        <Header
          density={density}
          onDensityChange={setDensity}
          theme={theme}
          onThemeChange={toggleTheme}
          user={user}
          onSignOut={signOut}
          onOpenAuth={() => setShowAuth(true)}
        />
        <SearchBar films={films} onFilter={setFilters} onRandomize={handleRandomize} onClearRandom={clearRandom} isRandom={!!randomSpines} />
        <StatsBar total={filteredFilms.length} watchedCount={filteredFilms.filter(f => watched.has(f.spine)).length} />
        <FilmGrid
          films={filteredFilms}
          density={density}
          watched={watched}
          onToggle={openDetail}
          onWatched={toggleWatched}
          onOpenNotes={openNotes}
          aiReasons={null}
        />
      </div>
      {detailFilm && (
        <FilmDetail
          film={detailFilm}
          isWatched={watched.has(detailSpine)}
          note={notes[detailSpine] || ''}
          onToggle={toggleWatched}
          onClose={() => { setDetailSpine(null); window.history.pushState({}, '', '/') }}
        />
      )}
      {activeFilm && (
        <NotesModal
          film={activeFilm}
          note={notes[activeNoteSpine] || ''}
          onSave={saveNote}
          onClose={closeNotes}
        />
      )}
      {showAuth && (
        <AuthModal
          onSignIn={signIn}
          onSignUp={signUp}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  )
}
