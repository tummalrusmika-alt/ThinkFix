
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getQuestions,
  saveAttempt as saveLocalAttempt,
  getStudentSession
} from '../lib/data'

import { saveAttempt as saveFirebaseAttempt } from '../api'
import { pick, t } from '../lib/i18n'

const workedSolutions = {
  Q1: {
    en: 'The denominators are equal, so keep 4. Add the numerators: 1 + 2 = 3. Answer: 3/4.',
    te: 'హారాలు సమానంగా ఉన్నాయి కాబట్టి 4నే ఉంచాలి. లవాలను కలపాలి: 1 + 2 = 3. సమాధానం: 3/4.',
    hi: 'हर समान हैं, इसलिए 4 ही रहेगा। अंश जोड़ें: 1 + 2 = 3। उत्तर: 3/4。'
  },
  Q2: {
    en: 'Keep the denominator 7 and add the numerators: 3 + 2 = 5. Answer: 5/7.',
    te: 'హారం 7నే ఉంచి లవాలను కలపాలి: 3 + 2 = 5. సమాధానం: 5/7.',
    hi: 'हर 7 ही रहेगा। अंश जोड़ें: 3 + 2 = 5। उत्तर: 5/7।'
  },
  Q3: {
    en: 'The denominators are equal. Add the numerators: 1 + 4 = 5, and keep 6 as the denominator. Answer: 5/6.',
    te: 'హారాలు సమానంగా ఉన్నాయి. లవాలను కలపాలి: 1 + 4 = 5. హారం 6గానే ఉంటుంది. సమాధానం: 5/6.',
    hi: 'हर समान हैं। अंश जोड़ें: 1 + 4 = 5 और हर 6 ही रखें। उत्तर: 5/6।'
  },
  Q4: {
    en: 'Multiply both the numerator and denominator of 1/2 by 2: (1 × 2)/(2 × 2) = 2/4. So 2/4 is equivalent to 1/2.',
    te: '1/2 లో లవాన్ని, హారాన్ని 2తో గుణిస్తే 2/4 వస్తుంది. కాబట్టి 2/4 అనేది 1/2కు సమానమైన భిన్నం.',
    hi: '1/2 के अंश और हर दोनों को 2 से गुणा करें: 2/4 मिलता है। इसलिए 2/4, 1/2 के बराबर है।'
  },
  Q5: {
    en: 'The denominator 3 is multiplied by 2 to become 6. Multiply the numerator 2 by 2 as well: 2/3 = 4/6. Answer: 4.',
    te: 'హారం 3ను 2తో గుణిస్తే 6 వస్తుంది. లవం 2ను కూడా 2తో గుణించాలి: 2/3 = 4/6. సమాధానం: 4.',
    hi: 'हर 3 को 2 से गुणा करके 6 बनाया गया है। अंश 2 को भी 2 से गुणा करें: 2/3 = 4/6। उत्तर: 4।'
  },
  Q6: {
    en: 'Divide both 6 and 8 by their greatest common factor, 2: 6/8 = 3/4. Answer: 3/4.',
    te: '6, 8 రెండింటినీ వాటి గరిష్ఠ సామాన్య కారణాంకం 2తో భాగించాలి: 6/8 = 3/4. సమాధానం: 3/4.',
    hi: '6 और 8 दोनों को उनके महत्तम समापवर्तक 2 से भाग दें: 6/8 = 3/4। उत्तर: 3/4।'
  },
  Q7: {
    en: 'Divide the numerator and denominator by 5: 10/15 = (10 ÷ 5)/(15 ÷ 5) = 2/3. Answer: 2/3.',
    te: 'లవం, హారం రెండింటినీ 5తో భాగించాలి: 10/15 = 2/3. సమాధానం: 2/3.',
    hi: 'अंश और हर दोनों को 5 से भाग दें: 10/15 = 2/3। उत्तर: 2/3।'
  },
  Q8: {
    en: 'Both fractions have numerator 1. When the numerator is the same, the smaller positive denominator gives the larger fraction. Therefore, 1/3 > 1/4.',
    te: 'రెండు భిన్నాల్లో లవం 1. లవాలు సమానంగా ఉన్నప్పుడు చిన్న హారం ఉన్న భిన్నం పెద్దది. కాబట్టి 1/3 > 1/4.',
    hi: 'दोनों भिन्नों का अंश 1 है। समान अंश होने पर छोटा धनात्मक हर बड़ी भिन्न देता है। इसलिए 1/3 > 1/4।'
  },
  Q9: {
    en: 'Use denominator 15: 3/5 = 9/15 and 2/3 = 10/15. Since 10/15 > 9/15, 2/3 is greater.',
    te: 'హారం 15గా మార్చాలి: 3/5 = 9/15, 2/3 = 10/15. 10/15 పెద్దది కాబట్టి 2/3 పెద్దది.',
    hi: 'हर 15 लें: 3/5 = 9/15 और 2/3 = 10/15। क्योंकि 10/15 > 9/15, इसलिए 2/3 बड़ा है।'
  },
  Q10: {
    en: 'These are unit fractions. A larger positive denominator means a smaller piece. Therefore, 1/8 is the smallest.',
    te: 'ఇవి ఏక లవ భిన్నాలు. హారం ఎక్కువైతే ప్రతి భాగం చిన్నదవుతుంది. కాబట్టి 1/8 అతి చిన్నది.',
    hi: 'ये इकाई भिन्न हैं। धनात्मक हर जितना बड़ा होगा, प्रत्येक भाग उतना छोटा होगा। इसलिए 1/8 सबसे छोटा है।'
  },
  T1: {
    en: 'The denominators are equal. Add 2 + 1 = 3 and keep denominator 5. Answer: 3/5.',
    te: 'హారాలు సమానంగా ఉన్నాయి. 2 + 1 = 3 చేసి హారం 5నే ఉంచాలి. సమాధానం: 3/5.',
    hi: 'हर समान हैं। 2 + 1 = 3 करें और हर 5 ही रखें। उत्तर: 3/5।'
  },
  T2: {
    en: 'Multiply both numerator and denominator of 3/4 by 2: 3/4 = 6/8. The missing numerator is 6.',
    te: '3/4లో లవాన్ని, హారాన్ని 2తో గుణిస్తే 6/8 వస్తుంది. కావలసిన లవం 6.',
    hi: '3/4 के अंश और हर दोनों को 2 से गुणा करें: 6/8 मिलता है। लुप्त अंश 6 है।'
  },
  T3: {
    en: 'Divide both 4 and 12 by 4: 4/12 = 1/3. Answer: 1/3.',
    te: '4, 12 రెండింటినీ 4తో భాగించాలి: 4/12 = 1/3. సమాధానం: 1/3.',
    hi: '4 और 12 दोनों को 4 से भाग दें: 4/12 = 1/3। उत्तर: 1/3।'
  },
  T4: {
    en: 'Use denominator 35: 2/5 = 14/35 and 3/7 = 15/35. Since 15/35 > 14/35, 3/7 is greater.',
    te: 'హారం 35గా మార్చాలి: 2/5 = 14/35, 3/7 = 15/35. 15/35 పెద్దది కాబట్టి 3/7 పెద్దది.',
    hi: 'हर 35 लें: 2/5 = 14/35 और 3/7 = 15/35। क्योंकि 15/35 > 14/35, इसलिए 3/7 बड़ा है।'
  },
  T5: {
    en: 'The denominators are equal. Add the numerators: 3 + 4 = 7. Keep denominator 9. Answer: 7/9.',
    te: 'హారాలు సమానంగా ఉన్నాయి. లవాలను కలపాలి: 3 + 4 = 7. హారం 9నే ఉంచాలి. సమాధానం: 7/9.',
    hi: 'हर समान हैं। अंश जोड़ें: 3 + 4 = 7 और हर 9 ही रखें। उत्तर: 7/9।'
  }
}

