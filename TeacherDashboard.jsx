import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getClass,
  getStudents,
  getClassAttempts,
  getMistakes,
} from '../lib/teacherData'

import { getFingerprint } from '../lib/fingerprint'
import { translate } from '../lib/translations'

const MISTAKE_IDS = ['M1', 'M2', 'M3', 'M4', 'M5']

const STATUS_STYLES = {
  active: 'bg-red-100 text-red-800',
  improving: 'bg-amber-100 text-amber-800',
  provisionally_fixed: 'bg-green-100 text-green-800',
  reopened: 'bg-purple-100 text-purple-800',
  none: 'bg-slate-100 text-slate-500',
}

// Solid heatmap colors. Strong color shows the pattern from across the room,
// and the symbol inside keeps it readable for color-blind viewers.
const TILE_STYLES = {
  active: 'bg-red-500 text-white shadow-sm shadow-red-200',
  improving: 'bg-amber-300 text-amber-900 shadow-sm shadow-amber-100',
  provisionally_fixed: 'bg-emerald-500 text-white shadow-sm shadow-emerald-200',
  reopened: 'bg-violet-500 text-white shadow-sm shadow-violet-200',
  none: 'bg-slate-100 text-slate-300',
}

// Circumference of the progress ring around each student avatar
const AVATAR_RING = 2 * Math.PI * 17

// Symbol drawn in the tile's text color
function StatusGlyph({ status, className = 'h-6 w-6' }) {
  const common = {
    viewBox: '0 0 24 24',
    className,
    'aria-hidden': true,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (status === 'active') {
    return (
      <svg {...common}>
        <path d="M12 5v9" />
        <circle cx="12" cy="19" r="0.6" fill="currentColor" />
      </svg>
    )
  }

  if (status === 'improving') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
      </svg>
    )
  }

  if (status === 'provisionally_fixed') {
    return (
      <svg {...common}>
        <path d="M5.5 12.5l4.2 4.2L18.5 8" />
      </svg>
    )
  }

  if (status === 'reopened') {
    return (
      <svg {...common}>
        <path d="M5 12a7 7 0 1 0 2.2-5.1" />
        <path d="M5 4.5v4h4" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  )
}

// Converts translated objects into displayable text.
function getLocalizedText(value, language = 'en') {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getLocalizedText(item, language))
      .join(', ')
  }

  if (value && typeof value === 'object') {
    return getLocalizedText(
      value[language] ?? value.en ?? '',
      language
    )
  }

  return ''
}

