import { useRef, useState } from 'react'
import '../styles/avatar.css'

export default function Avatar({ url, onUpload, onSignOut }) {
  const fileRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      await onUpload(file)
    } catch (err) {
      console.error('Upload failed:', err)
      setError(err.message)
    } finally {
      setUploading(false)
      setMenuOpen(false)
    }
  }

  return (
    <div className="avatar-wrap">
      <button className="avatar" onClick={() => setMenuOpen(!menuOpen)}>
        {url ? (
          <img src={url} alt="Avatar" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="5" r="3" />
            <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
        )}
      </button>
      {menuOpen && (
        <>
          <div className="avatar-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="avatar-menu">
            <button onClick={() => fileRef.current?.click()}>
              Upload Photo
            </button>
            <button onClick={() => { onSignOut(); setMenuOpen(false) }}>
              Sign Out
            </button>
          </div>
        </>
      )}
      {error && <div className="avatar-error">{error}</div>}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        hidden
      />
    </div>
  )
}
