
const MISTAKE_IDS = ['M1', 'M2', 'M3', 'M4', 'M5'];

const VALID_STATUSES = [
  'none',
  'active',
  'improving',
  'provisionally_fixed',
  'reopened',
];

function getAttemptTime(attempt) {
  const value = attempt?.createdAt ?? attempt?.timestamp;
  if (value == null) return 0;

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function isValidAttempt(attempt) {
  return (
    attempt &&
    typeof attempt === 'object' &&
    attempt.isValid !== false &&
    attempt.isRepeat !== true &&
    (attempt.type === undefined ||
      ['solve', 'test'].includes(attempt.type))
  );
}

function getFingerprintStatus(attempts) {
  if (!Array.isArray(attempts)) {
    throw new Error('Attempts must be an array.');
  }

  const validAttempts = attempts
    .filter(isValidAttempt)
    .filter(
      (attempt) =>
        typeof (attempt.correct ?? attempt.isCorrect) === 'boolean'
    )
    .sort((a, b) => getAttemptTime(a) - getAttemptTime(b));

  let status = 'none';
  let correctStreak = 0;

  for (const attempt of validAttempts) {
    const correct = attempt.correct ?? attempt.isCorrect;

    if (!correct) {
      status =
        status === 'provisionally_fixed' ||
        status === 'reopened'
          ? 'reopened'
          : 'active';

      correctStreak = 0;
      continue;
    }

    if (status === 'active' || status === 'reopened') {
      correctStreak += 1;
      status = 'improving';

      if (correctStreak >= 2) {
        status = 'provisionally_fixed';
      }
    } else if (status === 'improving') {
      correctStreak += 1;

      if (correctStreak >= 2) {
        status = 'provisionally_fixed';
      }
    }
  }

  return VALID_STATUSES.includes(status) ? status : 'none';
}

function getFingerprint(attempts = [], questions = []) {
  if (!Array.isArray(attempts)) {
    throw new Error('Attempts must be an array.');
  }

  const fingerprint = {};

  for (const mistakeId of MISTAKE_IDS) {
    const relatedAttempts = attempts
      .filter((attempt) => {
        if (!isValidAttempt(attempt)) return false;
        if (attempt.mistakeId !== mistakeId) return false;

        if (
          questions.length > 0 &&
          !questions.some((question) => question.id === attempt.questionId)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => getAttemptTime(a) - getAttemptTime(b));

    fingerprint[mistakeId] = getFingerprintStatus(relatedAttempts);
  }

  return fingerprint;
}

export { getFingerprint, getFingerprintStatus };
export default getFingerprint;
