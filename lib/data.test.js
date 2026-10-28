
import {
  getQuestions,
  getMistakes,
  getClasses,
  saveAttempt,
  getStudentAttempts
} from './data.js'

export function runDataCheck() {
  const classId = 'class6a'
  const topicId = 'fractions'

  const available = getQuestions(classId, topicId)
  console.log('Questions:', available)
  console.log('Mistakes:', getMistakes())
  console.log('Classes:', getClasses())

  const attempt = {
    studentUid: 'sample-student',
    questionId: 'Q1',
    selectedOptionId: 'B',
    mistakeId: null,
    isCorrect: true,
    step: 'solve',
    createdAt: new Date().toISOString()
  }

  saveAttempt(attempt)

  console.log(
    'Saved attempts:',
    getStudentAttempts('sample-student')
  )
}