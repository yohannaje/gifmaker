export default function PreviewPanel({ gifUrl, generating, frames, previewOn, previewFrame }) {
  if (generating) {
    return (
      <div className="preview-panel">
        <div className="preview-empty">
          <div className="preview-empty-icon">◌</div>
          <div className="preview-empty-label">
            {generating === 'encoding' ? 'Processing frames...' : 'Rendering...'}
          </div>
        </div>
      </div>
    )
  }

  if (gifUrl) {
    return (
      <div className="preview-panel">
        <img className="preview-image" src={gifUrl} alt="Generated GIF" />
      </div>
    )
  }

  if (previewOn && frames.length > 0) {
    return (
      <div className="preview-panel">
        <div className="preview-live">
          {frames.map((f, i) => (
            <img
              key={f.id}
              src={f.src}
              alt=""
              className={`preview-live-img${i === previewFrame ? ' visible' : ''}`}
            />
          ))}
        </div>
        <div className="preview-live-label">
          Live preview · {frames.length} frame{frames.length !== 1 ? 's' : ''} @ {frames[previewFrame]?.width}×{frames[previewFrame]?.height}
        </div>
      </div>
    )
  }

  return (
    <div className="preview-panel">
      <div className="preview-empty">
        <div className="preview-empty-icon">⊞</div>
        <div className="preview-empty-label">No GIF yet</div>
        <div className="preview-empty-hint">
          Add images and click Download GIF
        </div>
      </div>
    </div>
  )
}
