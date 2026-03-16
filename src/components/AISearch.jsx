import { useState, useRef } from 'react'
import '../styles/ai-search.css'

export default function AISearch({ loading, error, onSearch, onClear, hasResults, apiKey, onOpenSettings }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    onSearch(query.trim())
  }

  const handleClear = () => {
    setQuery('')
    onClear()
    inputRef.current?.focus()
  }

  return (
    <div className="ai-search">
      <form className="ai-search-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="ai-search-input"
          placeholder="Describe what you're in the mood for..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="ai-search-btn" disabled={loading || !query.trim()}>
          {loading ? '...' : 'Ask'}
        </button>
        {hasResults && (
          <button type="button" className="ai-search-clear" onClick={handleClear}>
            Clear
          </button>
        )}
      </form>
      {error && <div className="ai-search-error">{error}</div>}
    </div>
  )
}
