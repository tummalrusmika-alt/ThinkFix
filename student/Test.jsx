
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getQuestions,
  saveAttempt,
  getStudentSession,
  getResolvedFocusMistake,
} from '../lib/data'
import { pick } from '../lib/i18n'

const TEST_SIZE = 3

// Backup test questions: 3 questions for each mistake.
const backupQuestions = [
  // M1: Adding numerators and denominators directly
  {
    id: 'BACKUP_M1_1',
    targetMistake: 'M1',
    text: { en: 'What is 2/5 + 1/5?' },
    options: [
      { id: 'A', text: { en: '3/10' } },
      { id: 'B', text: { en: '3/5' } },
      { id: 'C', text: { en: '2/5' } },
      { id: 'D', text: { en: '1/5' } },
    ],
    correctOptionId: 'B',
  },
  {
    id: 'BACKUP_M1_2',
    targetMistake: 'M1',
    text: { en: 'Calculate 1/8 + 3/8.' },
    options: [
      { id: 'A', text: { en: '4/16' } },
      { id: 'B', text: { en: '2/8' } },
      { id: 'C', text: { en: '4/8' } },
      { id: 'D', text: { en: '3/8' } },
    ],
    correctOptionId: 'C',
  },
  {
    id: 'BACKUP_M1_3',
    targetMistake: 'M1',
    text: { en: 'What is 2/7 + 3/7?' },
    options: [
      { id: 'A', text: { en: '5/14' } },
      { id: 'B', text: { en: '6/7' } },
      { id: 'C', text: { en: '1/7' } },
      { id: 'D', text: { en: '5/7' } },
    ],
    correctOptionId: 'D',
  },

  // M2: Common denominator mistakes
  {
    id: 'BACKUP_M2_1',
    targetMistake: 'M2',
    text: { en: 'What is 1/2 + 1/4?' },
    options: [
      { id: 'A', text: { en: '2/6' } },
      { id: 'B', text: { en: '3/4' } },
      { id: 'C', text: { en: '2/4' } },
      { id: 'D', text: { en: '1/6' } },
    ],
    correctOptionId: 'B',
  },
  {
    id: 'BACKUP_M2_2',
    targetMistake: 'M2',
    text: { en: 'Calculate 1/3 + 1/2 using a common denominator.' },
    options: [
      { id: 'A', text: { en: '2/5' } },
      { id: 'B', text: { en: '2/6' } },
      { id: 'C', text: { en: '5/6' } },
      { id: 'D', text: { en: '1/6' } },
    ],
    correctOptionId: 'C',
  },
  {
    id: 'BACKUP_M2_3',
    targetMistake: 'M2',
    text: { en: 'What is 1/4 + 1/3?' },
    options: [
      { id: 'A', text: { en: '7/12' } },
      { id: 'B', text: { en: '2/7' } },
      { id: 'C', text: { en: '2/12' } },
      { id: 'D', text: { en: '1/12' } },
    ],
    correctOptionId: 'A',
  },

  // M3: Comparing fractions incorrectly
  {
    id: 'BACKUP_M3_1',
    targetMistake: 'M3',
    text: { en: 'Which fraction is greater: 1/2 or 1/5?' },
    options: [
      { id: 'A', text: { en: '1/5' } },
      { id: 'B', text: { en: 'Both are equal' } },
      { id: 'C', text: { en: '1/2' } },
      { id: 'D', text: { en: 'Cannot compare' } },
    ],
    correctOptionId: 'C',
  },
  {
    id: 'BACKUP_M3_2',
    targetMistake: 'M3',
    text: { en: 'Which fraction is smaller: 2/3 or 2/7?' },
    options: [
      { id: 'A', text: { en: '2/3' } },
      { id: 'B', text: { en: '2/7' } },
      { id: 'C', text: { en: 'Both are equal' } },
      { id: 'D', text: { en: 'Cannot compare' } },
    ],
    correctOptionId: 'B',
  },
  {
    id: 'BACKUP_M3_3',
    targetMistake: 'M3',
    text: { en: 'Which fraction is greater: 3/4 or 3/8?' },
    options: [
      { id: 'A', text: { en: '3/8' } },
      { id: 'B', text: { en: 'Both are equal' } },
      { id: 'C', text: { en: 'Cannot compare' } },
      { id: 'D', text: { en: '3/4' } },
    ],
    correctOptionId: 'D',
  },

  // M4: Forgetting to flip when dividing fractions
  {
    id: 'BACKUP_M4_1',
    targetMistake: 'M4',
    text: { en: 'Calculate 1/2 ÷ 1/4.' },
    options: [
      { id: 'A', text: { en: '1/8' } },
      { id: 'B', text: { en: '2' } },
      { id: 'C', text: { en: '1/6' } },
      { id: 'D', text: { en: '3/4' } },
    ],
    correctOptionId: 'B',
  },
  {
    id: 'BACKUP_M4_2',
    targetMistake: 'M4',
    text: { en: 'Calculate 2/3 ÷ 1/3.' },
    options: [
      { id: 'A', text: { en: '2' } },
      { id: 'B', text: { en: '2/9' } },
      { id: 'C', text: { en: '1/2' } },
      { id: 'D', text: { en: '3/2' } },
    ],
    correctOptionId: 'A',
  },
  {
    id: 'BACKUP_M4_3',
    targetMistake: 'M4',
    text: { en: 'Calculate 3/4 ÷ 1/2.' },
    options: [
      { id: 'A', text: { en: '3/8' } },
      { id: 'B', text: { en: '2/3' } },
      { id: 'C', text: { en: '3/2' } },
      { id: 'D', text: { en: '4/3' } },
    ],
    correctOptionId: 'C',
  },

  // M5: Mixed and improper fraction confusion
  {
    id: 'BACKUP_M5_1',
    targetMistake: 'M5',
    text: { en: 'Convert 1 1/2 into an improper fraction.' },
    options: [
      { id: 'A', text: { en: '2/3' } },
      { id: 'B', text: { en: '3/2' } },
      { id: 'C', text: { en: '2/2' } },
      { id: 'D', text: { en: '1/3' } },
    ],
    correctOptionId: 'B',
  },
  {
    id: 'BACKUP_M5_2',
    targetMistake: 'M5',
    text: { en: 'Convert 2 1/3 into an improper fraction.' },
    options: [
      { id: 'A', text: { en: '3/3' } },
      { id: 'B', text: { en: '5/3' } },
      { id: 'C', text: { en: '7/3' } },
      { id: 'D', text: { en: '6/3' } },
    ],
    correctOptionId: 'C',
  },
  {
    id: 'BACKUP_M5_3',
    targetMistake: 'M5',
    text: { en: 'Convert 3 1/4 into an improper fraction.' },
    options: [
      { id: 'A', text: { en: '13/4' } },
      { id: 'B', text: { en: '7/4' } },
      { id: 'C', text: { en: '12/4' } },
      { id: 'D', text: { en: '4/4' } },
    ],
    correctOptionId: 'A',
  },
]

