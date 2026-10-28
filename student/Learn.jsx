
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMistakes, getFocusMistake } from '../lib/data'
import { pick, speak, t } from '../lib/i18n'

function localized(value, fallback = '') {
  if (value == null) return fallback

  // Support both localized objects and plain strings.
  if (typeof value === 'string') return value

  return pick(value) || fallback
}

export default function Learn() {
  const navigate = useNavigate()

  // Show only the mistake selected by the diagnostic result.
  // Do not silently display an unrelated mistake as a fallback.
  const mistake = useMemo(() => {
    const all = getMistakes() || []
    const focusId = getFocusMistake()

    if (!focusId) return null

    return all.find(item => item.id === focusId) || null
  }, [])

  if (!mistake) {
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
        <h1>{t('student.learn')}</h1>

        <p>
          No focused mistake was found. Please complete the diagnostic
          first so ThinkFix can choose the correct lesson for you.
        </p>

        <button
          type="button"
          onClick={() => navigate('/join')}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          Start diagnostic
        </button>
      </main>
    )
  }

  const name = localized(mistake.name, 'Learning from mistakes')
  const explanation = localized(mistake.explanation)
  const example = localized(
    mistake.example,
    'Review this example with your teacher.'
  )
  const hint = localized(mistake.hint)

  const buddySteps = Array.isArray(mistake.buddySteps)
    ? mistake.buddySteps.map(step => localized(step)).filter(Boolean)
    : []

  function listenToLesson() {
    const text = [
      name,
      explanation,
      example,
      hint,
      ...buddySteps
    ]
      .filter(Boolean)
      .join('. ')

    if (text) {
      speak(text)
    }
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '30px auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6
      }}
    >
      <h1>{t('student.learn')}</h1>

      <h2>{name}</h2>

      {explanation && <p>{explanation}</p>}

      <section
        style={{
          padding: 20,
          background: '#f0fdf4',
          borderRadius: 12,
          marginTop: 20
        }}
      >
        <strong>{t('student.example')}</strong>
        <p>{example}</p>
      </section>

      {hint && (
        <section style={{ marginTop: 20 }}>
          <h3>{t('student.hint')}</h3>
          <p>{hint}</p>
        </section>
      )}

      {buddySteps.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h3>Steps to fix the mistake</h3>

          <ol>
            {buddySteps.map((step, index) => (
              <li key={`${mistake.id}-step-${index}`}>
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      <button
        type="button"
        onClick={listenToLesson}
        disabled={
          !name &&
          !explanation &&
          !example &&
          !hint &&
          buddySteps.length === 0
        }
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          cursor: 'pointer'
        }}
      >
        🔊 {t('student.listen')}
      </button>

      <div style={{ marginTop: 24 }}>
        <Link to="/buddy">
          {t('student.tryBuddy')} →
        </Link>
      </div>
    </main>
  )
}
