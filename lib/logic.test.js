 
import { getNextStep } from './nextStep.js'

const tests = [
  { score: 0, expected: 'relearn' },
  { score: 33, expected: 'relearn' },
  { score: 67, expected: 'practise' },
  { score: 100, expected: 'challenge' },
]

for (const test of tests) {
  const actual = getNextStep(test.score)

  console.log(
    actual === test.expected ? 'PASS' : 'FAIL',
    `Score ${test.score}: expected ${test.expected}, got ${actual}`
  )
}