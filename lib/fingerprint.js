
const MISTAKE_IDS = ['M1', 'M2', 'M3', 'M4', 'M5']

export function getFingerprint(attempts = [], questions = []) {
  const results = Object.fromEntries(
    MISTAKE_IDS.map(id => [id, 'none'])
  )

  if (!Array.isArray(attempts) || !Array.isArray(questions)) {
    return results
  }

  const questionById = new Map(
    questions
      .filter(question => question?.id)
      .map(question => [question.id, question])
  )

  const progress = Object.fromEntries(
    MISTAKE_IDS.map(id => [
      id,
      {
        correctStreak: 0,
        status: 'none',
        wasProvisionallyFixed: false,
        lastCorrectQuestionId: null
      }
    ])
  )

  const relevantAttempts = []

  for (const attempt of attempts) {
    if (!attempt?.questionId) continue

    const question = questionById.get(attempt.questionId)
    if (!question) continue

    const isCorrect = attempt.isCorrect === true

    const mappedMistakeId = isCorrect
      ? question.targetMistake ?? attempt.mistakeId
      : attempt.mistakeId ??
        question.mistakeByOption?.[attempt.selectedOptionId]

    if (!MISTAKE_IDS.includes(mappedMistakeId)) continue

    const timestamp = Date.parse(attempt.createdAt)

    relevantAttempts.push({
      mistakeId: mappedMistakeId,
      questionId: attempt.questionId,
      isCorrect,
      timestamp: Number.isFinite(timestamp) ? timestamp : 0
    })
  }

  relevantAttempts.sort((a, b) => a.timestamp - b.timestamp)

  for (const attempt of relevantAttempts) {
    const state = progress[attempt.mistakeId]

    if (attempt.isCorrect) {
      // A repeated correct answer to the same question does
      // not count as additional evidence of improvement.
      if (state.lastCorrectQuestionId === attempt.questionId) {
        continue
      }

      state.correctStreak += 1
      state.lastCorrectQuestionId = attempt.questionId

      if (state.correctStreak === 1) {
        state.status = 'improving'
      } else {
        state.status = 'provisionally_fixed'
        state.wasProvisionallyFixed = true
      }

      continue
    }

    state.status = state.wasProvisionallyFixed
      ? 'reopened'
      : 'active'

    state.correctStreak = 0
    state.wasProvisionallyFixed = false
    state.lastCorrectQuestionId = null
  }

  for (const mistakeId of MISTAKE_IDS) {
    results[mistakeId] = progress[mistakeId].status
  }

  return results
}
