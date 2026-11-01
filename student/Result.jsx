
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getStudentSession,
  getStudentAttempts,
  setFocusMistake,
  getMistakeById,
} from '../lib/data'

import { speak, t, pick } from '../lib/i18n'

export default function Result() {
  const navigate = useNavigate()
  const [mistake, setMistake] = useState(null)
  const [answered, setAnswered] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const session = getStudentSession()

      if (!session?.studentUid) {
        navigate('/join', { replace: true })
        return
      }

      let attempts = getStudentAttempts(session.studentUid).filter(
        attempt => attempt.step === 'solve'
      )

      // Prefer the current run; fall back to all solve attempts.
      const currentRun = attempts.filter(
        attempt => attempt.runId === session.diagnosticRunId
      )
      if (currentRun.length > 0) attempts = currentRun

      setAnswered(attempts.length)

      const counts = {}
      const countedQuestions = new Set()

      for (const attempt of attempts) {
        if (
          attempt.isCorrect === false &&
          attempt.mistakeId &&
          !countedQuestions.has(attempt.questionId)
        ) {
          countedQuestions.add(attempt.questionId)
          counts[attempt.mistakeId] =
            (counts[attempt.mistakeId] || 0) + 1
        }
      }

      const ids = Object.keys(counts)

      if (ids.length === 0) {
        setMistake(null)
        return
      }

      const highest = Math.max(...ids.map(id => counts[id]))

      const mainMistakeId = ids
        .filter(id => counts[id] === highest)
        .sort()[0]

      const mainMistake = getMistakeById(mainMistakeId)

      setMistake(mainMistake)

      if (mainMistake) {
        setFocusMistake(mainMistake.id)
      }
    } catch (err) {
      console.error('Could not load results:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.emptyCard}>
          <div style={styles.emoji}>📊</div>
          <h2 style={styles.heading}>Loading results...</h2>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main style={styles.page}>
        <section style={styles.emptyCard}>
          <div style={styles.emoji}>⚠️</div>
          <h1 style={styles.heading}>{t('student.result')}</h1>
          <p style={styles.text}>We could not load your results. Please try again.</p>
          <button style={styles.primaryButton} onClick={() => window.location.reload()}>
            Retry
          </button>{' '}
          <button style={styles.secondaryButton} onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </button>
        </section>
      </main>
    )
  }

  if (!mistake) {
    return (
      <main style={styles.page}>
        <section style={styles.emptyCard}>
          <div style={styles.emoji}>🌟</div>
          <h1 style={styles.heading}>{t('student.result')}</h1>

          {answered === 0 ? (
            <>
              <h2 style={styles.subheading}>No answers yet</h2>
              <p style={styles.text}>Please answer the Solve questions first.</p>
              <button style={styles.primaryButton} onClick={() => navigate('/solve')}>
                Go to Solve →
              </button>
            </>
          ) : (
            <>
              <h2 style={styles.subheading}>Great job! 🎉</h2>
              <p style={styles.text}>
                No mistake pattern was found in your answers. Try the test to
                challenge yourself.
              </p>
              <button style={styles.primaryButton} onClick={() => navigate('/test')}>
                Take the Test →
              </button>
            </>
          )}

          <div style={{ marginTop: 18 }}>
            <button
              style={styles.secondaryButton}
              onClick={() => navigate('/student/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </section>
      </main>
    )
  }

  const name = pick(mistake.name) || mistake.title || mistake.id
  const explanation = pick(mistake.explanation) || mistake.description || ''
  const hint = pick(mistake.hint) || mistake.correction || ''

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        <header style={styles.header}>
          <span style={styles.headerTag}>THINKFIX</span>
          <span style={styles.headerEmoji}>📊</span>
        </header>

        <section style={styles.hero}>
          <span style={styles.eyebrow}>YOUR LEARNING REPORT</span>
          <h1 style={styles.heroTitle}>{t('student.result')}</h1>
          <p style={styles.heroText}>
            Your answers help us understand how you think.
            Let's explore what we discovered!
          </p>
          <div style={styles.heroDecoration}>✨</div>
        </section>

        <section style={styles.mistakeCard}>
          <div style={styles.mistakeIcon}>🔍</div>
          <div>
            <span style={styles.smallLabel}>YOUR MAIN MISTAKE</span>
            <h2 style={styles.mistakeTitle}>{name}</h2>
          </div>
        </section>

        <section style={styles.explanationCard}>
          <div style={styles.cardHeadingRow}>
            <span style={styles.cardIcon}>🧠</span>
            <h3 style={styles.cardTitle}>Why this happened</h3>
          </div>
          <p style={styles.bodyText}>{explanation}</p>
        </section>

        <section style={styles.hintCard}>
          <div style={styles.cardHeadingRow}>
            <span style={styles.cardIcon}>💡</span>
            <h3 style={styles.cardTitle}>How to correct it</h3>
          </div>
          <p style={styles.bodyText}>{hint}</p>
        </section>

        <section style={styles.listenCard}>
          <div>
            <h3 style={styles.cardTitle}>Want to hear the explanation?</h3>
            <p style={styles.muted}>Listen and understand it at your own pace.</p>
          </div>

          <button
            onClick={() => speak(`${name}. ${explanation}. ${hint}`)}
            style={styles.listenButton}
          >
            🔊 Listen
          </button>
        </section>

        <section style={styles.actionCard}>
          <div style={styles.actionEmoji}>🌱</div>
          <h2 style={styles.actionTitle}>Ready to improve?</h2>
          <p style={styles.actionDescription}>
            Visit your lesson to understand this concept and learn how to fix it.
          </p>

          <button
            onClick={() => navigate('/learn')}
            style={styles.primaryButton}
          >
            Learn how to fix it →
          </button>
        </section>

        <footer style={styles.footer}>
          💚 Don't just mark the mistake. Understand it.
        </footer>

      </div>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FFFCF5',
    padding: '27px 18px 45px',
    fontFamily: 'Arial, sans-serif',
    color: '#344B59',
    boxSizing: 'border-box'
  },

  container: {
    maxWidth: 680,
    margin: '0 auto'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22
  },

  headerTag: {
    background: '#E4EDC9',
    color: '#58704B',
    borderRadius: 20,
    padding: '8px 13px',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1
  },

  headerEmoji: {
    fontSize: 25,
    background: '#E8E2FA',
    padding: 9,
    borderRadius: 13
  },

  hero: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(120deg, #DCEBFA, #DDEFEF)',
    border: '1px solid #D0E5E8',
    borderRadius: 24,
    padding: '28px 24px',
    marginBottom: 20
  },

  eyebrow: {
    color: '#64858A',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.4
  },

  heroTitle: {
    color: '#294E5B',
    fontSize: 30,
    margin: '8px 0'
  },

  heroText: {
    color: '#526E78',
    fontSize: 14,
    lineHeight: 1.8,
    maxWidth: 490,
    margin: 0
  },

  heroDecoration: {
    position: 'absolute',
    right: 22,
    bottom: 12,
    fontSize: 36,
    opacity: 0.6
  },

  mistakeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 15,
    background: '#FFFFFF',
    border: '1px solid #E9E5D9',
    borderRadius: 19,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0 4px 14px #5B6B730D'
  },

  mistakeIcon: {
    background: '#FFF0BD',
    borderRadius: 15,
    padding: 14,
    fontSize: 28
  },

  smallLabel: {
    fontSize: 10,
    color: '#9B8247',
    fontWeight: 800,
    letterSpacing: 1.2
  },

  mistakeTitle: {
    color: '#344B59',
    fontSize: 19,
    margin: '5px 0'
  },

  explanationCard: {
    background: '#FFFFFF',
    border: '1px solid #DCE7F0',
    borderLeft: '5px solid #A8C9E6',
    borderRadius: 17,
    padding: 20,
    marginBottom: 14
  },

  hintCard: {
    background: '#FFF0BD',
    border: '1px solid #F0DFA8',
    borderRadius: 17,
    padding: 20,
    marginBottom: 14
  },

  cardHeadingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },

  cardIcon: {
    fontSize: 22
  },

  cardTitle: {
    color: '#405967',
    fontSize: 16,
    margin: 0
  },

  bodyText: {
    color: '#536873',
    fontSize: 14,
    lineHeight: 1.8,
    margin: 0
  },

  listenCard: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
    background: '#E8E2FA',
    border: '1px solid #D8CEF1',
    borderRadius: 17,
    padding: 19,
    marginTop: 5
  },

  muted: {
    color: '#7D8990',
    fontSize: 12,
    margin: '5px 0 0'
  },

  listenButton: {
    background: '#FFFFFF',
    color: '#527C83',
    border: '1px solid #C8DDE0',
    borderRadius: 11,
    padding: '11px 16px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer'
  },

  actionCard: {
    textAlign: 'center',
    background: 'linear-gradient(120deg, #E4EDC9, #DDEFEF)',
    border: '1px solid #CFE1CC',
    borderRadius: 21,
    padding: '25px 20px',
    marginTop: 20
  },

  actionEmoji: {
    fontSize: 42
  },

  actionTitle: {
    color: '#426B5C',
    fontSize: 21,
    margin: '8px 0'
  },

  actionDescription: {
    color: '#637C70',
    fontSize: 13,
    lineHeight: 1.7,
    margin: '0 auto 18px',
    maxWidth: 440
  },

  primaryButton: {
    background: '#527F83',
    color: '#FFFFFF',
    border: 0,
    borderRadius: 11,
    padding: '13px 20px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer'
  },

  secondaryButton: {
    background: '#FFFFFF',
    color: '#527C83',
    border: '1px solid #C8DDE0',
    borderRadius: 11,
    padding: '13px 18px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer'
  },

  emptyCard: {
    maxWidth: 520,
    margin: '65px auto',
    padding: 30,
    textAlign: 'center',
    background: '#FFFFFF',
    border: '1px solid #E9E5D9',
    borderRadius: 22,
    boxShadow: '0 5px 20px #5B6B7310'
  },

  emoji: {
    fontSize: 45
  },

  heading: {
    color: '#345967',
    fontSize: 23
  },

  subheading: {
    color: '#426B5C',
    fontSize: 21
  },

  text: {
    color: '#71818A',
    fontSize: 14,
    lineHeight: 1.7
  },

  primaryButtonEmpty: {
    background: '#527F83',
    color: '#FFFFFF'
  },

  footer: {
    textAlign: 'center',
    color: '#81918D',
    fontSize: 12,
    padding: '25px 10px 5px'
  }
}
