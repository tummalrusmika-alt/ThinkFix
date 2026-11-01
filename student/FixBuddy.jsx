
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getResolvedFocusMistake, getStudentSession } from '../lib/data'
import { pick, t, getLanguage } from '../lib/i18n'

const extraActivities = {
  M1: [
    [
      'For 1/2 + 1/3, choose 6 as the common denominator.',
      'Change 1/2 into 3/6.',
      'Change 1/3 into 2/6.',
      'Add 3 + 2 and keep denominator 6. The answer is 5/6.'
    ],
    [
      'For 1/4 + 1/2, choose 4 as the common denominator.',
      'Change 1/2 into 2/4.',
      'Add the numerators: 1 + 2 = 3.',
      'Keep denominator 4. The answer is 3/4.'
    ]
  ],

  M2: [
    [
      'Read the addition: 2/7 + 3/7.',
      'Add only the numerators: 2 + 3 = 5.',
      'Keep the common denominator 7.',
      'Write the answer as 5/7.'
    ],
    [
      'Read the addition: 4/9 + 2/9.',
      'Add the numerators: 4 + 2 = 6.',
      'Keep the denominator 9 unchanged.',
      'Write the answer as 6/9.'
    ]
  ],

  M3: [
    [
      'Compare 2/3 and 3/5.',
      'Find the common denominator: 15.',
      'Convert them: 2/3 = 10/15 and 3/5 = 9/15.',
      'Compare 10 and 9. Therefore, 2/3 is greater.'
    ],
    [
      'Compare 3/4 and 5/8.',
      'Choose 8 as the common denominator.',
      'Convert 3/4 into 6/8.',
      'Since 6/8 is greater than 5/8, 3/4 is greater.'
    ]
  ],

  M4: [
    [
      'Simplify the fraction 12/18.',
      'Find the greatest common factor: 6.',
      'Divide both 12 and 18 by 6.',
      'The simplified fraction is 2/3.'
    ],
    [
      'Simplify the fraction 15/25.',
      'Find the greatest common factor: 5.',
      'Divide both 15 and 25 by 5.',
      'The simplified fraction is 3/5.'
    ]
  ],

  M5: [
    [
      'Convert the mixed number 3 2/5.',
      'Multiply the whole number by the denominator: 3 × 5 = 15.',
      'Add the numerator: 15 + 2 = 17.',
      'Keep denominator 5. The answer is 17/5.'
    ],
    [
      'Convert the mixed number 2 3/4.',
      'Multiply the whole number by the denominator: 2 × 4 = 8.',
      'Add the numerator: 8 + 3 = 11.',
      'Keep denominator 4. The answer is 11/4.'
    ]
  ]
}

