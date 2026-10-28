
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMistakes, getFocusMistake } from '../lib/data'
import { pick, t } from '../lib/i18n'

function shuffled(length) {
  const order = Array.from({ length }, (_, index) => index)

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }

  return order
}

function localized(value, fallback = '') {
  if (value == null) return fallback
  if (typeof value === 'string') return value
  return pick(value) || fallback
}

export default function FixBuddy() {
  const navigate = useNavigate()

  const mistake = (() => {
    const all = getMistakes() || []
    const focusId = getFocusMistake()

    // Do not silently teach an unrelated mistake.
    if (!focusId) return null

    return all.find(item => item.id === focusId) || null
  })()

  const steps = Array.isArray(mistake?.buddySteps)
    ? mistake.buddySteps
    : []

  const [order] = useState(() => shuffled(steps.length))
  const [picked, setPicked] = useState([])
  const [message, setMessage] = useState('')

  if (!mistake) {
    return (
      <main style={{ padding: 24, maxWidth: 640, margin: '30px auto' }}>
        <h1>{t('student.buddy')}</h1>
        <p>
          No focused mistake was found. Please complete the diagnostic
          and lesson first.
        </p>
        <button type="button" onClick={() => navigate('/join')}>
          Start diagnostic
        </button>
      </main>
    )
  }

  if (steps.length === 0) {
    return (
      <main style={{ padding: 24, maxWidth: 640, margin: '30px auto' }}>
        <h1>{t('student.buddy')}</h1>
        <p>No correction steps are available for this mistake yet.</p>
        <button type="button" onClick={() => navigate('/learn')}>
          Return to lesson
        </button>
      </main>
    )
  }

  const finished = picked.length === steps.length

  function choose(stepIndex) {
    if (picked.includes(stepIndex) || finished) return

    const expectedStepIndex = picked.length

    if (stepIndex === expectedStepIndex) {
      setPicked(previous => [...previous, stepIndex])
      setMessage('')
    } else {
      setMessage('Not yet — think about which step comes next.')
    }
  }

  return (
    <main
      style={{
        maxWidth: 640,
        margin: '30px auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6
      }}
    >
      <h1>{t('student.buddy')}</h1>

      <p>
        Help the Buddy fix:{' '}
        <strong>{localized(mistake.name, 'this mistake')}</strong>.
        {' '}Tap the steps in the correct order.
      </p>

      <p>
        Progress: {picked.length} of {steps.length} steps completed
      </p>

      <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        {order.map(stepIndex => {
          const isPicked = picked.includes(stepIndex)

          return (
            <button
              key={stepIndex}
              type="button"
              onClick={() => choose(stepIndex)}
              disabled={isPicked || finished}
              style={{
                padding: 12,
                textAlign: 'left',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                cursor: isPicked || finished ? 'default' : 'pointer',
                background: isPicked ? '#dcfce7' : 'white'
              }}
            >
              {isPicked ? `${picked.indexOf(stepIndex) + 1}. ` : ''}
              {localized(steps[stepIndex], 'Correction step')}
            </button>
          )
        })}
      </div>

      {message && (
        <p role="status" style={{ color: 'crimson' }}>
          {message}
        </p>
      )}

      {finished && (
        <p role="status" style={{ color: 'green' }}>
          Great! You fixed the Buddy 🎉
        </p>
      )}

      {finished && (
        <p>
          <Link to="/test">
            {t('student.startTest')} →
          </Link>
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <Link to="/learn">← Back to lesson</Link>
      </div>
    </main>
  )
}
