
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getQuestions,
  saveAttempt,
  getStudentSession
} from '../lib/data'
import { pick, t } from '../lib/i18n'

const workedSolutions = {
  Q1: {
    en: 'The denominators are equal, so keep 4. Add the numerators: 1 + 2 = 3. Answer: 3/4.',
    te: 'హారాలు సమానంగా ఉన్నాయి కాబట్టి 4నే ఉంచాలి. లవాలను కలపాలి: 1 + 2 = 3. సమాధానం: 3/4.',
    hi: 'हर समान हैं, इसलिए 4 ही रहेगा। अंश जोड़ें: 1 + 2 = 3। उत्तर: 3/4।'
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
    en: 'Multiply both the numerator and denominator of 1/2 by 2: 2/4 is equivalent to 1/2.',
    te: '1/2 లో లవాన్ని, హారాన్ని 2తో గుణిస్తే 2/4 వస్తుంది. కాబట్టి 2/4 అనేది 1/2కు సమానమైన భిన్నం.',
    hi: '1/2 के अंश और हर दोनों को 2 से गुणा करें: 2/4 मिलता है। इसलिए 2/4, 1/2 के बराबर है।'
  },
  Q5: {
    en: 'Multiply the numerator and denominator of 2/3 by 2: 2/3 = 4/6. Answer: 4.',
    te: 'హారం 3ను 2తో గుణిస్తే 6 వస్తుంది. లవం 2ను కూడా 2తో గుణించాలి: 2/3 = 4/6. సమాధానం: 4.',
    hi: 'हर 3 को 2 से गुणा करके 6 बनाया गया है। अंश 2 को भी 2 से गुणा करें: 2/3 = 4/6। उत्तर: 4।'
  },
  Q6: {
    en: 'Divide both 6 and 8 by 2: 6/8 = 3/4.',
    te: '6, 8 రెండింటినీ 2తో భాగించాలి: 6/8 = 3/4.',
    hi: '6 और 8 दोनों को 2 से भाग दें: 6/8 = 3/4।'
  },
  Q7: {
    en: 'Divide the numerator and denominator by 5: 10/15 = 2/3.',
    te: 'లవం, హారం రెండింటినీ 5తో భాగించాలి: 10/15 = 2/3.',
    hi: 'अंश और हर दोनों को 5 से भाग दें: 10/15 = 2/3।'
  },
  Q8: {
    en: 'Both fractions have numerator 1. The smaller positive denominator gives the larger fraction, so 1/3 > 1/4.',
    te: 'రెండు భిన్నాల్లో లవం 1. లవాలు సమానంగా ఉన్నప్పుడు చిన్న హారం ఉన్న భిన్నం పెద్దది. కాబట్టి 1/3 > 1/4.',
    hi: 'दोनों भिन्नों का अंश 1 है। समान अंश होने पर छोटा धनात्मक हर बड़ी भिन्न देता है। इसलिए 1/3 > 1/4।'
  },
  Q9: {
    en: 'Use denominator 15: 3/5 = 9/15 and 2/3 = 10/15. Therefore, 2/3 is greater.',
    te: 'హారం 15గా మార్చాలి: 3/5 = 9/15, 2/3 = 10/15. కాబట్టి 2/3 పెద్దది.',
    hi: 'हर 15 लें: 3/5 = 9/15 और 2/3 = 10/15। इसलिए 2/3 बड़ा है।'
  },
  Q10: {
    en: 'These are unit fractions. A larger positive denominator means a smaller piece, so 1/8 is the smallest.',
    te: 'ఇవి ఏక లవ భిన్నాలు. హారం ఎక్కువైతే ప్రతి భాగం చిన్నదవుతుంది. కాబట్టి 1/8 అతి చిన్నది.',
    hi: 'ये इकाई भिन्न हैं। धनात्मक हर जितना बड़ा होगा, प्रत्येक भाग उतना छोटा होगा। इसलिए 1/8 सबसे छोटा है।'
  },
  T1: {
    en: 'Add 2 + 1 = 3 and keep denominator 5. Answer: 3/5.',
    te: '2 + 1 = 3 చేసి హారం 5నే ఉంచాలి. సమాధానం: 3/5.',
    hi: '2 + 1 = 3 करें और हर 5 ही रखें। उत्तर: 3/5।'
  },
  T2: {
    en: 'Multiply the numerator and denominator of 3/4 by 2: 3/4 = 6/8.',
    te: '3/4లో లవాన్ని, హారాన్ని 2తో గుణిస్తే 6/8 వస్తుంది.',
    hi: '3/4 के अंश और हर दोनों को 2 से गुणा करें: 6/8 मिलता है।'
  },
  T3: {
    en: 'Divide both 4 and 12 by 4: 4/12 = 1/3.',
    te: '4, 12 రెండింటినీ 4తో భాగించాలి: 4/12 = 1/3.',
    hi: '4 और 12 दोनों को 4 से भाग दें: 4/12 = 1/3।'
  },
  T4: {
    en: 'Use denominator 35: 2/5 = 14/35 and 3/7 = 15/35. Therefore, 3/7 is greater.',
    te: 'హారం 35గా మార్చాలి: 2/5 = 14/35, 3/7 = 15/35. కాబట్టి 3/7 పెద్దది.',
    hi: 'हर 35 लें: 2/5 = 14/35 और 3/7 = 15/35। इसलिए 3/7 बड़ा है।'
  },
  T5: {
    en: 'Add the numerators: 3 + 4 = 7 and keep denominator 9. Answer: 7/9.',
    te: 'లవాలను కలపాలి: 3 + 4 = 7. హారం 9నే ఉంచాలి. సమాధానం: 7/9.',
    hi: 'अंश जोड़ें: 3 + 4 = 7 और हर 9 ही रखें। उत्तर: 7/9।'
  }
}

