
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getQuestions,
  saveAttempt,
  getStudentSession,
  getFocusMistake
} from '../lib/data'
import { getNextStep } from '../lib/nextStep'
import { pick, t } from '../lib/i18n'

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function Test() {
  const navigate = useNavigate()
  const [testRunId] = useState(() => createId())
  const savingRef = useRef(false)

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState('')
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    try {
      const session = getStudentSession()

      if (!session?.studentUid) {
        navigate('/join', { replace: true })
        return
      }

      let pool = getQuestions(session.classId, null, 'test')

      if (pool.length < 3) {
        pool = getQuestions(
          session.classId,
          null,
          'test',
          { excludeSeen: false }
        )
      }

      const focus = getFocusMistake()

      const sorted = [...pool].sort(
        (a, b) =>
          Number(b.targetMistake === focus) -
          Number(a.targetMistake === focus)
      )

      if (!cancelled) {
        setQuestions(sorted.slice(0, 3))
      }
    } catch (err) {
      console.error('Could not load test questions:', err)

      if (!cancelled) {
        setError('Could not load the test. Please try again.')
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }

    return () => {
      cancelled = true
    }
  }, [navigate])

  function retryTest() {
    window.location.reload()
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>{t('student.loading')}</p>
      </main>
    )
  }

  if (error && questions.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <h1>{t('student.test')}</h1>
        <p role="alert" style={{ color: 'crimson' }}>{error}</p>

        <button type="button" onClick={retryTest}>
          Retry
        </button>

        <button type="button" onClick={() => navigate('/join')}>
          Start again
        </button>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <h1>{t('student.test')}</h1>
        <p>{t('student.noQuestions')}</p>
        <Link to="/learn">Return to lesson</Link>
      </main>
    )
  }

  if (done) {
    const score = Math.round(
      (correctCount / questions.length) * 100
    )

    const next = getNextStep(score)

    const targets = {
      relearn: '/learn',
      practise: '/solve',
      challenge: '/fingerprint'
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
        <h1>{t('student.test')}</h1>

        <h2>
          {t('student.score')}: {correctCount}/{questions.length} ({score}%)
        </h2>

        <p>{t(`student.step.${next}`)}</p>
        <Link to={targets[next]}>{t('student.next')} →</Link>

        <p style={{ marginTop: 20 }}>
          <Link to="/fingerprint">
            {t('student.viewFingerprint')} →
          </Link>
        </p>
      </main>
    )
  }

  const question = questions[current]

  if (!question) {
    return (
      <main style={{ padding: 24 }}>
        <h1>{t('student.test')}</h1>
        <p role="alert">The current question could not be loaded.</p>
        <button type="button" onClick={() => navigate('/learn')}>
          Return to lesson
        </button>
      </main>
    )
  }

  const options = Array.isArray(question.options)
    ? question.options
    : []

  const correctOption = options.find(
    option => option.id === question.correctOptionId
  )

  function handleNext() {
    if (savingRef.current) return

    if (!answered) {
      if (!selected) {
        setError('Please select an answer.')
        return
      }

      if (options.length === 0) {
        setError('This question has no answer options.')
        return
      }

      const session = getStudentSession()

      if (!session?.studentUid) {
        navigate('/join', { replace: true })
        return
      }

      const isCorrect = selected === question.correctOptionId

      savingRef.current = true
      setError('')

      try {
        saveAttempt({
          studentUid: session.studentUid,
          runId: testRunId,
          questionId: question.id,
          selectedOptionId: selected,
          mistakeId: isCorrect
            ? null
            : question.mistakeByOption?.[selected] ?? null,
          isCorrect,
          step: 'test',
          createdAt: new Date().toISOString()
        })

        if (isCorrect) {
          setCorrectCount(count => count + 1)
        }

        setFeedback({
          isCorrect,
          correctAnswer: correctOption
            ? pick(correctOption.text)
            : question.correctOptionId
        })

        setAnswered(true)
      } catch (err) {
        console.error('Could not save test attempt:', err)
        setError('Could not save your answer. Please try again.')
      } finally {
        savingRef.current = false
      }

      return
    }

    if (current < questions.length - 1) {
      setCurrent(index => index + 1)
      setSelected('')
      setAnswered(false)
      setFeedback(null)
      setError('')
    } else {
      setDone(true)
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
      <h1>{t('student.test')}</h1>

      <p>Question {current + 1} of {questions.length}</p>
      <h2>{pick(question.text)}</h2>

      {options.length === 0 ? (
        <section>
          <p role="alert">
            No answer options are available for this question.
          </p>
          <button
            type="button"
            onClick={() => {
              if (current < questions.length - 1) {
                setCurrent(index => index + 1)
                setSelected('')
                setAnswered(false)
                setFeedback(null)
                setError('')
              } else {
                setDone(true)
              }
            }}
          >
            {current === questions.length - 1
              ? t('student.finish')
              : t('student.next')}
          </button>
        </section>
      ) : (
        <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
          {options.map(option => {
            const isSelected = selected === option.id
            const isCorrectOption =
              answered && option.id === question.correctOptionId
            const isWrongSelection =
              answered && isSelected && !feedback?.isCorrect

            return (
              <button
                key={option.id}
                type="button"
                disabled={answered}
                onClick={() => {
                  setSelected(option.id)
                  setError('')
                }}
                style={{
                  padding: 12,
                  textAlign: 'left',
                  border: isCorrectOption
                    ? '2px solid #16a34a'
                    : isWrongSelection
                      ? '2px solid #dc2626'
                      : isSelected
                        ? '2px solid #2563eb'
                        : '1px solid #ccc',
                  borderRadius: 8,
                  background: isCorrectOption
                    ? '#dcfce7'
                    : isWrongSelection
                      ? '#fee2e2'
                      : isSelected
                        ? '#eff6ff'
                        : '#fff',
                  cursor: answered ? 'default' : 'pointer'
                }}
              >
                {pick(option.text)}
              </button>
            )
          })}

          {error && (
            <p role="alert" style={{ color: 'crimson' }}>{error}</p>
          )}

          {feedback && (
            <section
              aria-live="polite"
              style={{
                marginTop: 8,
                padding: 16,
                borderRadius: 8,
                background: feedback.isCorrect ? '#f0fdf4' : '#fef2f2'
              }}
            >
              <h3>
                {feedback.isCorrect ? 'Correct! 🎉' : 'Not quite yet.'}
              </h3>

              {!feedback.isCorrect && (
                <p>
                  Correct answer: <strong>{feedback.correctAnswer}</strong>
                </p>
              )}
            </section>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={savingRef.current}
            style={{
              marginTop: 16,
              padding: '12px 24px',
              border: 0,
              borderRadius: 8,
              background: '#2563eb',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {!answered
              ? 'Check answer'
              : current === questions.length - 1
                ? t('student.finish')
                : t('student.next')}
          </button>
        </div>
      )}
    </main>
  )
}
