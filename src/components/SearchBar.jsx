import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import '../styles/search-bar.css'

const DECADES = ['1920s','1930s','1940s','1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s']

export default function SearchBar({ films, onFilter, onRandomize, onClearRandom, isRandom }) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    decade: null,
    genre: null,
    country: null,
    color: null,
    watched: null,
  })
  const [expandedFilter, setExpandedFilter] = useState(null)
  const dropdownRef = useRef(null)

  const genres = useMemo(() => {
    const set = new Set()
    films.forEach(f => {
      if (f.genre) f.genre.split(', ').forEach(g => {
        if (g && g !== 'N/A' && g !== 'Unknown') set.add(g)
      })
    })
    return [...set].sort()
  }, [films])

  const countries = useMemo(() => {
    const set = new Set()
    films.forEach(f => { if (f.country) set.add(f.country) })
    return [...set].sort()
  }, [films])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExpandedFilter(null)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [])

  const applyFilters = useCallback((q, filters) => {
    onFilter({ query: q, ...filters })
  }, [onFilter])

  const handleQueryChange = (e) => {
    const q = e.target.value
    setQuery(q)
    applyFilters(q, activeFilters)
  }

  const setFilter = (key, value) => {
    const next = { ...activeFilters, [key]: activeFilters[key] === value ? null : value }
    setActiveFilters(next)
    applyFilters(query, next)
    setExpandedFilter(null)
  }

  const clearAll = () => {
    setQuery('')
    const cleared = { decade: null, genre: null, country: null, color: null, watched: null }
    setActiveFilters(cleared)
    applyFilters('', cleared)
  }

  const hasFilters = query || Object.values(activeFilters).some(v => v !== null)

  const toggleDropdown = (key) => {
    setExpandedFilter(prev => prev === key ? null : key)
  }

  return (
    <div className="search-bar">
      <div className="search-input-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search title, director, actor..."
          value={query}
          onChange={handleQueryChange}
        />
        {hasFilters && (
          <button className="search-clear" onClick={clearAll}>Clear</button>
        )}
      </div>
      <div className="search-filters" ref={dropdownRef}>
        <div className="filter-group">
          <button
            className={`filter-btn${activeFilters.decade ? ' active' : ''}`}
            onClick={() => toggleDropdown('decade')}
          >
            {activeFilters.decade || 'Decade'}
          </button>
          {expandedFilter === 'decade' && (
            <div className="filter-dropdown">
              {DECADES.map(d => (
                <button
                  key={d}
                  className={activeFilters.decade === d ? 'selected' : ''}
                  onClick={() => setFilter('decade', d)}
                >{d}</button>
              ))}
            </div>
          )}
        </div>

        <div className="filter-group">
          <button
            className={`filter-btn${activeFilters.genre ? ' active' : ''}`}
            onClick={() => toggleDropdown('genre')}
          >
            {activeFilters.genre || 'Genre'}
          </button>
          {expandedFilter === 'genre' && (
            <div className="filter-dropdown filter-dropdown-scroll">
              {genres.map(g => (
                <button
                  key={g}
                  className={activeFilters.genre === g ? 'selected' : ''}
                  onClick={() => setFilter('genre', g)}
                >{g}</button>
              ))}
            </div>
          )}
        </div>

        <div className="filter-group">
          <button
            className={`filter-btn${activeFilters.country ? ' active' : ''}`}
            onClick={() => toggleDropdown('country')}
          >
            {activeFilters.country || 'Country'}
          </button>
          {expandedFilter === 'country' && (
            <div className="filter-dropdown filter-dropdown-scroll">
              {countries.map(c => (
                <button
                  key={c}
                  className={activeFilters.country === c ? 'selected' : ''}
                  onClick={() => setFilter('country', c)}
                >{c}</button>
              ))}
            </div>
          )}
        </div>

        <div className="filter-group">
          <button
            className={`filter-btn${activeFilters.color ? ' active' : ''}`}
            onClick={() => toggleDropdown('color')}
          >
            {activeFilters.color === 'color' ? 'Color' : activeFilters.color === 'bw' ? 'B&W' : 'Color/B&W'}
          </button>
          {expandedFilter === 'color' && (
            <div className="filter-dropdown">
              <button
                className={activeFilters.color === 'color' ? 'selected' : ''}
                onClick={() => setFilter('color', 'color')}
              >Color</button>
              <button
                className={activeFilters.color === 'bw' ? 'selected' : ''}
                onClick={() => setFilter('color', 'bw')}
              >B&W</button>
            </div>
          )}
        </div>

        <div className="filter-group">
          <button
            className={`filter-btn${activeFilters.watched ? ' active' : ''}`}
            onClick={() => toggleDropdown('watched')}
          >
            {activeFilters.watched === 'watched' ? 'Watched' : activeFilters.watched === 'unwatched' ? 'Unwatched' : 'Status'}
          </button>
          {expandedFilter === 'watched' && (
            <div className="filter-dropdown">
              <button
                className={activeFilters.watched === 'watched' ? 'selected' : ''}
                onClick={() => setFilter('watched', 'watched')}
              >Watched</button>
              <button
                className={activeFilters.watched === 'unwatched' ? 'selected' : ''}
                onClick={() => setFilter('watched', 'unwatched')}
              >Unwatched</button>
            </div>
          )}
        </div>
        <button
          className={`filter-btn${isRandom ? ' active' : ''}`}
          onClick={onRandomize}
        >
          Random
        </button>
      </div>
    </div>
  )
}