const LABELS = {
  en: {
    teacher: 'TEACHER',
    class: 'Class 7A · Fractions',
    logout: 'Log out',
    students: 'Students',
    attempted: 'Students with attempts',
    tracked: 'Mistake patterns tracked',
    heatmap: 'Mistake Heatmap',
    heatmapHelp: 'Select a student to view their learning details.',
    student: 'Student',
    active: 'Active',
    improving: 'Improving',
    fixed: 'Provisionally fixed',
    reopened: 'Reopened',
    none: 'Not seen',
    plan: "Tomorrow's Plan",
    insufficient: 'Collect attempts from at least 3 students before recommending a class activity.',
    focus: 'Focus on',
    affected: 'students are Active or Reopened for this mistake.',
    noPlan: 'No activity recommendation is available yet.',
    noStudents: 'No students have joined yet.',
    loadError: 'Could not load the dashboard. Please try again.',
    noClass: 'No class is linked to this teacher.',
    loading: 'Loading dashboard...',
    language: 'Language',
    sample: 'SAMPLE DATA',
    progress: 'Class Progress',
    attemptedCount: 'students have recorded attempts.',
    totalAttempts: 'Recorded attempts',
  },

  te: {
    teacher: 'ఉపాధ్యాయులు',
    class: '7A తరగతి · భిన్నాలు',
    logout: 'లాగ్ అవుట్',
    students: 'విద్యార్థులు',
    attempted: 'ప్రయత్నాలు చేసిన విద్యార్థులు',
    tracked: 'గుర్తించిన తప్పుల నమూనాలు',
    heatmap: 'తప్పుల హీట్‌మ్యాప్',
    heatmapHelp: 'విద్యార్థి అభ్యాస వివరాలను చూడటానికి వారి పేరును ఎంచుకోండి.',
    student: 'విద్యార్థి',
    active: 'ప్రస్తుతం ఉంది',
    improving: 'మెరుగుపడుతోంది',
    fixed: 'తాత్కాలికంగా సరిచేయబడింది',
    reopened: 'మళ్లీ కనిపించింది',
    none: 'ఇంకా గుర్తించలేదు',
    plan: 'రేపటి ప్రణాళిక',
    insufficient: 'తరగతి కార్యకలాపాన్ని సూచించే ముందు కనీసం 3 మంది విద్యార్థుల ప్రయత్నాలు సేకరించండి.',
    focus: 'దీనిపై దృష్టి పెట్టండి:',
    affected: 'మంది విద్యార్థులకు ఈ తప్పు ఇంకా ఉంది లేదా మళ్లీ కనిపించింది.',
    noPlan: 'ఇంకా కార్యకలాప సూచన అందుబాటులో లేదు.',
    noStudents: 'ఇంకా విద్యార్థులు చేరలేదు.',
    loadError: 'డాష్‌బోర్డ్‌ను తెరవలేకపోయాం. మళ్లీ ప్రయత్నించండి.',
    noClass: 'ఈ ఉపాధ్యాయుడికి తరగతి అనుసంధానించబడలేదు.',
    loading: 'డాష్‌బోర్డ్ లోడ్ అవుతోంది...',
    language: 'భాష',
    sample: 'నమూనా డేటా',
    progress: 'తరగతి పురోగతి',
    attemptedCount: 'మంది విద్యార్థులు ప్రయత్నాలు నమోదు చేశారు.',
    totalAttempts: 'నమోదైన ప్రయత్నాలు',
  },

  hi: {
    teacher: 'शिक्षक',
    class: 'कक्षा 7A · भिन्न',
    logout: 'लॉग आउट',
    students: 'विद्यार्थी',
    attempted: 'प्रयास करने वाले विद्यार्थी',
    tracked: 'पहचाने गए गलती के प्रकार',
    heatmap: 'गलतियों का हीटमैप',
    heatmapHelp: 'विद्यार्थी की सीखने की जानकारी देखने के लिए उसका नाम चुनें।',
    student: 'विद्यार्थी',
    active: 'सक्रिय',
    improving: 'सुधार हो रहा है',
    fixed: 'अस्थायी रूप से ठीक',
    reopened: 'फिर से दिखाई दी',
    none: 'अभी तक नहीं देखा',
    plan: 'कल की योजना',
    insufficient: 'कक्षा की गतिविधि सुझाने से पहले कम से कम 3 विद्यार्थियों के प्रयास दर्ज करें।',
    focus: 'इस पर ध्यान दें:',
    affected: 'विद्यार्थियों में यह गलती सक्रिय है या फिर से दिखाई दी है।',
    noPlan: 'अभी कोई गतिविधि सुझाव उपलब्ध नहीं है।',
    noStudents: 'अभी तक कोई विद्यार्थी नहीं जुड़ा है।',
    loadError: 'डैशबोर्ड लोड नहीं हो सका। कृपया फिर कोशिश करें।',
    noClass: 'इस शिक्षक से कोई कक्षा जुड़ी नहीं है।',
    loading: 'डैशबोर्ड लोड हो रहा है...',
    language: 'भाषा',
    sample: 'नमूना डेटा',
    progress: 'कक्षा की प्रगति',
    attemptedCount: 'विद्यार्थियों ने प्रयास दर्ज किए हैं।',
    totalAttempts: 'दर्ज किए गए प्रयास',
  },
}

