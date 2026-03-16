import '../styles/stats-bar.css'

export default function StatsBar({ total, watchedCount }) {
  const pct = total > 0 ? Math.round((watchedCount / total) * 100) : 0

  return (
    <div className="stats-bar">
      <span>
        <span className="stat-value">{watchedCount}</span> watched
      </span>
      <span>
        <span className="stat-value">{total - watchedCount}</span> unwatched
      </span>
      <span>
        <span className="stat-value">{pct}%</span> complete
      </span>
    </div>
  )
}
