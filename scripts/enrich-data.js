#!/usr/bin/env node

/**
 * Enriches src/data/films.json with additional metadata:
 *   - country  (from Criterion HTML at /tmp/criterion_page.html)
 *   - genre    (from Konsing dataset, comma-separated string)
 *   - cast     (from Konsing dataset, array of strings)
 *   - color    ("color" | "bw", heuristic: year < 1960 → "bw")
 *
 * Usage:
 *   node scripts/enrich-data.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FILMS_PATH = resolve(__dirname, '../src/data/films.json')
const HTML_PATH = '/tmp/criterion_page.html'
const KONSING_URL =
  'https://raw.githubusercontent.com/Konsing/Criterion_Collection_Add-On_Stremio/main/app/criterion_movies.json'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize a title for fuzzy matching: lowercase, trim, collapse whitespace */
function normalizeTitle(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // strip leading articles so "The 400 Blows" matches "400 Blows" etc. (optional pass)
    .replace(/^(the|a|an) /, '')
}

/** Build a lookup key from title + year */
function makeKey(title, year) {
  return `${normalizeTitle(title)}|${year}`
}

// ---------------------------------------------------------------------------
// Step 1 – Read existing films.json
// ---------------------------------------------------------------------------

console.log('=== Step 1: Reading existing films.json ===')
const films = JSON.parse(readFileSync(FILMS_PATH, 'utf-8'))
console.log(`  Loaded ${films.length} films`)

// ---------------------------------------------------------------------------
// Step 2 – Download Konsing dataset
// ---------------------------------------------------------------------------

console.log('\n=== Step 2: Downloading Konsing dataset ===')
let konsingRaw
try {
  const res = await fetch(KONSING_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  konsingRaw = await res.json()
  console.log(`  Downloaded ${konsingRaw.length} entries from Konsing dataset`)
} catch (err) {
  console.error(`  ERROR fetching Konsing dataset: ${err.message}`)
  process.exit(1)
}

// Build primary lookup: "normalizedTitle|year" → entry
// Also build a fallback: "normalizedTitle" → entry (ignore year)
const konsingByTitleYear = new Map()
const konsingByTitle = new Map()

for (const entry of konsingRaw) {
  const year = String(entry.year || '').trim()
  const key = makeKey(entry.title, year)
  konsingByTitleYear.set(key, entry)

  const titleKey = normalizeTitle(entry.title)
  // Only set the first match for title-only fallback (keeps earliest)
  if (!konsingByTitle.has(titleKey)) {
    konsingByTitle.set(titleKey, entry)
  }
}

// ---------------------------------------------------------------------------
// Step 3 – Parse Criterion HTML for spine → country mapping
// ---------------------------------------------------------------------------

console.log('\n=== Step 3: Parsing Criterion HTML for country data ===')
let htmlContent
try {
  htmlContent = readFileSync(HTML_PATH, 'utf-8')
  console.log(`  Read HTML file (${Math.round(htmlContent.length / 1024)} KB)`)
} catch (err) {
  console.error(`  ERROR reading ${HTML_PATH}: ${err.message}`)
  process.exit(1)
}

// Extract all gridFilm rows
const rowRegex = /<tr class="gridFilm"[\s\S]*?<\/tr>/g
const spineCountryMap = new Map() // spine (number) → country (string)
let rowCount = 0
let countryCount = 0

for (const row of htmlContent.matchAll(rowRegex)) {
  rowCount++
  const rowStr = row[0]

  // Extract spine number
  const spineMatch = rowStr.match(/<td class="g-spine">\s*(\d+)\s*<\/td>/)
  if (!spineMatch) continue
  const spineNum = parseInt(spineMatch[1], 10)

  // Extract country — strip decorative comma span, then strip all remaining tags
  const countryMatch = rowStr.match(/<td class="g-country">([\s\S]*?)<\/td>/)
  if (!countryMatch) continue

  let countryRaw = countryMatch[1]
  // Remove the decorative comma span
  countryRaw = countryRaw.replace(/<span class="g-country__comma">[\s\S]*?<\/span>/g, '')
  // Remove all remaining HTML tags
  countryRaw = countryRaw.replace(/<[^>]+>/g, ' ')
  // Collapse whitespace and trim
  const country = countryRaw.replace(/\s+/g, ' ').trim()

  if (country) {
    spineCountryMap.set(spineNum, country)
    countryCount++
  }
}

console.log(`  Scanned ${rowCount} gridFilm rows`)
console.log(`  Extracted country for ${countryCount} spine entries`)

// ---------------------------------------------------------------------------
// Step 4 – Match films and enrich
// ---------------------------------------------------------------------------

console.log('\n=== Step 4: Enriching films ===')

let matchedTitleYear = 0
let matchedTitleOnly = 0
let noMatch = 0
let countryHits = 0
let colorBw = 0
let colorColor = 0

const enriched = films.map((film) => {
  // --- country (from HTML) ---
  const country = spineCountryMap.get(film.spine) ?? null
  if (country) countryHits++

  // --- color heuristic ---
  const color = film.year < 1960 ? 'bw' : 'color'
  if (color === 'bw') colorBw++
  else colorColor++

  // --- genre + cast (from Konsing) ---
  const filmYear = String(film.year).trim()
  const primaryKey = makeKey(film.title, filmYear)
  let konsingEntry = konsingByTitleYear.get(primaryKey)
  let matchType = null

  if (konsingEntry) {
    matchType = 'title+year'
    matchedTitleYear++
  } else {
    // Fallback: title-only match
    const titleKey = normalizeTitle(film.title)
    konsingEntry = konsingByTitle.get(titleKey)
    if (konsingEntry) {
      matchType = 'title-only'
      matchedTitleOnly++
    } else {
      noMatch++
    }
  }

  const genre = konsingEntry?.genre ?? null
  const cast = konsingEntry?.cast ?? null

  if (process.env.VERBOSE && matchType === null) {
    console.log(`  [NO MATCH] spine=${film.spine} "${film.title}" (${film.year})`)
  }

  return {
    spine: film.spine,
    title: film.title,
    director: film.director,
    year: film.year,
    poster: film.poster,
    country,
    genre,
    cast,
    color,
  }
})

// ---------------------------------------------------------------------------
// Step 5 – Write output
// ---------------------------------------------------------------------------

console.log('\n=== Step 5: Writing enriched films.json ===')
writeFileSync(FILMS_PATH, JSON.stringify(enriched, null, 2))
console.log(`  Wrote ${enriched.length} films to ${FILMS_PATH}`)

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('\n=== Summary ===')
console.log(`  Total films:               ${films.length}`)
console.log(`  Country filled:            ${countryHits} / ${films.length}`)
console.log(`  Konsing match (title+year): ${matchedTitleYear}`)
console.log(`  Konsing match (title only): ${matchedTitleOnly}`)
console.log(`  Konsing no match:           ${noMatch}`)
console.log(`  Color heuristic — color:   ${colorColor}`)
console.log(`  Color heuristic — bw:      ${colorBw}`)

// Show a few sample enriched entries
console.log('\n=== Sample output (first 3 entries) ===')
for (const f of enriched.slice(0, 3)) {
  console.log(JSON.stringify(f, null, 2))
}
