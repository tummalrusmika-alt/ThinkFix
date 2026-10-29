
const VALID_STATUSES = [
  "none",
  "active",
  "improving",
  "provisionally_fixed",
  "reopened",
];

function getFingerprintStatus(attempts) {
  if (!Array.isArray(attempts)) {
    throw new Error("Attempts must be an array");
  }

  const validAttempts = attempts
    .filter((attempt) => {
      if (!attempt || typeof attempt !== "object") return false;
      if (attempt.isValid !== true) return false;
      if (attempt.isRepeat === true) return false;
      if (
  attempt.type !== undefined &&
  !["solve", "test"].includes(attempt.type)
) {
  return false;
}

if (typeof attempt.correct !== "boolean") return false;

if (attempt.timestamp === undefined || attempt.timestamp === null) {
  return true;
}

const time = new Date(attempt.timestamp).getTime();
return Number.isFinite(time);
    })
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    );

  if (validAttempts.length === 0) {
    return "none";
  }

  let status = "none";

  for (const attempt of validAttempts) {
    if (attempt.correct === false) {
      if (status === "provisionally_fixed" || status === "reopened") {
        status = "reopened";
      } else {
        status = "active";
      }
    } else {
      if (status === "active" || status === "reopened") {
        status = "improving";
      } else if (status === "improving") {
        status = "provisionally_fixed";
      }
    }
  }

  return VALID_STATUSES.includes(status) ? status : "none";
}

export { getFingerprintStatus };
