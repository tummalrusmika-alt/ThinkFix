import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getQuestions,
  saveAttempt,
  getStudentSession,
  getResolvedFocusMistake
} from '../lib/data'
import { pick } from '../lib/i18n'

// Shuffle options without changing their IDs or correct answers.
function shuffleOptions(options = []) {
  const shuffled = [...options]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export default function Test() {
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState('')
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    try {
      const session = getStudentSession()

      if (!session?.classId || !(session.studentUid || session.id)) {
        setError(
          'Please join your class and complete the diagnostic first.'
        )
        return
      }

      const focus = getResolvedFocusMistake(false)

      if (!focus?.id) {
        setError(
          'Complete the Solve activity first so ThinkFix can identify your focus mistake.'
        )
        return
      }

      const pool = getQuestions(session.classId, null, 'test')

      const focusQuestions = pool.filter(question =>
        String(question.targetMistake || '').toUpperCase() ===
        String(focus.id).toUpperCase()
      )

      if (focusQuestions.length < 3) {
        setError(
          `There are only ${focusQuestions.length} fresh questions for ${focus.id}. Please ask your teacher to add more.`
        )
        return
      }

      const shuffled = [...focusQuestions].sort(
        () => Math.random() - 0.5
      )

      setQuestions(
        shuffled.slice(0, 3).map(question => ({
          ...question,
          options: shuffleOptions(question.options || [])
        }))
      )
    } catch (err) {
      console.error('Test loading error:', err)
      setError('Unable to load the test. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  function handleAnswer() {
    const question = questions[current]

    if (!selected || !question) return

    const isCorrect = selected === question.correctOptionId
    const session = getStudentSession()

    try {
      saveAttempt({
        studentUid: session?.studentUid || session?.id,
        studentId: session?.studentUid || session?.id,
        classId: session?.classId,
        questionId: question.id,
        step: 'test',
        selectedOptionId: selected,
        isCorrect,
        correct: isCorrect,
        targetMistake: question.targetMistake,
        mistakeId: null,
        createdAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Could not save test answer:', err)
      setError('Your answer could not be saved. Please try again.')
      return
    }

    if (isCorrect) {
      setScore(value => value + 1)
    }

    setSelected('')

    if (current + 1 < questions.length) {
      setCurrent(value => value + 1)
    } else {
      setFinished(true)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading your test...
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-3">
          Test unavailable
        </h2>

        <p className="text-gray-600 mb-5">
          {error}
        </p>

        <button
          type="button"
          onClick={() => navigate('/student/dashboard')}
          className="px-5 py-3 rounded-lg bg-blue-600 text-white"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (finished) {
    const percent = Math.round(
      (score / questions.length) * 100
    )

    const nextStep =
      percent <= 39
        ? 'Re-learn'
        : percent <= 75
          ? 'Practise'
          : 'Challenge'

    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Test Completed!
        </h2>

        <p className="text-xl mb-2">
          Your score: {score}/{questions.length}
        </p>

        <p className="text-lg font-semibold mb-2">
          {percent}%
        </p>

        <p className="text-gray-700 mb-5">
          Recommended next step: {nextStep}
        </p>

        <button
          type="button"
          onClick={() => navigate('/student/dashboard')}
          className="px-5 py-3 rounded-lg bg-blue-600 text-white"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const question = questions[current]

  if (!question) return null

  return (
    <div className="max-w-2xl mx-auto p-6">

      <div className="flex justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold">
          Focus Test
        </h2>

        <span className="text-sm font-semibold text-blue-600">
          Question {current + 1} of {questions.length}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{
            width: `${((current + 1) / questions.length) * 100}%`
          }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">

        <h3 className="text-lg font-semibold mb-6">
          {pick(question.text)}
        </h3>

        <div className="space-y-3">
          {question.options?.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className={`w-full text-left p-4 border rounded-lg transition ${
                selected === option.id
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {pick(option.text)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAnswer}
          disabled={!selected}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {current === questions.length - 1
            ? 'Finish Test'
            : 'Next Question'}
        </button>

      </div>
    </div>
  )
}