const STATUS_KEYS = {
  active: 'active',
  improving: 'improving',
  provisionally_fixed: 'fixed',
  reopened: 'reopened',
  none: 'none',
}

export default function TeacherDashboard() {
  const navigate = useNavigate()

  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [classInfo, setClassInfo] = useState(null)
  const [students, setStudents] = useState([])
  const [attempts, setAttempts] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [fingerprints, setFingerprints] = useState({})
  const [hoverColumn, setHoverColumn] = useState(null)

  const labels = LABELS[language] || LABELS.en

  function t(key) {
    const translated = translate(language, key)
    return getLocalizedText(translated, language) || key
  }

  function statusLabel(status) {
    return labels[STATUS_KEYS[status] || 'none']
  }

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
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
          if (!cancelled) setError('NO_CLASS')
          return
        }

        const [
          classStudents,
          classAttempts,
          classMistakes,
        ] = await Promise.all([
          getStudents(currentClass.id),
          getClassAttempts(currentClass.id),
          getMistakes(currentClass.id),
        ])

        const nextFingerprints = {}

        for (const student of classStudents) {
          const studentAttempts = classAttempts.filter(
            (attempt) => attempt.studentUid === student.authUid
          )

          nextFingerprints[student.id] = getFingerprint(studentAttempts)
        }

        if (!cancelled) {
          setClassInfo(currentClass)
          setStudents(classStudents)
          setAttempts(classAttempts)
          setMistakes(classMistakes)
          setFingerprints(nextFingerprints)
        }
      } catch (err) {
        console.error('Dashboard loading error:', err)

        if (!cancelled) {
          setError('LOAD_ERROR')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [navigate])

  function handleLogout() {
    sessionStorage.removeItem('thinkfixTeacherUid')
    navigate('/teacher/login', { replace: true })
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <p className="text-slate-600">{labels.loading}</p>
      </main>
    )
  }

  if (error) {
    const errorMessage =
      error === 'NO_CLASS' ? labels.noClass : labels.loadError

    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p role="alert" className="text-red-700">{errorMessage}</p>
        <button
          type="button"
          onClick={() => navigate('/teacher/login')}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          {labels.logout}
        </button>
      </main>
    )
  }

  const studentsWithAttempts = students.filter((student) =>
    attempts.some((attempt) => attempt.studentUid === student.authUid)
  ).length

  const activeCounts = Object.fromEntries(
    MISTAKE_IDS.map((mistakeId) => [
      mistakeId,
      students.filter((student) =>
        ['active', 'reopened'].includes(
          fingerprints[student.id]?.[mistakeId]
        )
      ).length,
    ])
  )

  const tomorrowMistakeId = [...MISTAKE_IDS].sort(
    (a, b) => activeCounts[b] - activeCounts[a] || a.localeCompare(b)
  )[0]

  const tomorrowMistake = mistakes.find(
    (mistake) => mistake.id === tomorrowMistakeId
  )

  const showRecommendation = studentsWithAttempts >= 3

  const tomorrowMistakeName = getLocalizedText(
    tomorrowMistake?.name,
    language
  )

  const tomorrowActivity = getLocalizedText(
    tomorrowMistake?.activity ??
      tomorrowMistake?.activities ??
      tomorrowMistake?.hint ??
      '',
    language
  )

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-widest text-indigo-600">
            THINKFIX · {labels.teacher}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {t('teacher.dashboard.title')}
          </h1>

          <p className="mt-2 text-slate-600">
            {getLocalizedText(classInfo?.className || labels.class, language)}
          </p>

          <span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {labels.sample}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            {labels.language}
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label={labels.language}
              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100"
          >
            {labels.logout}
          </button>
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{labels.students}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{students.length}</p>
        </article>

        <article className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{labels.attempted}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{studentsWithAttempts}</p>
        </article>

        <article className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{labels.tracked}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{MISTAKE_IDS.length}</p>
        </article>

        <article className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{labels.totalAttempts}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{attempts.length}</p>
        </article>
      </section>

      <section className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 px-5 py-6 text-white sm:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl"
          />

          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {getLocalizedText(t('teacher.heatmap.title'), language)}
              </h2>
              <p className="mt-1 text-sm text-indigo-200">{labels.heatmapHelp}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.keys(STATUS_STYLES).map((status) => (
                <span
                  key={status}
                  className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-xs font-medium text-indigo-50 ring-1 ring-white/20"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${TILE_STYLES[status]}`}
                  >
                    <StatusGlyph status={status} className="h-3.5 w-3.5" />
                  </span>
                  {statusLabel(status)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {students.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              {getLocalizedText(t('teacher.students.empty'), language)}
            </p>
          ) : (
            <div className="overflow-x-auto pb-2 pt-6">
              <table className="w-full min-w-[720px] border-separate text-left text-sm [border-spacing:0_8px]">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-48 bg-white pb-2 pr-3 align-bottom text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {labels.student}
                    </th>

                    {MISTAKE_IDS.map((mistakeId) => {
                      const mistakeName = getLocalizedText(
                        mistakes.find((mistake) => mistake.id === mistakeId)?.name,
                        language
                      )
                      const isLit = hoverColumn === mistakeId
                      const share = students.length
                        ? Math.min(100, (activeCounts[mistakeId] / students.length) * 100)
                        : 0

                      return (
                        <th
                          key={mistakeId}
                          onMouseEnter={() => setHoverColumn(mistakeId)}
                          onMouseLeave={() => setHoverColumn(null)}
                          className="px-1.5 pb-2 align-top font-normal"
                        >
                          <div
                            className={`rounded-2xl px-3 py-2.5 text-center transition-colors duration-200 ${
                              isLit
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-slate-50 text-slate-800 ring-1 ring-slate-200'
                            }`}
                          >
                            <span className="block text-sm font-bold">{mistakeId}</span>

                            {mistakeName && (
                              <span
                                title={mistakeName}
                                className={`mx-auto mt-0.5 block max-w-[120px] truncate text-[11px] ${
                                  isLit ? 'text-indigo-100' : 'text-slate-500'
                                }`}
                              >
                                {mistakeName}
                              </span>
                            )}

                            <span
                              title={`${labels.active} + ${labels.reopened}`}
                              className="mt-2.5 flex items-center gap-2"
                            >
                              <span
                                className={`h-1.5 flex-1 overflow-hidden rounded-full ${
                                  isLit ? 'bg-white/25' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`block h-full rounded-full ${
                                    isLit ? 'bg-white' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${share}%` }}
                                />
                              </span>
                              <span className="text-xs font-bold tabular-nums">
                                {activeCounts[mistakeId]}
                              </span>
                            </span>
                          </div>
                        </th>
                      )
                    })}

                    <th className="w-14 pb-2">
                      <span className="sr-only">
                        {labels.active} + {labels.reopened}
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => {
                    const nickname = getLocalizedText(student.nickname, language)
                    const statuses = MISTAKE_IDS.map(
                      (mistakeId) => fingerprints[student.id]?.[mistakeId] || 'none'
                    )
                    const needsHelp = statuses.filter((status) =>
                      ['active', 'reopened'].includes(status)
                    ).length
                    const fixedCount = statuses.filter(
                      (status) => status === 'provisionally_fixed'
                    ).length
                    const improvingCount = statuses.filter(
                      (status) => status === 'improving'
                    ).length
                    const fixedArc = (fixedCount / MISTAKE_IDS.length) * AVATAR_RING
                    const improvingArc =
                      (improvingCount / MISTAKE_IDS.length) * AVATAR_RING

                    return (
                      <tr key={student.id} className="group">
                        <td className="sticky left-0 z-10 bg-white pr-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/teacher/student/${student.id}`)}
                            className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-left font-semibold text-slate-800 ring-1 ring-slate-200 transition group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:ring-indigo-200"
                          >
                            <span
                              title={`${statusLabel('provisionally_fixed')} ${fixedCount}/${MISTAKE_IDS.length} · ${statusLabel('improving')} ${improvingCount}/${MISTAKE_IDS.length}`}
                              className="relative flex h-10 w-10 shrink-0 items-center justify-center"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 40 40"
                                className="absolute inset-0 -rotate-90"
                                fill="none"
                              >
                                <circle
                                  cx="20"
                                  cy="20"
                                  r="17"
                                  strokeWidth="3.5"
                                  className="stroke-slate-200"
                                />
                                {improvingCount > 0 && (
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    strokeWidth="3.5"
                                    strokeDasharray={`${improvingArc} ${AVATAR_RING}`}
                                    strokeDashoffset={-fixedArc}
                                    className="stroke-amber-400"
                                  />
                                )}
                                {fixedCount > 0 && (
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeDasharray={`${fixedArc} ${AVATAR_RING}`}
                                    className="stroke-emerald-500"
                                  />
                                )}
                              </svg>
                              <span
                                aria-hidden="true"
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white"
                              >
                                {Array.from(nickname)[0] || ''}
                              </span>
                            </span>
                            <span className="truncate">{nickname}</span>
                          </button>
                        </td>

                        {MISTAKE_IDS.map((mistakeId, index) => {
                          const status = statuses[index]

                          return (
                            <td
                              key={mistakeId}
                              onMouseEnter={() => setHoverColumn(mistakeId)}
                              onMouseLeave={() => setHoverColumn(null)}
                              className="px-1.5"
                            >
                              <div
                                className={`group/cell relative flex h-12 items-center justify-center rounded-xl ring-1 ring-inset ring-white/20 transition duration-150 hover:-translate-y-0.5 hover:brightness-105 ${
                                  TILE_STYLES[status] || TILE_STYLES.none
                                }`}
                              >
                                <StatusGlyph status={status} className="h-6 w-6" />
                                <span className="sr-only">{statusLabel(status)}</span>

                                <span
                                  aria-hidden="true"
                                  className="pointer-events-none absolute -top-8 z-20 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition group-hover/cell:opacity-100"
                                >
                                  {statusLabel(status)}
                                </span>
                              </div>
                            </td>
                          )
                        })}

                        <td className="pl-2 text-center">
                          {needsHelp > 0 && (
                            <span
                              title={`${labels.active} + ${labels.reopened}`}
                              className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white"
                            >
                              {needsHelp}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-indigo-100 bg-indigo-50 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-900">
          {getLocalizedText(t('teacher.plan.title'), language)}
        </h2>

        {!showRecommendation ? (
          <p className="mt-3 text-slate-700">
            {labels.insufficient} ({studentsWithAttempts}/3)
          </p>
        ) : tomorrowMistake ? (
          <>
            <p className="mt-3 text-slate-800">
              {labels.focus}{' '}
              <strong>
                {tomorrowMistake.id}: {tomorrowMistakeName}
              </strong>
            </p>

            <p className="mt-2 text-slate-700">{tomorrowActivity}</p>

            <p className="mt-3 text-sm text-slate-600">
              {activeCounts[tomorrowMistakeId]} {labels.affected}
            </p>
          </>
        ) : (
          <p className="mt-3 text-slate-700">{labels.noPlan}</p>
        )}
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-900">{labels.progress}</h2>

        <p className="mt-2 text-slate-600">
          {studentsWithAttempts} / {students.length} {labels.attemptedCount}
        </p>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={
            students.length
              ? Math.round((studentsWithAttempts / students.length) * 100)
              : 0
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={labels.progress}
        >
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{
              width: `${
                students.length
                  ? (studentsWithAttempts / students.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {students.length
            ? `${Math.round((studentsWithAttempts / students.length) * 100)}%`
            : '0%'}
        </p>
      </section>
    </main>
  )
}