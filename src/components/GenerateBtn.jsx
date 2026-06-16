export default function GenerateBtn({ onClick, disabled, generating }) {
  return (
    <button
      className={`generate-btn${generating ? ' generating' : ''}`}
      onClick={onClick}
      disabled={disabled || !!generating}
    >
      {generating ? 'Generating...' : 'Download GIF'}
    </button>
  )
}