function getOptionId(option) {
  return typeof option === 'string' ? option : option?.id
}

function getOptionText(option) {
  if (typeof option === 'string') return option
  return getLocalized(option?.text)
}

function getLocalized(value) {
  if (!value) return ''
  return typeof value === 'string' ? value : pick(value)
}

function getSolution(questionId) {
  const solution = workedSolutions[questionId]
  return solution ? pick(solution) : ''
}

export default function Solve() {
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    try {
      const session = getStudentSession()

      if (!session?.studentUid || !session?.diagnosticRunId) {
        navigate('/join', { replace: true })
        return
      }

      const loaded = getQuestions(session.classId, null, 'diagnostic')

      if (!Array.isArray(loaded)) {
        throw new Error('getQuestions did not return an array')
      }

      if (active) setQuestions(loaded)
    } catch (err) {
      console.error('Question loading failed:', err)
      if (active) setError('Could not load questions. Please try again.')
    } finally {
      if (active) setLoading(false)
    }

    return () => {
      active = false
    }
  }, [navigate])

  function handleCheck(event) {
    event.preventDefault()

    if (feedback || !selected) return

    const session = getStudentSession()
    const question = questions[current]

    if (!session?.studentUid || !session?.diagnosticRunId || !question) {
      setError('Your session or question is missing. Please rejoin the class.')
      return
    }

    const options = Array.isArray(question.options) ? question.options : []
    const selectedOption = options.find(
      option => getOptionId(option) === selected
    )
    const correctOption = options.find(
      option => getOptionId(option) === question.correctOptionId
    )

    if (!selectedOption || !correctOption) {
      console.error('Invalid question data:', {
        questionId: question.id,
        correctOptionId: question.correctOptionId,
        selectedOptionId: selected,
        availableOptionIds: options.map(getOptionId)
      })

      setError('This question has invalid answer data. Check the browser console.')
      return
    }

    const correct = selected === question.correctOptionId
    const mistakeId = correct
      ? null
      : question.mistakeByOption?.[selected] ?? null

    try {
      saveAttempt({
        studentUid: session.studentUid,
        runId: session.diagnosticRunId,
        questionId: question.id,
        selectedOptionId: selected,
        mistakeId,
        isCorrect: correct,
        step: 'solve',
        createdAt: new Date().toISOString()
      })

      setFeedback({
        correct,
        correctAnswer: getOptionText(correctOption),
        explanation: getSolution(question.id)
      })

      setError('')
    } catch (err) {
      console.error('Saving answer failed:', err)
      setError('Your answer could not be saved. Please try again.')
    }
  }

  function handleContinue() {
    if (!feedback) return

    if (current < questions.length - 1) {
      setCurrent(value => value + 1)
      setSelected('')
      setFeedback(null)
      setError('')
      return
    }

    navigate('/result')
  }

  if (loading) {
    return <main style={{ padding: 24 }}>Loading questions...</main>
  }

  if (error && questions.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => navigate('/join')}>
          Back to Join
        </button>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <p>No diagnostic questions are available for this class.</p>
        <button type="button" onClick={() => navigate('/join')}>
          Back to Join
        </button>
      </main>
    )
  }

  const question = questions[current]
  const options = Array.isArray(question?.options) ? question.options : []

  return (
    <main
      style={{
        maxWidth: 680,
        margin: '24px auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6
      }}
    >
      <h1>ThinkFix</h1>
      <p>{t('student.solve')}</p>
      <p>Question {current + 1} of {questions.length}</p>
      <h2>{getLocalized(question.text)}</h2>

      <form onSubmit={handleCheck}>
        {options.map(option => {
          const id = getOptionId(option)
          if (!id) return null

          const isRight =
            Boolean(feedback) && id === question.correctOptionId

          const isWrongSelected =
            Boolean(feedback) &&
            id === selected &&
            !feedback.correct

          return (
            <label
              key={id}
              style={{
                display: 'block',
                padding: 12,
                margin: '8px 0',
                border: '1px solid #ccc',
                borderRadius: 8,
                background: isRight
                  ? '#e8f7ec'
                  : isWrongSelected
                    ? '#fdeaea'
                    : selected === id
                      ? '#eef4ff'
                      : '#fff'
              }}
            >
              <input
                type="radio"
                name={`answer-${question.id}`}
                value={id}
                checked={selected === id}
                disabled={Boolean(feedback)}
                onChange={() => {
                  setSelected(id)
                  setError('')
                }}
              />
              {' '}{getOptionText(option)}
              {isRight && <strong> ✓ Correct answer</strong>}
              {isWrongSelected && <strong> — Your answer</strong>}
            </label>
          )
        })}

        {error && (
          <p role="alert" style={{ color: '#b91c1c' }}>
            {error}
          </p>
        )}

        {!feedback && (
          <button
            type="submit"
            disabled={!selected}
            style={{
              padding: '12px 24px',
              marginTop: 12,
              background: selected ? '#2563eb' : '#9ca3af',
              color: 'white',
              border: 0,
              borderRadius: 8,
              cursor: selected ? 'pointer' : 'not-allowed'
            }}
          >
            Check Answer
          </button>
        )}
      </form>

      {feedback && (
        <section
          aria-live="polite"
          style={{
            marginTop: 24,
            padding: 18,
            border: `2px solid ${feedback.correct ? '#15803d' : '#b91c1c'}`,
            borderRadius: 12
          }}
        >
          <h2>
            {feedback.correct
              ? '✓ Correct! Well done.'
              : '✗ Not quite. Let’s understand why.'}
          </h2>

          <p>
            <strong>Correct answer: </strong>
            {feedback.correctAnswer}
          </p>

          <h3>Step-by-step explanation</h3>
          <p>
            {feedback.explanation ||
              'A worked explanation has not been added for this question yet.'}
          </p>

          <button
            type="button"
            onClick={handleContinue}
            style={{
              padding: '12px 24px',
              marginTop: 12,
              background: '#2563eb',
              color: 'white',
              border: 0,
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            {current === questions.length - 1 ? 'View Results' : 'Continue'}
          </button>
        </section>
      )}
    </main>
  )
}
