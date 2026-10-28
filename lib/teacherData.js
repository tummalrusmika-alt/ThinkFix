
import classes from '../../data/mock-class.json';
import students from '../../data/mock-students.json';
import attempts from '../../data/mock-attempts.json';
import mistakes from '../../data/mistakes.json';

function sortOldestFirst(a, b) {
  return new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0);
}

function sortNewestFirst(a, b) {
  return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
}

export async function getClass(teacherUid) {
  if (!teacherUid) return null;

  return (
    classes.find((item) => item.teacherUid === teacherUid) ?? null
  );
}

export async function getStudents(classId) {
  if (!classId) return [];

  return students.filter((student) => student.classId === classId);
}

export async function getClassAttempts(classId) {
  if (!classId) return [];

  const classStudentUids = new Set(
    students
      .filter((student) => student.classId === classId)
      .map((student) => student.authUid)
      .filter(Boolean)
  );

  return attempts
    .filter((attempt) => classStudentUids.has(attempt.studentUid))
    .sort(sortOldestFirst);
}

export async function getMistakes(classId) {
  if (!classId) return [];

  return mistakes.filter((mistake) => mistake.classId === classId);
}

export async function getStudentAttempts(studentUid) {
  if (!studentUid) return [];

  return attempts
    .filter((attempt) => attempt.studentUid === studentUid)
    .sort(sortNewestFirst);
}
