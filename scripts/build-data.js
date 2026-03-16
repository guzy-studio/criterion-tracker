#!/usr/bin/env node

/**
 * One-time data build script.
 *
 * Usage:
 *   TMDB_API_KEY=your_key node scripts/build-data.js
 *
 * This script:
 * 1. Reads a seed CSV/JSON of Criterion spines (title, director, year)
 * 2. Queries TMDB to get poster paths
 * 3. Outputs src/data/films.json
 *
 * If no TMDB key is provided, it outputs the data without poster paths.
 */

import { writeFileSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = resolve(__dirname, '../src/data/films.json')
const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_SEARCH = 'https://api.themoviedb.org/3/search/movie'

// Seed data — add more entries here or replace with a scraped dataset
const SEED = JSON.parse(readFileSync(resolve(__dirname, '../src/data/films.json'), 'utf-8'))

async function fetchPoster(title, year) {
  if (!TMDB_KEY) return null
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    query: title,
    year: String(year),
  })
  try {
    const res = await fetch(`${TMDB_SEARCH}?${params}`)
    const data = await res.json()
    return data.results?.[0]?.poster_path || null
  } catch {
    return null
  }
}

async function main() {
  console.log(`Processing ${SEED.length} films...`)
  if (!TMDB_KEY) {
    console.log('No TMDB_API_KEY set — skipping poster lookup.')
    console.log('Films already written. Done.')
    return
  }

  const films = []
  for (const film of SEED) {
    if (film.poster) {
      films.push(film)
      continue
    }
    const poster = await fetchPoster(film.title, film.year)
    films.push({ ...film, poster })
    // Respect TMDB rate limit
    await new Promise((r) => setTimeout(r, 260))
    process.stdout.write('.')
  }
  console.log()

  films.sort((a, b) => a.spine - b.spine)
  writeFileSync(OUTPUT, JSON.stringify(films, null, 2))
  console.log(`Wrote ${films.length} films to ${OUTPUT}`)
}

main().catch(console.error)
