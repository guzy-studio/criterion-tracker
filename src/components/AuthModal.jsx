import { useState, useEffect } from 'react'
import '../styles/auth.css'

export default function AuthModal({ onSignIn, onSignUp, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 180)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isSignUp) {
        await onSignUp(email, password)
        setConfirmSent(true)
      } else {
        await onSignIn(email, password)
        handleClose()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`auth-overlay${visible ? ' visible' : ''}`}>
      <div className="auth-backdrop" onClick={handleClose} />
      <div className="auth-card">
        <button className="auth-close" onClick={handleClose}>Close</button>

        {confirmSent ? (
          <>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-confirm">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.
            </p>
            <button className="auth-btn" onClick={() => { setConfirmSent(false); setIsSignUp(false) }}>
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <h1 className="auth-title">{isSignUp ? 'Create Account' : 'Sign In'}</h1>
            <form onSubmit={handleSubmit} className="auth-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input"
              />
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            <button className="auth-switch" onClick={() => { setIsSignUp(!isSignUp); setError(null) }}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
