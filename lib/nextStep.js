
export function getNextStep(score) {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
    throw new Error('Score must be a number between 0 and 100.');
  }

  if (numericScore < 40) {
    return 'relearn';
  }

  if (numericScore < 76) {
    return 'practise';
  }

  return 'challenge';
}

export default getNextStep;
