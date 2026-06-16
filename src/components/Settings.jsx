import { useCallback } from 'react'

const QUALITY_PRESETS = [
  { label: 'Small', quality: 11, maxWidth: 480 },
  { label: 'Balanced', quality: 16, maxWidth: 800 },
  { label: 'Best', quality: 20, maxWidth: 1200 },
]

export default function Settings({ value, onChange }) {
  const update = useCallback((patch) => {
    onChange((prev) => ({ ...prev, ...patch }))
  }, [onChange])

  return (
    <div className="settings">
      <h3>Settings</h3>
      <div className="settings-grid">
        <div className="settings-field">
          <label htmlFor="delay">Frame delay (ms)</label>
          <input
            id="delay"
            type="number"
            min={100}
            max={5000}
            step={10}
            value={value.delay}
            onChange={(e) => update({ delay: Math.max(100, Number(e.target.value)) })}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="loop">Loop count</label>
          <input
            id="loop"
            type="number"
            min={0}
            max={100}
            value={value.loop}
            onChange={(e) => update({ loop: Number(e.target.value) })}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="quality">Quality</label>
          <div className="settings-row">
            <input
              id="quality"
              type="range"
              min={1}
              max={20}
              step={1}
              value={value.quality}
              onChange={(e) => update({ quality: Number(e.target.value) })}
            />
            <span className="settings-row-value">{value.quality}</span>
          </div>
          <div className="quality-presets">
            {QUALITY_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => update({ quality: p.quality, maxWidth: p.maxWidth })}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="maxWidth">Max width (px)</label>
          <input
            id="maxWidth"
            type="number"
            min={100}
            max={4096}
            step={50}
            value={value.maxWidth}
            onChange={(e) => update({ maxWidth: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  )
}
