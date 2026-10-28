
import questions from '../../data/questions.json'
import mistakes from '../../data/mistakes.json'
import classes from '../../data/classes.json'

const ATTEMPTS_KEY = 'thinkfix_attempts'
const SESSION_KEY = 'thinkfix_student_session'
const QUEUE_KEY = 'thinkfix_pending_attempts'
const FOCUS_KEY = 'thinkfix_focus_mistake'

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getQuestions(
  classId,
  topicId,
  set = 'diagnostic',
  options = {}
) {
  const { excludeSeen = true } = options

  const filtered = questions.filter(question => {
    const matchesClass = question.classId === classId
    const matchesTopic = !topicId || question.topicId === topicId
    const matchesSet = !question.set || question.set === set

    return matchesClass && matchesTopic && matchesSet
  })

  if (set === 'diagnostic') {
    return [...filtered].sort(() => Math.random() - 0.5)
  }

  if (!excludeSeen) {
    return filtered
  }

  const session = getStudentSession()

  const seenIds = new Set(
    readStorage(ATTEMPTS_KEY, [])
      .filter(
        attempt =>
          attempt.studentUid === session?.studentUid &&
          attempt.step === set
      )
      .map(attempt => attempt.questionId)
  )

  return filtered.filter(question => !seenIds.has(question.id))
}

export function getAllQuestions() {
  return questions
}

export function getQuestionsById(questionId) {
  return questions.find(question => question.id === questionId) || null
}

export function getMistakes() {
  return mistakes
}

export function getClasses() {
  return classes
}

export function setFocusMistake(mistakeId) {
  if (mistakeId && !mistakes.some(item => item.id === mistakeId)) {
    throw new Error(`Invalid mistake ID: ${mistakeId}`)
  }

  writeStorage(FOCUS_KEY, mistakeId || null)
}

export function getFocusMistake() {
  return readStorage(FOCUS_KEY, null)
}

export function saveStudentSession(student) {
  if (!student?.studentUid) {
    throw new Error('A valid studentUid is required to save a session.')
  }

  const existingSession = getStudentSession()

  // Preserve the diagnostic run when updating the same student's session.
  // Start a fresh run when creating a new student session.
  const sameStudent =
    existingSession?.studentUid === student.studentUid

  const session = {
    ...student,
    diagnosticRunId:
      student.diagnosticRunId ||
      (sameStudent ? existingSession.diagnosticRunId : null) ||
      createId()
  }

  writeStorage(SESSION_KEY, session)
  return session
}

export function getStudentSession() {
  const session = readStorage(SESSION_KEY, null)

  if (!session) {
    return null
  }

  // Migrate older sessions that do not have a diagnostic run ID.
  if (!session.diagnosticRunId) {
    const updatedSession = {
      ...session,
      diagnosticRunId: createId()
    }

    try {
      writeStorage(SESSION_KEY, updatedSession)
    } catch (error) {
      console.error('Could not update student session:', error)
    }

    return updatedSession
  }

  return session
}

export function saveAttempt(attempt) {
  const required = [
    'studentUid',
    'questionId',
    'selectedOptionId',
    'mistakeId',
    'isCorrect',
    'step',
    'createdAt'
  ]

  for (const field of required) {
    if (
      !Object.prototype.hasOwnProperty.call(attempt, field)
    ) {
      throw new Error(`Missing attempt field: ${field}`)
    }
  }

  const session = getStudentSession()

  if (
    session?.studentUid &&
    session.studentUid !== attempt.studentUid
  ) {
    throw new Error('Attempt student does not match the active session.')
  }

  // Every diagnostic attempt must belong to the current diagnostic run.
  let runId = attempt.runId

  if (attempt.step === 'solve') {
    runId = runId || session?.diagnosticRunId

    if (!runId) {
      throw new Error(
        'Cannot save diagnostic attempt without a diagnostic run ID.'
      )
    }

    // If a caller supplied the run ID first, keep the session in sync.
    if (session && !session.diagnosticRunId) {
      saveStudentSession({
        ...session,
        diagnosticRunId: runId
      })
    }
  }

  const saved = {
    ...attempt,
    ...(runId ? { runId } : {}),
    id: attempt.id || createId()
  }

  try {
    const attempts = readStorage(ATTEMPTS_KEY, [])

    if (!Array.isArray(attempts)) {
      throw new Error('Stored attempts data is invalid.')
    }

    attempts.push(saved)
    writeStorage(ATTEMPTS_KEY, attempts)

    return saved
  } catch (error) {
    try {
      const queue = readStorage(QUEUE_KEY, [])

      if (!Array.isArray(queue)) {
        throw new Error('Stored pending attempts data is invalid.')
      }

      queue.push(saved)
      writeStorage(QUEUE_KEY, queue)
    } catch (queueError) {
      console.error('Could not queue attempt:', queueError)
    }

    throw new Error(
      'Attempt could not be saved. It may have been queued locally.'
    )
  }
}

export function getStudentAttempts(studentUid) {
  if (!studentUid) {
    return []
  }

  const attempts = readStorage(ATTEMPTS_KEY, [])

  if (!Array.isArray(attempts)) {
    return []
  }

  return attempts
    .filter(attempt => attempt.studentUid === studentUid)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    )
}
