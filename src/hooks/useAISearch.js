import { useState, useCallback, useRef } from 'react'

function buildCatalog(films) {
  return films.map(f =>
    `${f.spine}|${f.title}|${f.director}|${f.year}|${f.country || ''}|${f.genre || ''}|${(f.cast || []).join(',')}|${f.color || ''}|${f.overview || ''}`
  ).join('\n')
}

export function useAISearch(films, apiKey) {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setResults(null)
      setError(null)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    const catalog = buildCatalog(films)

    // Use proxy (env var key) when no browser key is set
    const useProxy = !apiKey
    const url = useProxy ? '/api/claude' : 'https://api.anthropic.com/v1/messages'
    const headers = { 'Content-Type': 'application/json' }
    if (!useProxy) {
      headers['x-api-key'] = apiKey
      headers['anthropic-version'] = '2023-06-01'
      headers['anthropic-dangerous-direct-browser-access'] = 'true'
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `You are a film expert with deep knowledge of the Criterion Collection. Below is the full catalog in the format: spine|title|director|year|country|genre|cast|color|overview

${catalog}

USER QUERY: "${query}"

Based on this query, return the spine numbers of the 10-20 most relevant films, along with a brief reason for each pick. Consider mood, themes, content, style, historical context, and the user's intent.

Respond ONLY with valid JSON in this exact format, no other text:
{"results":[{"spine":1,"reason":"brief reason"},...]}`
          }],
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      const text = data.content[0].text
      const parsed = JSON.parse(text)
      setResults(parsed.results)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        setResults(null)
      }
    } finally {
      setLoading(false)
    }
  }, [films, apiKey])

  const clear = useCallback(() => {
    setResults(null)
    setError(null)
    if (abortRef.current) abortRef.current.abort()
  }, [])

  return { results, loading, error, search, clear }
}
