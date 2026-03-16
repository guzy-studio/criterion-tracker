import '../styles/grid-toggle.css'

const ListIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
    <rect y="0" width="18" height="2" />
    <rect y="6" width="18" height="2" />
    <rect y="12" width="18" height="2" />
  </svg>
)

const Grid4Icon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <rect x="0" y="0" width="6" height="6" />
    <rect x="8" y="0" width="6" height="6" />
    <rect x="0" y="8" width="6" height="6" />
    <rect x="8" y="8" width="6" height="6" />
  </svg>
)

const Grid8Icon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <rect x="0" y="0" width="3" height="3" />
    <rect x="3.67" y="0" width="3" height="3" />
    <rect x="7.33" y="0" width="3" height="3" />
    <rect x="11" y="0" width="3" height="3" />
    <rect x="0" y="3.67" width="3" height="3" />
    <rect x="3.67" y="3.67" width="3" height="3" />
    <rect x="7.33" y="3.67" width="3" height="3" />
    <rect x="11" y="3.67" width="3" height="3" />
    <rect x="0" y="7.33" width="3" height="3" />
    <rect x="3.67" y="7.33" width="3" height="3" />
    <rect x="7.33" y="7.33" width="3" height="3" />
    <rect x="11" y="7.33" width="3" height="3" />
    <rect x="0" y="11" width="3" height="3" />
    <rect x="3.67" y="11" width="3" height="3" />
    <rect x="7.33" y="11" width="3" height="3" />
    <rect x="11" y="11" width="3" height="3" />
  </svg>
)

const views = [
  { value: 'list', icon: <ListIcon /> },
  { value: 4, icon: <Grid4Icon /> },
  { value: 8, icon: <Grid8Icon /> },
]

export default function GridToggle({ density, onChange }) {
  return (
    <div className="grid-toggle">
      {views.map((v) => (
        <button
          key={v.value}
          className={v.value === density ? 'active' : ''}
          onClick={() => onChange(v.value)}
        >
          {v.icon}
        </button>
      ))}
    </div>
  )
}
