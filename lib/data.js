import questionsData from '../questions.json'
import mistakesData from '../mistakes.json'

const SESSION_KEY = 'thinkfix_student_session'
const ATTEMPTS_KEY = 'thinkfix_attempts'
const FOCUS_KEY = 'thinkfix_focus_mistake'

const DEFAULT_CLASS = {
  id: 'class6a',
  name: 'Class 6A',
  className: 'Class 6A',
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    console.error(`Could not read ${key}:`, error)
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Could not save ${key}:`, error)
    throw error
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normalizeId(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function normalizeQuestion(question) {
  if (!question || !Array.isArray(question.options)) return null

  if (
    question.text &&
    question.correctOptionId &&
    question.options.every(option => typeof option === 'object' && option.id)
  ) {
    return question
  }

  if (question.question && question.correctAnswer) {
    const options = question.options.map((option, index) => ({
      id: `option${index + 1}`,
      text: {
        en: typeof option === 'string' ? option : option.text?.en || '',
      },
    }))

    const correctIndex = question.options.findIndex(option => {
      const text = typeof option === 'string' ? option : option.text?.en
      return text === question.correctAnswer
    })

    const correctOptionId =
      correctIndex >= 0 ? options[correctIndex].id : null

    const mistakeByOption = {}
    options.forEach(option => {
      if (option.id !== correctOptionId && question.mistakeId) {
        mistakeByOption[option.id] = question.mistakeId
      }
    })

    return {
      ...question,
      topicId: question.topicId || question.topic || 'algebra',
      set: question.set || 'diagnostic',
      text: { en: question.question },
      options,
      correctOptionId,
      mistakeByOption,
    }
  }

  return null
}

export function getAllQuestions() {
  if (!Array.isArray(questionsData)) return []
  return questionsData.map(normalizeQuestion).filter(Boolean)
}

export function saveStudentSession(session) {
  if (!session || typeof session !== 'object') {
    throw new Error('A valid student session is required.')
  }

  writeStorage(SESSION_KEY, session)
  return session
}

export function getStudentSession() {
  return readStorage(SESSION_KEY, null)
}

export function clearStudentSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getQuestionsById(questionId) {
  return getAllQuestions().find(question => question.id === questionId) || null
}

export function getQuestions(
  classId,
  topicId = null,
  set = 'diagnostic',
  options = {}
) {
  const { excludeSeen = true } = options
  const session = getStudentSession()

  const base = getAllQuestions().filter(question => {
    const matchesTopic =
      !topicId || normalizeId(question.topicId) === normalizeId(topicId)

    const matchesSet = (question.set || 'diagnostic') === set

    return matchesTopic && matchesSet
  })

  let filtered = base.filter(
    question => normalizeId(question.classId) === normalizeId(classId)
  )

  if (filtered.length === 0) {
    filtered = base
  }

  if (set === 'diagnostic') {
    return [...filtered].sort(() => Math.random() - 0.5)
  }

  if (excludeSeen && session?.studentUid) {
    const seenIds = new Set(
      getStudentAttempts(session.studentUid)
        .filter(attempt => attempt.step === set)
        .map(attempt => attempt.questionId)
    )

    filtered = filtered.filter(question => !seenIds.has(question.id))
  }

  return filtered
}

export function getStudentAttempts(studentUid) {
  const attempts = readStorage(ATTEMPTS_KEY, [])
  if (!Array.isArray(attempts)) return []

  return studentUid
    ? attempts.filter(attempt => attempt.studentUid === studentUid)
    : attempts
}

export function saveAttempt(attempt) {
  if (!attempt || typeof attempt !== 'object') {
    throw new Error('A valid attempt is required.')
  }

  const session = getStudentSession()
  if (!session?.studentUid) {
    throw new Error('Student session not found.')
  }

  const newAttempt = {
    id: createId(),
    ...attempt,
    studentUid: session.studentUid,
    runId: attempt.runId || session.diagnosticRunId,
    createdAt: attempt.createdAt || new Date().toISOString(),
  }

  const attempts = getStudentAttempts()
  attempts.push(newAttempt)
  writeStorage(ATTEMPTS_KEY, attempts)

  return newAttempt
}

export function getAttemptsByStudent(studentUid) {
  return getStudentAttempts(studentUid)
}

export function getAttemptsByMistake(mistakeId, studentUid) {
  return getStudentAttempts(studentUid).filter(
    attempt => attempt.mistakeId === mistakeId
  )
}

export function getAllMistakes() {
  return Array.isArray(mistakesData) ? mistakesData : []
}

export function getMistakes() {
  const session = getStudentSession()
  if (!session?.studentUid) return []

  const ids = new Set(
    getStudentAttempts(session.studentUid)
      .map(attempt => attempt.mistakeId)
      .filter(Boolean)
  )

  return getAllMistakes().filter(mistake => ids.has(mistake.id))
}

export function getMistakeById(mistakeId) {
  const wanted = String(mistakeId || '').toLowerCase()
  return (
    getAllMistakes().find(
      mistake => String(mistake.id).toLowerCase() === wanted
    ) || null
  )
}

export function getClasses() {
  return [DEFAULT_CLASS]
}

export function getClassById(classId) {
  return normalizeId(classId) === normalizeId(DEFAULT_CLASS.id)
    ? DEFAULT_CLASS
    : null
}

export function setFocusMistake(mistakeId) {
  writeStorage(FOCUS_KEY, mistakeId)
  return mistakeId
}

export function getFocusMistake() {
  return readStorage(FOCUS_KEY, null)
}

export function clearFocusMistake() {
  localStorage.removeItem(FOCUS_KEY)
}

// Finds the mistake to teach. Order of preference:
// 1) the saved focus mistake
// 2) the most frequent wrong-answer mistake from the student's attempts
// 3) (only if allowDefault) the first mistake, so pages are never empty
export function getResolvedFocusMistake(allowDefault = false) {
  const focusId = getFocusMistake()
  const fromFocus = focusId ? getMistakeById(focusId) : null
  if (fromFocus) return fromFocus

  const session = getStudentSession()

  if (session?.studentUid) {
    const counts = {}

    for (const attempt of getStudentAttempts(session.studentUid)) {
      if (attempt.isCorrect === false && attempt.mistakeId) {
        counts[attempt.mistakeId] = (counts[attempt.mistakeId] || 0) + 1
      }
    }

    const topId = Object.keys(counts).sort(
      (a, b) => counts[b] - counts[a] || a.localeCompare(b)
    )[0]

    const top = topId ? getMistakeById(topId) : null

    if (top) {
      setFocusMistake(top.id)
      return top
    }
  }

  if (allowDefault) {
    return getAllMistakes()[0] || null
  }

  return null
}

export function clearStudentData() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(ATTEMPTS_KEY)
  localStorage.removeItem(FOCUS_KEY)
}