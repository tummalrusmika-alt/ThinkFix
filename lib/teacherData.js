import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

import { auth, db } from '../firebase.js'
import mistakesData from '../mistakes.json'

function requireTeacher(teacherUid) {
  const currentUser = auth.currentUser

  if (!currentUser || currentUser.uid !== teacherUid) {
    throw new Error('Please sign in with your teacher account.')
  }

  return currentUser
}

function getTime(value) {
  if (!value) return 0

  if (typeof value.toDate === 'function') {
    return value.toDate().getTime()
  }

  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function sortByTime(a, b) {
  return getTime(a.timestamp || a.createdAt) -
    getTime(b.timestamp || b.createdAt)
}

function sortStudentsByJoinTime(a, b) {
  const timeDifference =
    getTime(a.joinedAt) - getTime(b.joinedAt)

  if (timeDifference !== 0) return timeDifference

  return String(a.nickname || '').localeCompare(
    String(b.nickname || '')
  )
}

function normalizeNickname(value) {
  return String(value || '').trim().toLowerCase()
}

// Get the class assigned to the signed-in teacher.
export async function getClass(teacherUid) {
  requireTeacher(teacherUid)

  const teacherSnapshot = await getDoc(
    doc(db, 'teachers', teacherUid)
  )

  if (!teacherSnapshot.exists()) {
    throw new Error('Teacher profile was not found in Firebase.')
  }

  const teacherData = teacherSnapshot.data()

  if (teacherData.role !== 'teacher' || !teacherData.classId) {
    throw new Error('Teacher profile has no valid assigned class.')
  }

  const classSnapshot = await getDoc(
    doc(db, 'classes', teacherData.classId)
  )

  if (!classSnapshot.exists()) {
    throw new Error('The assigned class was not found.')
  }

  return {
    id: classSnapshot.id,
    ...classSnapshot.data(),
    teacherUid,
  }
}

// Return one dashboard row per nickname.
// Repeated anonymous logins are grouped under the same student name.
export async function getStudents(classId) {
  if (!auth.currentUser) {
    throw new Error('Please sign in first.')
  }

  if (!classId) return []

  const studentsQuery = query(
    collection(db, 'students'),
    where('classId', '==', classId)
  )

  const snapshot = await getDocs(studentsQuery)

  const records = snapshot.docs
    .map((item) => {
      const data = item.data()

      return {
        id: item.id,
        ...data,
        authUid: data.authUid || item.id,
      }
    })
    .sort(sortStudentsByJoinTime)

  const groups = new Map()

  for (const student of records) {
    const nickname = normalizeNickname(student.nickname)

    // Keep records with no nickname separate; don't merge blank names.
    const groupKey = nickname
      ? `nickname:${nickname}`
      : `uid:${student.authUid}`

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        ...student,
        allUids: [student.authUid],
      })
      continue
    }

    const group = groups.get(groupKey)

    if (!group.allUids.includes(student.authUid)) {
      group.allUids.push(student.authUid)
    }

    // Keep the earliest login's record as the displayed student row.
    if (getTime(student.joinedAt) < getTime(group.joinedAt)) {
      const allUids = group.allUids

      groups.set(groupKey, {
        ...student,
        allUids,
      })
    }
  }

  return [...groups.values()].sort(sortStudentsByJoinTime)
}

// Load attempts for the class and map repeated login IDs to the
// single dashboard student row for that nickname.
export async function getClassAttempts(classId) {
  if (!auth.currentUser) {
    throw new Error('Please sign in first.')
  }

  if (!classId) return []

  const students = await getStudents(classId)
  const canonicalUidByUid = new Map()

  for (const student of students) {
    for (const uid of student.allUids) {
      canonicalUidByUid.set(uid, student.authUid)
    }
  }

  const attemptsQuery = query(
    collection(db, 'attempts'),
    where('classId', '==', classId)
  )

  const snapshot = await getDocs(attemptsQuery)

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter((attempt) => canonicalUidByUid.has(attempt.studentUid))
    .map((attempt) => ({
      ...attempt,
      studentUid: canonicalUidByUid.get(attempt.studentUid),
    }))
    .sort(sortByTime)
}

// Get all attempts from every login grouped under this student.
export async function getStudentAttempts(studentUid) {
  const teacherUid = auth.currentUser?.uid

  if (!teacherUid) {
    throw new Error('Please sign in with your teacher account.')
  }

  if (!studentUid) return []

  const currentClass = await getClass(teacherUid)
  const students = await getStudents(currentClass.id)

  const studentGroup = students.find(
    (student) =>
      student.id === studentUid ||
      student.authUid === studentUid ||
      student.allUids.includes(studentUid)
  )

  const studentUids = new Set(
    studentGroup?.allUids || [studentUid]
  )

  const attemptsQuery = query(
    collection(db, 'attempts'),
    where('classId', '==', currentClass.id)
  )

  const snapshot = await getDocs(attemptsQuery)

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter((attempt) => studentUids.has(attempt.studentUid))
    .sort(sortByTime)
}

// Mistake descriptions are stored in the local JSON file.
export async function getMistakes(classId) {
  if (!classId) return []

  return Array.isArray(mistakesData)
    ? mistakesData
    : []
}