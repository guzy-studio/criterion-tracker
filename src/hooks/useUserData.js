import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

function getLocal(key, fallback) {
  try {
    const item = localStorage.getItem(`criterion-${key}`)
    return item ? JSON.parse(item) : fallback
  } catch { return fallback }
}

function setLocal(key, value) {
  try { localStorage.setItem(`criterion-${key}`, JSON.stringify(value)) } catch {}
}

export function useUserData(user) {
  const [watched, setWatched] = useState(() => getLocal('watched', []))
  const [notes, setNotes] = useState(() => getLocal('notes', {}))
  const [density, setDensity] = useState(() => getLocal('density', 4))
  const [theme, setTheme] = useState(() => getLocal('theme', 'dark'))
  const [loaded, setLoaded] = useState(!user)
  const saveTimer = useRef(null)

  // Load from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      setLoaded(true)
      return
    }

    supabase
      .from('profiles')
      .select('watched, notes, density, theme')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setWatched(data.watched || [])
          setNotes(data.notes || {})
          setDensity(data.density || 4)
          setTheme(data.theme || 'dark')
          // Sync to localStorage too
          setLocal('watched', data.watched || [])
          setLocal('notes', data.notes || {})
          setLocal('density', data.density || 4)
          setLocal('theme', data.theme || 'dark')
        } else if (error?.code === 'PGRST116') {
          // No profile yet — create one with current local data
          const localWatched = getLocal('watched', [])
          const localNotes = getLocal('notes', {})
          supabase.from('profiles').insert({
            id: user.id,
            watched: localWatched,
            notes: localNotes,
            density: getLocal('density', 4),
            theme: getLocal('theme', 'dark'),
          })
        }
        setLoaded(true)
      })
  }, [user])

  // Debounced save to Supabase
  const save = useCallback((updates) => {
    if (!user) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates })
        .then()
    }, 500)
  }, [user])

  const setWatchedAndSync = useCallback((updater) => {
    setWatched(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setLocal('watched', next)
      save({ watched: next })
      return next
    })
  }, [save])

  const setNotesAndSync = useCallback((updater) => {
    setNotes(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setLocal('notes', next)
      save({ notes: next })
      return next
    })
  }, [save])

  const setDensityAndSync = useCallback((val) => {
    setDensity(val)
    setLocal('density', val)
    save({ density: val })
  }, [save])

  const setThemeAndSync = useCallback((updater) => {
    setTheme(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setLocal('theme', next)
      save({ theme: next })
      return next
    })
  }, [save])

  return {
    watched, setWatched: setWatchedAndSync,
    notes, setNotes: setNotesAndSync,
    density, setDensity: setDensityAndSync,
    theme, setTheme: setThemeAndSync,
    loaded,
  }
}
