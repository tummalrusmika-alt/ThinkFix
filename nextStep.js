
function getNextStep(scorePercent) {
  if (
    typeof scorePercent !== "number" ||
    !Number.isFinite(scorePercent) ||
    scorePercent < 0 ||
    scorePercent > 100
  ) {
    throw new Error("Score must be a number between 0 and 100");
  }

  if (scorePercent <= 39) {
    return "relearn";
  }

  if (scorePercent <= 75) {
    return "practise";
  }

  return "challenge";
}

export { getNextStep };
