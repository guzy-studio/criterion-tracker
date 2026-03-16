import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../styles/settings-modal.css'

export default function SettingsModal({ apiKey, onSave, onClose }) {
  const [visible, setVisible] = useState(false)
  const [key, setKey] = useState(apiKey || '')

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleSave = () => {
    onSave(key.trim())
    handleClose()
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 320)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  return createPortal(
    <div
      className={`notes-backdrop${visible ? ' visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className="notes-modal settings-modal">
        <div className="notes-modal-header">
          <div className="notes-modal-title">Settings</div>
          <div className="notes-modal-subtitle">
            Claude API key for AI-powered search
          </div>
        </div>
        <input
          type="password"
          className="settings-key-input"
          placeholder="sk-ant-..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <div className="settings-hint">
          Your key is stored locally and never sent anywhere except the Anthropic API.
        </div>
        <div className="settings-actions">
          <button className="notes-modal-close" onClick={handleClose}>Cancel</button>
          <button className="settings-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
