
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  getClass,
  getStudents,
  getStudentAttempts,
  getMistakes,
} from '../lib/teacherData'

import { getFingerprint } from '../lib/fingerprint'

const TEXT = {
  en: {
    title: 'Student Detail',
    back: 'Back to Dashboard',
    student: 'Student',
    totalAttempts: 'Total Attempts',
    correct: 'Correct Answers',
    mistakes: 'Mistake Fingerprint',
    history: 'Attempt History',
    question: 'Question',
    mistake: 'Mistake',
    result: 'Result',
    date: 'Date',
    correctLabel: 'Correct',
    incorrect: 'Incorrect',
    noAttempts: 'No attempts recorded yet.',
    noMistakes: 'No mistake data available.',
    loading: 'Loading student details...',
    notFound: 'Student not found in your class.',
    error: 'Could not load student details.',
    logout: 'Logout',
    language: 'Language',
    active: 'Active',
    improving: 'Improving',
    fixed: 'Provisionally Fixed',
    reopened: 'Reopened',
    none: 'Not observed',
    class: 'Class',
    sample: 'Sample Data',
  },
  te: {
    title: 'విద్యార్థి వివరాలు',
    back: 'డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి',
    student: 'విద్యార్థి',
    totalAttempts: 'మొత్తం ప్రయత్నాలు',
    correct: 'సరైన సమాధానాలు',
    mistakes: 'తప్పుల వివరాలు',
    history: 'ప్రయత్నాల చరిత్ర',
    question: 'ప్రశ్న',
    mistake: 'తప్పు',
    result: 'ఫలితం',
    date: 'తేదీ',
    correctLabel: 'సరైనది',
    incorrect: 'తప్పు',
    noAttempts: 'ఇంకా ప్రయత్నాలు నమోదు కాలేదు.',
    noMistakes: 'తప్పుల వివరాలు అందుబాటులో లేవు.',
    loading: 'విద్యార్థి వివరాలు లోడ్ అవుతున్నాయి...',
    notFound: 'మీ తరగతిలో విద్యార్థి కనిపించలేదు.',
    error: 'విద్యార్థి వివరాలను లోడ్ చేయలేకపోయాము.',
    logout: 'లాగ్‌అవుట్',
    language: 'భాష',
    active: 'ఇంకా వస్తున్న తప్పు',
    improving: 'మెరుగుపడుతున్నారు',
    fixed: 'తాత్కాలికంగా సరిచేశారు',
    reopened: 'మళ్లీ వచ్చిన తప్పు',
    none: 'గమనించలేదు',
    class: 'తరగతి',
    sample: 'నమూనా డేటా',
  },
  hi: {
    title: 'विद्यार्थी का विवरण',
    back: 'डैशबोर्ड पर वापस जाएँ',
    student: 'विद्यार्थी',
    totalAttempts: 'कुल प्रयास',
    correct: 'सही उत्तर',
    mistakes: 'गलतियों का विवरण',
    history: 'प्रयासों का इतिहास',
    question: 'प्रश्न',
    mistake: 'गलती',
    result: 'परिणाम',
    date: 'तारीख',
    correctLabel: 'सही',
    incorrect: 'गलत',
    noAttempts: 'अभी तक कोई प्रयास दर्ज नहीं हुआ है।',
    noMistakes: 'गलतियों का विवरण उपलब्ध नहीं है।',
    loading: 'विद्यार्थी का विवरण लोड हो रहा है...',
    notFound: 'आपकी कक्षा में विद्यार्थी नहीं मिला।',
    error: 'विद्यार्थी का विवरण लोड नहीं हो सका।',
    logout: 'लॉग आउट',
    language: 'भाषा',
    active: 'गलती अभी भी हो रही है',
    improving: 'सुधार हो रहा है',
    fixed: 'अस्थायी रूप से ठीक',
    reopened: 'गलती फिर से हुई',
    none: 'अभी तक नहीं देखा गया',
    class: 'कक्षा',
    sample: 'नमूना डेटा',
  },
}

// Safely reads both ordinary strings and translated objects.
function getLocalizedText(value, language = 'en') {
  if (typeof value === 'string') return value

  if (Array.isArray(value)) {
    return value
      .map((item) => getLocalizedText(item, language))
      .join(', ')
  }

  if (value && typeof value === 'object') {
    return getLocalizedText(value[language] ?? value.en ?? '', language)
  }

  return ''
}

function getStatusLabel(status, labels) {
  const statusLabels = {
    active: labels.active,
    improving: labels.improving,
    provisionally_fixed: labels.fixed,
    reopened: labels.reopened,
    none: labels.none,
  }

  return statusLabels[status] ?? labels.none
}