function shuffle(items) {
  const result = [...items]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

export default function FixBuddy() {
  const navigate = useNavigate()
  const language = getLanguage()

  const [mistake] = useState(() =>
    getStudentSession() ? getResolvedFocusMistake(true) : null
  )

  const rawSteps = Array.isArray(mistake?.buddySteps)
    ? mistake.buddySteps
    : mistake?.buddySteps?.[language] || mistake?.buddySteps?.en || []

  const originalSteps = rawSteps.map(step => pick(step, language)).filter(Boolean)

  const mistakeId = String(mistake?.id || '').toUpperCase()
  const activities = [
    originalSteps,
    ...(extraActivities[mistakeId] || [])
  ].filter(activity => activity.length > 0)

  const [activityIndex, setActivityIndex] = useState(0)
  const [order, setOrder] = useState([])
  const [completed, setCompleted] = useState([])
  const [message, setMessage] = useState('')

  const steps = activities[activityIndex] || []
  const finished = steps.length > 0 && completed.length === steps.length

  useEffect(() => {
    setOrder(shuffle(steps.map((_, index) => index)))
    setCompleted([])
    setMessage('')
  }, [activityIndex, mistakeId])

  function choose(stepIndex) {
    if (finished || completed.includes(stepIndex)) return

    if (stepIndex === completed.length) {
      setCompleted(previous => [...previous, stepIndex])
      setMessage('')
    } else {
      setMessage('Not yet! Think about the correct order and try again.')
    }
  }

  function nextActivity() {
    setActivityIndex(previous => previous + 1)
  }

  if (!mistake) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <h1>{t('student.buddy')}</h1>
          <p>Please join your class and complete the Solve questions first.</p>
          <button style={styles.primaryButton} onClick={() => navigate('/join')}>
            Go to Join →
          </button>
        </section>
      </main>
    )
  }

  if (activities.length === 0) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <h1>{t('student.buddy')}</h1>
          <p>No correction activities are available for this mistake yet.</p>
          <Link to="/learn">Return to lesson</Link>
        </section>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link to="/learn" style={styles.backLink}>← Back to lesson</Link>

        <section style={styles.hero}>
          <div>
            <span style={styles.eyebrow}>YOUR LEARNING MISSION</span>
            <h1 style={styles.heading}>{t('student.buddy')}</h1>
            <p>Every mistake is a chance to learn something new!</p>
          </div>
          <div style={styles.buddy}>🧩</div>
        </section>

        <section style={styles.card}>
          <span style={styles.eyebrow}>TODAY'S MISSION</span>
          <h2>{pick(mistake.name, language) || mistake.title}</h2>
          <p>Activity {activityIndex + 1} of {activities.length}</p>
          <p>Tap the correction steps in the correct order.</p>
        </section>

        <section style={styles.card}>
          <div style={styles.progressTop}>
            <strong>Your progress</strong>
            <strong>{completed.length} / {steps.length}</strong>
          </div>

          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${steps.length ? completed.length / steps.length * 100 : 0}%`
              }}
            />
          </div>
        </section>

        <section style={styles.card}>
          <h2>✨ Fix the steps</h2>
          <p>Find the right order to help your Buddy.</p>

          <div style={styles.steps}>
            {order.map((stepIndex, position) => {
              const isCompleted = completed.includes(stepIndex)

              return (
                <button
                  key={`${activityIndex}-${stepIndex}`}
                  type="button"
                  disabled={isCompleted || finished}
                  onClick={() => choose(stepIndex)}
                  style={{
                    ...styles.stepButton,
                    background: isCompleted ? '#DDEFEF' : '#EAF1FA',
                    borderColor: isCompleted ? '#91C8BC' : '#D9E2EA'
                  }}
                >
                  <span style={styles.stepNumber}>
                    {isCompleted ? '✓' : '○'}
                  </span>
                  <span>{steps[stepIndex]}</span>
                </button>
              )
            })}
          </div>
        </section>

        {message && (
          <p role="status" style={styles.message}>💡 {message}</p>
        )}

        {finished && (
          <section style={styles.success}>
            <h2>🎉 Well done!</h2>
            <p>You completed Activity {activityIndex + 1} successfully.</p>

            {activityIndex < activities.length - 1 ? (
              <button style={styles.primaryButton} onClick={nextActivity}>
                Next Activity →
              </button>
            ) : (
              <>
                <p>You completed all {activities.length} Buddy activities!</p>
                <button
                  style={styles.primaryButton}
                  onClick={() => navigate('/test')}
                >
                  {t('student.startTest')} →
                </button>
              </>
            )}
          </section>
        )}

        <footer style={styles.footer}>
          💚 Remember: mistakes help your brain grow!
        </footer>
      </div>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FFFCF5',
    padding: '28px 18px 45px',
    fontFamily: 'Arial, sans-serif',
    color: '#344B59',
    boxSizing: 'border-box'
  },
  container: {
    maxWidth: 680,
    margin: '0 auto'
  },
  backLink: {
    display: 'inline-block',
    color: '#527C83',
    textDecoration: 'none',
    fontWeight: 700,
    marginBottom: 20
  },
  hero: {
    background: 'linear-gradient(120deg, #DCEBFA, #DDEFEF)',
    borderRadius: 25,
    padding: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.2,
    color: '#527C83'
  },
  heading: {
    fontSize: 30,
    margin: '9px 0',
    color: '#294E5B'
  },
  buddy: {
    fontSize: 55,
    background: '#FFFFFFAA',
    borderRadius: 20,
    padding: 12
  },
  card: {
    background: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    border: '1px solid #E9E5D9',
    marginBottom: 18,
    boxShadow: '0 4px 15px #5B6B7310'
  },
  progressTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  progressTrack: {
    height: 12,
    background: '#EDF0E9',
    borderRadius: 20,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #A8D8CB, #78BDAA)',
    borderRadius: 20,
    transition: 'width 0.3s ease'
  },
  steps: {
    display: 'grid',
    gap: 12
  },
  stepButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textAlign: 'left',
    padding: 17,
    borderRadius: 15,
    border: '2px solid',
    color: '#344B59',
    fontSize: 15,
    lineHeight: 1.5,
    cursor: 'pointer'
  },
  stepNumber: {
    minWidth: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: '#FFFFFF',
    fontWeight: 800
  },
  message: {
    background: '#FFF0BD',
    padding: 15,
    borderRadius: 12
  },
  success: {
    background: '#DDEFEF',
    padding: 22,
    borderRadius: 20,
    textAlign: 'center',
    marginTop: 18
  },
  primaryButton: {
    background: '#527F78',
    color: '#FFFFFF',
    border: 0,
    borderRadius: 12,
    padding: '13px 20px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 10
  },
  footer: {
    textAlign: 'center',
    color: '#71847D',
    marginTop: 25,
    fontSize: 13
  }
}
