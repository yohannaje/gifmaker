import { useState, useCallback, useRef, useEffect } from 'react'
import GIF from 'gif.js'
import UploadArea from './components/UploadArea.jsx'
import FrameList from './components/FrameList.jsx'
import Settings from './components/Settings.jsx'
import PreviewPanel from './components/PreviewPanel.jsx'
import GenerateBtn from './components/GenerateBtn.jsx'

let frameId = 0

function downloadBlob(blob, name = 'my-animation.gif') {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function loadImage(src, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const timer = setTimeout(() => {
      img.src = ''
      reject(new Error(`Image load timed out: ${src}`))
    }, timeout)
    img.onload = () => {
      clearTimeout(timer)
      resolve(img)
    }
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error(`Failed to load image: ${src}`))
    }
    img.src = src
  })
}

export default function App() {
  const [frames, setFrames] = useState([])
  const [gifUrl, setGifUrl] = useState(null)
  const [generating, setGenerating] = useState(null)
  const [progress, setProgress] = useState(0)
  const [previewOn, setPreviewOn] = useState(true)
  const [previewFrame, setPreviewFrame] = useState(0)
  const previewTimer = useRef(null)
  const [settings, setSettings] = useState({
    delay: 500,
    quality: 5,
    loop: 0,
    maxWidth: 800,
  })

  const addFrames = useCallback(async (files) => {
    const entries = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const url = URL.createObjectURL(file)
      try {
        const img = await loadImage(url)
        entries.push({
          id: ++frameId,
          src: url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          name: file.name,
          loaded: true,
        })
      } catch (e) {
        URL.revokeObjectURL(url)
        console.warn('Could not load image:', file.name, e)
      }
    }
    setFrames((prev) => [...prev, ...entries])
  }, [])

  const removeFrame = useCallback((id) => {
    setFrames((prev) => {
      const f = prev.find((x) => x.id === id)
      if (f) URL.revokeObjectURL(f.src)
      return prev.filter((x) => x.id !== id)
    })
  }, [])

  const reorderFrames = useCallback((startIndex, endIndex) => {
    setFrames((prev) => {
      const next = [...prev]
      const [moved] = next.splice(startIndex, 1)
      next.splice(endIndex, 0, moved)
      return next
    })
  }, [])

  useEffect(() => {
    if (!previewOn || frames.length === 0) {
      clearInterval(previewTimer.current)
      previewTimer.current = null
      return
    }
    setPreviewFrame((i) => Math.min(i, frames.length - 1))
    previewTimer.current = setInterval(() => {
      setPreviewFrame((i) => (i + 1) % frames.length)
    }, settings.delay)
    return () => clearInterval(previewTimer.current)
  }, [previewOn, frames.length, settings.delay])

  const handleGenerate = useCallback(async () => {
    const framesSnapshot = frames
    if (framesSnapshot.length === 0) return
    setGenerating('encoding')
    setProgress(0)
    setGifUrl(null)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const maxW = settings.maxWidth

    try {
      // Two-pass approach:
      // 1. load all images, compute uniform canvas size
      // 2. draw each frame into a fixed-size canvas for gif.js

      const loaded = []
      let gifW = 0
      let gifH = 0

      for (let i = 0; i < framesSnapshot.length; i++) {
        const f = framesSnapshot[i]
        const img = await loadImage(f.src)
        const scale = maxW < img.naturalWidth ? maxW / img.naturalWidth : 1
        const w = Math.round(img.naturalWidth * scale)
        const h = Math.round(img.naturalHeight * scale)
        loaded.push({ img, nw: img.naturalWidth, nh: img.naturalHeight })
        if (w > gifW) gifW = w
        if (h > gifH) gifH = h
      }

      canvas.width = gifW
      canvas.height = gifH

      const gif = new GIF({
        workers: 2,
        quality: settings.quality,
        repeat: settings.loop === 0 ? 0 : settings.loop - 1,
        workerScript: '/gif.worker.js',
        width: gifW,
        height: gifH,
      })

      for (let i = 0; i < loaded.length; i++) {
        const { img, nw, nh } = loaded[i]
        // Fill canvas completely (center-crops source when aspect ratios differ)
        const fillScale = Math.max(gifW / nw, gifH / nh)
        const sw = gifW / fillScale
        const sh = gifH / fillScale
        const sx = (nw - sw) / 2
        const sy = (nh - sh) / 2
        ctx.clearRect(0, 0, gifW, gifH)
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, gifW, gifH)
        gif.addFrame(ctx, { copy: true, delay: settings.delay })
        setProgress((i + 1) / loaded.length)
      }

      setGenerating('rendering')
      setProgress(0)

      await new Promise((resolve, reject) => {
        gif.on('progress', (p) => {
          setProgress(p)
        })
        gif.on('finished', (blob) => {
          downloadBlob(blob)
          const url = URL.createObjectURL(blob)
          setGifUrl(url)
          setGenerating(null)
          setProgress(1)
          resolve()
        })
        gif.on('error', (err) => {
          reject(err)
        })
        gif.render()
      })
    } catch (e) {
      console.error('GIF generation error:', e)
      setGenerating(null)
      setProgress(0)
    }

    canvas.width = 0
    canvas.height = 0
  }, [frames, settings])

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">Gif Maker</h1>
        <p className="header-sub">Turn images into lightweight GIFs for the web</p>
      </header>

      <main className="main">
        <div className="left">
          <UploadArea onAdd={addFrames} disabled={frames.length >= 50} />

          {frames.length > 0 && (
            <FrameList
              frames={frames}
              onRemove={removeFrame}
              onReorder={reorderFrames}
            />
          )}

          <Settings value={settings} onChange={setSettings} />

          <label className={`toggle${previewOn ? ' on' : ''}`}>
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <input
              type="checkbox"
              checked={previewOn}
              onChange={(e) => setPreviewOn(e.target.checked)}
              hidden
            />
            Preview
          </label>

          {generating && (
            <div className="progress-bar-wrap">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="progress-label">
                {generating === 'encoding'
                  ? 'Preparing frames...'
                  : `Rendering GIF... ${Math.round(progress * 100)}%`}
              </span>
            </div>
          )}

          <GenerateBtn
            onClick={handleGenerate}
            disabled={frames.length === 0}
            generating={generating}
          />
        </div>

        <div className="right">
          <PreviewPanel
            gifUrl={gifUrl}
            generating={generating}
            frames={frames}
            previewOn={previewOn && !gifUrl && !generating}
            previewFrame={previewFrame}
          />
        </div>
      </main>
    </div>
  )
}