function formatDate(dateValue, language) {
  if (!dateValue) return '—'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return '—'

  const locale = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN',
  }[language] ?? 'en-IN'

  return date.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function StudentDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [language, setLanguage] = useState('en')
  const [student, setStudent] = useState(null)
  const [classInfo, setClassInfo] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [fingerprint, setFingerprint] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const labels = TEXT[language] ?? TEXT.en

  useEffect(() => {
    let cancelled = false

    async function loadStudentDetails() {
      setLoading(true)
      setError('')

      try {
        const teacherUid = sessionStorage.getItem('thinkfixTeacherUid')

        if (!teacherUid) {
          navigate('/teacher/login', { replace: true })
          return
        }

        const currentClass = await getClass(teacherUid)

        if (!currentClass) {
          throw new Error('CLASS_NOT_FOUND')
        }

        const classStudents = await getStudents(currentClass.id)

        const currentStudent = classStudents.find(
          (item) => item.id === id || item.authUid === id
        )

        if (!currentStudent) {
          throw new Error('STUDENT_NOT_FOUND')
        }

        const studentAttempts = await getStudentAttempts(
          currentStudent.authUid
        )

        const classMistakes = await getMistakes(currentClass.id)

        // Do not pass the mistake records as questions.
        // The fingerprint function should receive the student's attempts.
        const studentFingerprint = getFingerprint(studentAttempts)

        if (cancelled) return

        setClassInfo(currentClass)
        setStudent(currentStudent)
        setAttempts(studentAttempts)
        setMistakes(classMistakes)
        setFingerprint(studentFingerprint)
      } catch (err) {
        if (cancelled) return

        if (err.message === 'STUDENT_NOT_FOUND') {
          setError('STUDENT_NOT_FOUND')
        } else if (err.message === 'CLASS_NOT_FOUND') {
          setError('CLASS_NOT_FOUND')
        } else {
          console.error('Student detail loading error:', err)
          setError('LOAD_ERROR')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadStudentDetails()

    return () => {
      cancelled = true
    }
  }, [id, navigate])

  function handleLogout() {
    sessionStorage.removeItem('thinkfixTeacherUid')
    navigate('/teacher/login', { replace: true })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-700">
        {labels.loading}
      </main>
    )
  }

  if (error || !student) {
    const message =
      error === 'STUDENT_NOT_FOUND'
        ? labels.notFound
        : error === 'CLASS_NOT_FOUND'
          ? labels.error
          : labels.error

    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-red-600">{message}</p>

          <button
            type="button"
            onClick={() => navigate('/teacher/dashboard')}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            {labels.back}
          </button>
        </div>
      </main>
    )
  }

  const correctCount = attempts.filter(
    (attempt) => attempt.isCorrect === true
  ).length

  const accuracy =
    attempts.length > 0
      ? Math.round((correctCount / attempts.length) * 100)
      : 0

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/teacher/dashboard')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            ← {labels.back}
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              {labels.language}
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिन्दी</option>
              </select>
            </label>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-100"
            >
              {labels.logout}
            </button>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{labels.student}</p>
              <h1 className="mt-1 text-2xl font-bold">
                {getLocalizedText(student.nickname, language)}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {labels.class}: {classInfo?.className ?? '—'}
              </p>
            </div>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {labels.sample}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{labels.totalAttempts}</p>
            <p className="mt-2 text-3xl font-bold">{attempts.length}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{labels.correct}</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {correctCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Accuracy</p>
            <p className="mt-2 text-3xl font-bold">{accuracy}%</p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={accuracy}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">{labels.mistakes}</h2>

          {mistakes.length === 0 ? (
            <p className="text-slate-500">{labels.noMistakes}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {mistakes.map((mistake) => {
                const status = fingerprint[mistake.id] ?? 'none'

                return (
                  <article
                    key={mistake.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold">
                        {mistake.id}: {getLocalizedText(mistake.name, language)}
                      </h3>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          status === 'active' || status === 'reopened'
                            ? 'bg-red-100 text-red-700'
                            : status === 'improving'
                              ? 'bg-amber-100 text-amber-800'
                              : status === 'provisionally_fixed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {getStatusLabel(status, labels)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-600">
                      {getLocalizedText(mistake.hint, language)}
                    </p>

                    <p className="mt-2 text-sm">
                      {getLocalizedText(mistake.explanation, language)}
                    </p>

                    {(() => {
                      const steps = mistake.buddySteps?.[language]
                        ?? mistake.buddySteps?.en
                        ?? mistake.buddySteps

                      const safeSteps = Array.isArray(steps) ? steps : []

                      return safeSteps.length > 0 ? (
                        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-slate-600">
                          {safeSteps.map((step, index) => (
                            <li key={`${mistake.id}-${index}`}>
                              {getLocalizedText(step, language)}
                            </li>
                          ))}
                        </ol>
                      ) : null
                    })()}

                    <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">
                      <span className="font-semibold">
                        {getLocalizedText(
                          mistake.activity ?? mistake.activities,
                          language
                        )}
                      </span>
                    </p>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">{labels.history}</h2>

          {attempts.length === 0 ? (
            <p className="text-slate-500">{labels.noAttempts}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">{labels.question}</th>
                    <th className="px-3 py-3 font-medium">{labels.mistake}</th>
                    <th className="px-3 py-3 font-medium">{labels.result}</th>
                    <th className="px-3 py-3 font-medium">{labels.date}</th>
                  </tr>
                </thead>

                <tbody>
                  {attempts.map((attempt) => (
                    <tr
                      key={attempt.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-3">{attempt.questionId}</td>
                      <td className="px-3 py-3">{attempt.mistakeId ?? '—'}</td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            attempt.isCorrect
                              ? 'font-medium text-emerald-700'
                              : 'font-medium text-red-700'
                          }
                        >
                          {attempt.isCorrect
                            ? labels.correctLabel
                            : labels.incorrect}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {formatDate(attempt.createdAt, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
