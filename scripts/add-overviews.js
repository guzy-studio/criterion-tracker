import { readFileSync, writeFileSync } from 'fs'

const films = JSON.parse(readFileSync('src/data/films.json', 'utf-8'))
const res = await fetch('https://raw.githubusercontent.com/Konsing/Criterion_Collection_Add-On_Stremio/main/app/criterion_movies.json')
const konsing = await res.json()

const byTitleYear = new Map()
const byTitle = new Map()
for (const k of konsing) {
  const t = k.title.toLowerCase().trim()
  const key = t + '|' + k.year
  if (!byTitleYear.has(key)) byTitleYear.set(key, k)
  if (!byTitle.has(t)) byTitle.set(t, k)
}

let matched = 0
for (const film of films) {
  const t = film.title.toLowerCase().trim()
  const match = byTitleYear.get(t + '|' + film.year) || byTitle.get(t)
  if (match && match.overview && match.overview !== 'No overview available.') {
    film.overview = match.overview
    matched++
  } else {
    film.overview = null
  }
}

writeFileSync('src/data/films.json', JSON.stringify(films, null, 2))
console.log(`Matched overviews: ${matched}/${films.length}`)
