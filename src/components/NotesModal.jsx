import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles/notes-modal.css'

export default function NotesModal({ film, note, onSave, onClose }) {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState(note || '')
  const textareaRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    setText(note || '')
  }, [note])

  const handleChange = (e) => {
    const val = e.target.value
    setText(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSave(val), 300)
  }

  const handleClose = () => {
    onSave(text)
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
      <div className="notes-modal">
        <div className="notes-modal-header">
          <div className="notes-modal-title">{film.title}</div>
          <div className="notes-modal-subtitle">
            {film.director} &middot; {film.year} &middot; Spine #{film.spine}
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Add notes..."
          rows={5}
        />
        <button className="notes-modal-close" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>,
    document.body
  )
}