function normalizeId(value) {
  return String(value ?? '').trim().toUpperCase()
}

function shuffleArray(array) {
  const shuffled = [...array]

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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [finished, setFinished] = useState(false)

  const submitting = useRef(false)

  useEffect(() => {
    let active = true

    try {
      const session = getStudentSession()

      if (!session?.studentUid || !session?.classId) {
        setError('Please join your class again before starting the test.')
        return
      }

      const focus = getResolvedFocusMistake(false)

      if (!focus?.id) {
        setError('Complete the diagnostic first to identify your focus mistake.')
        return
      }

      const mistakeId = normalizeId(focus.id)

      // Load existing questions, including previously attempted questions.
      const existingQuestions = getQuestions(
        session.classId,
        null,
        'test',
        { excludeSeen: false }
      )

      const existingForMistake = existingQuestions.filter(question => {
        const id =
          question.targetMistake ||
          question.mistakeId ||
          question.misconceptionId ||
          question.focusMistakeId

        return normalizeId(id) === mistakeId
      })

      // Add backup questions if the existing question bank is insufficient.
      const backupForMistake = backupQuestions.filter(
        question => normalizeId(question.targetMistake) === mistakeId
      )

      const combined = [...existingForMistake]

      backupForMistake.forEach(backup => {
        if (!combined.some(question => question.id === backup.id)) {
          combined.push(backup)
        }
      })

      if (combined.length < TEST_SIZE) {
        setError(`Questions could not be loaded for ${focus.id}. Please try again.`)
        return
      }

      if (active) {
        setQuestions(shuffleArray(combined).slice(0, TEST_SIZE))
      }
    } catch (err) {
      console.error('Test loading error:', err)
      if (active) {
        setError('Unable to load the test. Please refresh and try again.')
      }
    } finally {
      if (active) setLoading(false)
    }

    return () => {
      active = false
    }
  }, [])

  function handleAnswer() {
    if (submitting.current || !selected || !questions[current]) return

    const question = questions[current]
    const session = getStudentSession()

    if (!session?.studentUid) {
      setError('Your student session has expired. Please join your class again.')
      return
    }

    submitting.current = true
    setSaving(true)

    const isCorrect = selected === question.correctOptionId

    const identifiedMistake = isCorrect
      ? null
      : question.mistakeByOption?.[selected] ||
        question.targetMistake ||
        null

    try {
      saveAttempt({
        studentUid: session.studentUid,
        classId: session.classId,
        questionId: question.id,
        step: 'test',
        selectedOptionId: selected,
        isCorrect,
        correct: isCorrect,
        targetMistake: question.targetMistake || null,
        mistakeId: identifiedMistake,
        createdAt: new Date().toISOString(),
      })

      if (isCorrect) {
        setScore(previous => previous + 1)
      }

      setSelected('')

      if (current + 1 < questions.length) {
        setCurrent(previous => previous + 1)
      } else {
        setFinished(true)
      }
    } catch (err) {
      console.error('Could not save test answer:', err)
      setError('Your answer could not be saved. Please try again.')
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF5] p-8 text-center text-[#254C49]">
        Loading your test...
      </div>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#FFFCF5] px-5 py-12">
        <section className="mx-auto max-w-xl rounded-2xl border border-[#E7D9C9] bg-white p-8 text-center shadow-sm">
          <div className="mb-3 text-4xl">📘</div>
          <h2 className="mb-3 text-2xl font-bold text-[#254C49]">
            Test unavailable
          </h2>
          <p className="leading-7 text-[#64746F]">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="mt-6 rounded-xl bg-[#254C49] px-6 py-3 font-semibold text-white"
          >
            Back to dashboard
          </button>
        </section>
      </main>
    )
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100)
    const nextStep =
      percentage >= 76 ? 'Challenge' : percentage >= 40 ? 'Practise' : 'Re-learn'

    return (
      <main className="min-h-screen bg-[#FFFCF5] px-5 py-12">
        <section className="mx-auto max-w-xl rounded-2xl border border-[#DCE7E2] bg-white p-8 text-center shadow-sm">
          <div className="mb-3 text-5xl">🎉</div>
          <h2 className="mb-4 text-3xl font-bold text-[#254C49]">
            Test completed!
          </h2>
          <p className="mb-2 text-xl font-semibold text-[#397F78]">
            Your score: {score}/{questions.length}
          </p>
          <p className="mb-5 text-[#64746F]">You scored {percentage}%.</p>
          <div className="rounded-xl bg-[#DDEFEF] p-4 text-[#254C49]">
            <p className="text-sm">Your next learning step</p>
            <p className="mt-1 text-xl font-bold">{nextStep}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="mt-6 w-full rounded-xl bg-[#254C49] px-6 py-3 font-semibold text-white"
          >
            Back to dashboard
          </button>
        </section>
      </main>
    )
  }

  const question = questions[current]

  if (!question) return null

  return (
    <main className="min-h-screen bg-[#FFFCF5] px-5 py-8">
      <section className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#397F78]">
              ThinkFix · Focus practice
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#254C49]">
              Test yourself
            </h1>
          </div>
          <span className="rounded-full bg-[#DDEFEF] px-4 py-2 text-sm font-semibold text-[#254C49]">
            Question {current + 1} of {questions.length}
          </span>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-[#E7ECE8]">
          <div
            className="h-full rounded-full bg-[#397F78] transition-all"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <section className="rounded-2xl border border-[#DCE7E2] bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-sm font-semibold text-[#71918A]">
            Focus mistake: {question.targetMistake}
          </p>

          <h2 className="mb-7 text-xl font-semibold leading-8 text-[#254C49]">
            {pick(question.text)}
          </h2>

          <div className="space-y-3">
            {question.options.map(option => (
              <button
                key={option.id}
                type="button"
                disabled={saving}
                onClick={() => setSelected(option.id)}
                aria-pressed={selected === option.id}
                className={`w-full rounded-xl border p-4 text-left font-medium transition ${
                  selected === option.id
                    ? 'border-[#397F78] bg-[#DDEFEF] text-[#254C49]'
                    : 'border-[#DCE7E2] bg-white text-[#405B55] hover:bg-[#F5FAF7]'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F0F4F1] text-sm font-bold text-[#397F78]">
                  {option.id}
                </span>
                {pick(option.text)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAnswer}
            disabled={!selected || saving}
            className="mt-7 w-full rounded-xl bg-[#254C49] px-6 py-3.5 font-semibold text-white transition hover:bg-[#397F78] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : current === questions.length - 1
                ? 'Finish test'
                : 'Next question'}
          </button>
        </section>
      </section>
    </main>
  )
}
