
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  getStudentSession,
  getStudentAttempts,
  setFocusMistake
} from '../lib/data'
import { pick, speak, t } from '../lib/i18n'
import mistakes from '../../data/mistakes.json'

export default function Result() {
  const navigate = useNavigate()
  const [mistake, setMistake] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    function loadResult() {
      try {
        const session = getStudentSession()

        if (!session?.studentUid) {
          navigate('/join', { replace: true })
          return
        }

        const allAttempts = getStudentAttempts(session.studentUid) || []

        // Use only attempts from the current diagnostic run.
        // If the run ID is missing, do not mix attempts from
        // different runs together.
        const diagnosticRunId = session.diagnosticRunId

        if (!diagnosticRunId) {
          if (!cancelled) {
            setMistake(null)
          }
          return
        }

        const attempts = allAttempts.filter(
          attempt =>
            attempt.step === 'solve' &&
            attempt.runId === diagnosticRunId
        )

        const validMistakeIds = new Set(
          mistakes.map(item => item.id)
        )

        const counts = {}
const countedQuestions = new Set()

for (const attempt of attempts) {
  const mistakeId = attempt.mistakeId
  const questionId = attempt.questionId

  if (
    attempt.isCorrect === false &&
    questionId &&
    mistakeId &&
    validMistakeIds.has(mistakeId) &&
    !countedQuestions.has(questionId)
  ) {
    countedQuestions.add(questionId)
    counts[mistakeId] = (counts[mistakeId] || 0) + 1
  }
}

        const highestCount = Math.max(
          0,
          ...Object.values(counts)
        )

        if (highestCount === 0) {
          if (!cancelled) {
            setMistake(null)
          }
          return
        }

        // Deterministic tie-break: choose the alphabetically
        // first ID when multiple mistakes have equal counts.
        const mainMistakeId = Object.keys(counts)
          .filter(id => counts[id] === highestCount)
          .sort()[0]

        const mainMistake =
          mistakes.find(item => item.id === mainMistakeId) || null

        if (!cancelled) {
          setMistake(mainMistake)

          if (mainMistake) {
            setFocusMistake(mainMistakeId)
          }
        }
      } catch (err) {
        console.error('Could not load results:', err)

        if (!cancelled) {
          setError(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadResult()

    return () => {
      cancelled = true
    }
  }, [navigate])

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Loading results...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{ maxWidth: 640, margin: '30px auto', padding: 24 }}>
        <h1>{t('student.result')}</h1>
        <p>We could not load your results. Please try again.</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
        <button onClick={() => navigate('/join')}>
          Start again
        </button>
      </main>
    )
  }

  if (!mistake) {
    return (
      <main style={{ maxWidth: 640, margin: '30px auto', padding: 24 }}>
        <h1>{t('student.result')}</h1>
        <h2>No linked mistake found</h2>
        <p>
          You may have answered all questions correctly, or no valid
          mistake was recorded for this diagnostic run.
        </p>

        <button onClick={() => navigate('/test')}>
          Try a challenge
        </button>

        <button onClick={() => navigate('/fingerprint')}>
          {t('student.fingerprint')}
        </button>
      </main>
    )
  }

  const explanation = pick(mistake.explanation)
  const hint = pick(mistake.hint)
  const example = pick(mistake.example)

  return (
    <main style={{ maxWidth: 640, margin: '30px auto', padding: 24 }}>
      <h1>{t('student.result')}</h1>

      <h2>
        {t('student.mainMistake')}: {pick(mistake.name)}
      </h2>

      <h3>{t('student.why')}</h3>
      <p>{explanation}</p>

      <h3>Correct working</h3>
      <p>{example || 'Review the worked example in your lesson.'}</p>

      <h3>{t('student.hint')}</h3>
      <p>{hint}</p>

      <button
        onClick={() => speak(`${explanation}. ${hint}`)}
        disabled={!explanation && !hint}
      >
        🔊 {t('student.listen')}
      </button>

      <button
        onClick={() => navigate('/learn')}
        style={{
          padding: '12px 20px',
          background: '#2563eb',
          color: 'white',
          border: 0,
          borderRadius: 8,
          marginTop: 16,
          marginLeft: 8,
          cursor: 'pointer'
        }}
      >
        Learn how to fix it →
      </button>
    </main>
  )
}
