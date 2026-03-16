import GridToggle from './GridToggle'
import '../styles/header.css'
import '../styles/theme-toggle.css'

export default function Header({ density, onDensityChange, theme, onThemeChange, user, onSignOut, onOpenAuth }) {
  const handleHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="header">
      <h1 className="header-logo" onClick={handleHome}>Criterion Collection</h1>
      <div className="header-controls">
        <GridToggle density={density} onChange={onDensityChange} />
        <button className="theme-toggle" onClick={onThemeChange}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        {user ? (
          <button className="header-auth-link" onClick={onSignOut}>Sign Out</button>
        ) : (
          <button className="header-auth-link" onClick={onOpenAuth}>Sign In</button>
        )}
      </div>
    </header>
  )
}
