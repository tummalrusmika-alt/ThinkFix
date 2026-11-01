import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase.js'

import questions from './questions.json'
import mistakes from './mistakes.json'

const CLASS_ID = 'class6a'
const CLASS_CODE = 'FIX123'

export async function seedData() {
  if (!Array.isArray(questions) || !Array.isArray(mistakes)) {
    throw new Error('Invalid question or mistake data.')
  }

  const batch = writeBatch(db)

  batch.set(
    doc(db, 'classes', CLASS_ID),
    {
      className: 'Class 6A',
      subject: 'Mathematics',
      topicIds: ['algebra'],
    },
    { merge: true }
  )

  batch.set(doc(db, 'classCodes', CLASS_CODE), {
    classId: CLASS_ID,
  })

  for (const question of questions) {
    if (!question.id) {
      throw new Error('Question is missing an ID.')
    }

    batch.set(
      doc(db, 'questions', question.id),
      {
        ...question,
        classId: CLASS_ID,
      },
      { merge: true }
    )
  }

  for (const mistake of mistakes) {
    if (!mistake.id) {
      throw new Error('Mistake is missing an ID.')
    }

    batch.set(
      doc(db, 'mistakes', mistake.id),
      {
        ...mistake,
        classId: CLASS_ID,
      },
      { merge: true }
    )
  }

  await batch.commit()

  return `${questions.length} questions and ${mistakes.length} mistakes uploaded successfully.`
}