function getOptionId(option) {
  return typeof option === 'string' ? option : option.id
}

function getOptionText(option) {
  return typeof option === 'string' ? option : pick(option.text)
}

function getLocalized(value) {
  if (!value) return ''
  return typeof value === 'string' ? value : pick(value)
}

function getSolution(questionId) {
  const solution = workedSolutions[questionId]
  return solution ? pick(solution) : ''
}

// Only change: shuffle option order while keeping original option IDs.
function shuffleOptions(options = []) {
  const shuffled = [...options]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export default function Solve() {
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const session = getStudentSession()

      if (
        !session ||
        !(session.studentUid || session.id) ||
        !session.diagnosticRunId
      ) {
        navigate('/join')
        return
      }

      const loaded = getQuestions(session.classId, null, 'diagnostic')

      console.log('STUDENT SESSION:', session)
      console.log('QUESTIONS LOADED:', loaded.length)

      // Shuffle options for every question. Do not change correctOptionId.
      const shuffledQuestions = loaded.map(question => ({
        ...question,
        options: shuffleOptions(question.options || [])
      }))

      setQuestions(shuffledQuestions)
    } catch (err) {
      console.error('Question loading failed:', err)
      setError('Could not load questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  async function handleCheck(event) {
    event.preventDefault()

    if (!selected || feedback || saving) return

    const session = getStudentSession()
    const question = questions[current]
    const studentUid = session?.studentUid || session?.id

    if (!session || !studentUid || !question) {
      setError('Your session or question is missing. Please rejoin the class.')
      return
    }

    const correct = selected === question.correctOptionId

    const correctOption = question.options?.find(
      option => getOptionId(option) === question.correctOptionId
    )

    if (!correctOption) {
      setError('This question has no valid correct answer.')
      return
    }

    const mistakeId = correct
      ? null
      : question.mistakeByOption?.[selected] ?? null

    const attemptData = {
      studentUid,
      runId: session.diagnosticRunId,
      questionId: question.id,
      classId: session.classId,
      selectedOptionId: selected,
      mistakeId,
      isCorrect: correct,
      step: 'solve',
      createdAt: new Date().toISOString()
    }

    setSaving(true)
    setError('')

    try {
      saveLocalAttempt(attemptData)

      try {
        await saveFirebaseAttempt(attemptData)
      } catch (firebaseError) {
        console.warn('Firebase save failed (continuing):', firebaseError)
      }

      setFeedback({
        correct,
        correctAnswer: getOptionText(correctOption),
        explanation: getSolution(question.id)
      })
    } catch (err) {
      console.error('Saving answer failed:', err)
      setError('Your answer could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleContinue() {
    if (current < questions.length - 1) {
      setCurrent(value => value + 1)
      setSelected('')
      setFeedback(null)
      setError('')
    } else {
      navigate('/result')
    }
  }

  if (loading) {
    return (
      <main style={{
        padding: 24,
        background: '#FFFCF5',
        minHeight: '100vh',
        color: '#345B59',
      }}>
        Loading questions...
      </main>
    )
  }

  if (error && questions.length === 0) {
    return (
      <main style={{
        padding: 24,
        background: '#FFFCF5',
        minHeight: '100vh',
        color: '#345B59',
      }}>
        <p role="alert">{error}</p>
        <button onClick={() => navigate('/join')}>Back to Join</button>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main style={{
        padding: 24,
        background: '#FFFCF5',
        minHeight: '100vh',
        color: '#345B59',
      }}>
        <p>No diagnostic questions are available for this class.</p>
        <button onClick={() => navigate('/join')}>Back to Join</button>
      </main>
    )
  }

  const question = questions[current]

  return (
    <main
      style={{
        maxWidth: 680,
        margin: '24px auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        background: '#FFFCF5',
        borderRadius: 20,
        color: '#344F50',
      }}
    >
      <h1 style={{ color: '#477C72' }}>ThinkFix</h1>

      <p style={{ color: '#647B78' }}>{t('student.solve')}</p>

      <p style={{
        color: '#477C72',
        fontWeight: 'bold',
      }}>
        Question {current + 1} of {questions.length}
      </p>

      <div
        style={{
          height: 8,
          background: '#E4EAE8',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 24
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((current + 1) / questions.length) * 100}%`,
            background: '#477C72',
            transition: 'width 0.2s'
          }}
        />
      </div>

      <section style={{
        padding: 20,
        background: '#F0F7F5',
        border: '1px solid #D7E8E3',
        borderRadius: 16,
      }}>
        <h2 style={{ color: '#345B59' }}>
          {getLocalized(question.text)}
        </h2>

        <form onSubmit={handleCheck}>
          {question.options.map(option => {
            const id = getOptionId(option)

            const isRight = feedback && id === question.correctOptionId
            const isWrongSelected =
              feedback && id === selected && !feedback.correct

            return (
              <label
                key={id}
                style={{
                  display: 'block',
                  padding: 14,
                  margin: '10px 0',
                  border: `2px solid ${
                    isRight
                      ? '#16A34A'
                      : isWrongSelected
                        ? '#EF4444'
                        : selected === id
                          ? '#477C72'
                          : '#D7E8E3'
                  }`,
                  borderRadius: 12,
                  background: isRight
                    ? '#DCFCE7'
                    : isWrongSelected
                      ? '#FEE2E2'
                      : selected === id
                        ? '#DDEFEF'
                        : '#FFFFFF',
                  cursor: feedback ? 'default' : 'pointer',
                  color: '#344F50',
                }}
              >
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  value={id}
                  checked={selected === id}
                  disabled={Boolean(feedback) || saving}
                  onChange={() => setSelected(id)}
                />

                {' '}{getOptionText(option)}

                {isRight && (
                  <strong style={{ color: '#15803D' }}>
                    {' '}✓ Correct answer
                  </strong>
                )}

                {isWrongSelected && (
                  <strong style={{ color: '#DC2626' }}>
                    {' '}— Your answer
                  </strong>
                )}
              </label>
            )
          })}

          {error && (
            <p role="alert" style={{ color: '#DC2626' }}>
              {error}
            </p>
          )}

          {!feedback && (
            <button
              type="submit"
              disabled={!selected || saving}
              style={{
                padding: '12px 24px',
                marginTop: 12,
                background: selected && !saving ? '#477C72' : '#CBD5D1',
                color: 'white',
                border: 0,
                borderRadius: 10,
                cursor: selected && !saving ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              {saving ? 'Saving...' : 'Check Answer'}
            </button>
          )}
        </form>
      </section>

      {feedback && (
        <section
          aria-live="polite"
          style={{
            marginTop: 24,
            padding: 18,
            border: `2px solid ${feedback.correct ? '#16A34A' : '#EF4444'}`,
            borderRadius: 14,
            background: feedback.correct ? '#F0FDF4' : '#FFF5F5',
            color: '#344F50',
          }}
        >
          <h2 style={{
            color: feedback.correct ? '#15803D' : '#DC2626',
          }}>
            {feedback.correct
              ? '✓ Correct! Well done.'
              : '✗ Not quite. Let’s understand why.'}
          </h2>

          <p>
            <strong>Correct answer:</strong> {feedback.correctAnswer}
          </p>

          <h3 style={{ color: '#477C72' }}>
            Step-by-step explanation
          </h3>

          {feedback.explanation ? (
            <p>{feedback.explanation}</p>
          ) : (
            <p>A worked explanation has not been added for this question yet.</p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            style={{
              padding: '12px 24px',
              marginTop: 12,
              background: '#477C72',
              color: 'white',
              border: 0,
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {current === questions.length - 1 ? 'View Results' : 'Continue'}
          </button>
        </section>
      )}
    </main>
  )
}
