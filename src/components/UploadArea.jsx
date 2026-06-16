import { useRef, useState, useCallback } from 'react'

export default function UploadArea({ onAdd, disabled }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (files.length > 0) onAdd(files)
  }, [onAdd])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }, [disabled, handleFiles])

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e) => {
    if (e.target.files) handleFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div
      className={`upload-area${dragOver ? ' drag-over' : ''}${disabled ? ' disabled' : ''}`}
      onClick={handleClick}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="upload-icon">+</div>
      <div className="upload-label">
        {disabled ? 'Max 50 frames reached' : 'Drop images here or click to upload'}
      </div>
      <div className="upload-hint">Supports PNG, JPEG, WebP</div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        hidden
      />
    </div>
  )
}
