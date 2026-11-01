import questions from '../questions.json'
import mistakes from '../mistakes.json'

export function getFingerprint(attempts = []) {
  const results = Object.fromEntries(
    mistakes.map(mistake => [mistake.id, 'none'])
  )

  if (!Array.isArray(attempts)) return results

  const questionById = new Map(
    questions.map(question => [question.id, question])
  )

  const progress = Object.fromEntries(
    mistakes.map(mistake => [
      mistake.id,
      {
        correctStreak: 0,
        status: 'none',
        wasFixed: false,
        lastCorrectQuestionId: null,
      },
    ])
  )

  const ordered = [...attempts].sort(
    (a, b) =>
      new Date(a.createdAt || 0).getTime() -
      new Date(b.createdAt || 0).getTime()
  )

  for (const attempt of ordered) {
    const question = questionById.get(attempt.questionId)
    if (!question) continue

    const mistakeId = attempt.isCorrect
      ? question.targetMistake || attempt.mistakeId
      : attempt.mistakeId ||
        question.mistakeByOption?.[attempt.selectedOptionId] ||
        question.mistakeId

    const state = progress[mistakeId]
    if (!state) continue

    if (attempt.isCorrect === true) {
      if (state.lastCorrectQuestionId === attempt.questionId) continue

      state.correctStreak += 1
      state.lastCorrectQuestionId = attempt.questionId
      state.status = state.correctStreak >= 2
        ? 'provisionally_fixed'
        : 'improving'
      state.wasFixed = state.correctStreak >= 2
    } else {
      state.status = state.wasFixed ? 'reopened' : 'active'
      state.correctStreak = 0
      state.lastCorrectQuestionId = null
      state.wasFixed = false
    }
  }

  for (const mistake of mistakes) {
    results[mistake.id] = progress[mistake.id].status
  }

  return results
}