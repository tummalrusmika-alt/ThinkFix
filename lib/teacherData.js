import { collection, getDocs } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'

import { auth, db } from '../firebase.js'
import mistakesData from '../mistakes.json'

const DEMO_CLASS_ID = 'class6a'

function normalizeId(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function getTime(item) {
  return (
    item.timestamp?.toDate?.()?.getTime() ||
    new Date(item.createdAt || 0).getTime() ||
    0
  )
}

function sortByTime(a, b) {
  return getTime(a) - getTime(b)
}

// The teacher login is a demo login, so make sure Firebase has a user
// before reading data (Firestore rules usually need a signed-in user).
async function ensureSignedIn() {
  try {
    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady()
    }

    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
  } catch (error) {
    console.warn('Could not sign in for teacher data:', error)
  }
}

export async function getClass(teacherUid) {
  if (!teacherUid) return null
  if (teacherUid !== 'teacher-demo-1') return null

  return {
    id: DEMO_CLASS_ID,
    className: 'Class 6A',
    topicIds: ['fractions'],
    teacherUid,
  }
}

// Returns ONE entry per student. Records with the same nickname
// (created by joining several times) are merged together.
export async function getStudents(classId) {
  if (!classId) return []

  await ensureSignedIn()

  const snapshot = await getDocs(collection(db, 'students'))

  const all = snapshot.docs.map(item => {
    const data = item.data()

    return {
      id: item.id,
      ...data,
      authUid: data.authUid || item.id,
    }
  })

  const matching = all.filter(
    student => normalizeId(student.classId) === normalizeId(classId)
  )

  // Demo mode: if nothing matches the class ID, use every joined student.
  const pool = matching.length > 0 ? matching : all

  const groups = new Map()

  for (const student of pool) {
    const nick = String(student.nickname || '').trim().toLowerCase()
    const key = nick ? `nick:${nick}` : `id:${student.id}`

    if (!groups.has(key)) {
      groups.set(key, { ...student, allUids: [student.authUid] })
    } else {
      const group = groups.get(key)

      if (!group.allUids.includes(student.authUid)) {
        group.allUids.push(student.authUid)
      }
    }
  }

  return [...groups.values()]
}

export async function getClassAttempts(classId) {
  if (!classId) return []

  const students = await getStudents(classId)

  // Map every old user ID to the one ID kept for that student.
  const canonicalByUid = new Map()

  for (const student of students) {
    for (const uid of student.allUids) {
      canonicalByUid.set(uid, student.authUid)
    }
  }

  const snapshot = await getDocs(collection(db, 'attempts'))

  return snapshot.docs
    .map(item => ({ id: item.id, ...item.data() }))
    .filter(attempt => canonicalByUid.has(attempt.studentUid))
    .map(attempt => ({
      ...attempt,
      studentUid: canonicalByUid.get(attempt.studentUid),
    }))
    .sort(sortByTime)
}

export async function getStudentAttempts(studentUid) {
  if (!studentUid) return []

  const students = await getStudents(DEMO_CLASS_ID)

  const group = students.find(student =>
    student.allUids.includes(studentUid)
  )

  const uids = new Set(group ? group.allUids : [studentUid])

  const snapshot = await getDocs(collection(db, 'attempts'))

  return snapshot.docs
    .map(item => ({ id: item.id, ...item.data() }))
    .filter(attempt => uids.has(attempt.studentUid))
    .sort(sortByTime)
}

export async function getMistakes(classId) {
  if (!classId) return []
  return mistakesData
}