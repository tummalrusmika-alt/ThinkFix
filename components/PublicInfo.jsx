const faqs = [
  {
    question: 'What is ThinkFix?',
    answer:
      'ThinkFix is a learning app where students join a class, solve questions, and review mistakes. Teachers can review class progress and common mistakes.',
  },
  {
    question: 'How does a student use ThinkFix?',
    answer:
      'A student joins a class with the code from their teacher, solves questions, and reviews feedback on mistakes.',
  },
  {
    question: 'What can teachers do with ThinkFix?',
    answer:
      'Teachers can review class progress, spot common mistakes, and open individual student details.',
  },
  {
    question: 'How does ThinkFix help students learn from mistakes?',
    answer:
      'ThinkFix shows feedback after an answer and provides learning and practice focused on mistakes.',
  },
]

export default function PublicInfo() {
  return (
    <div className="mt-16 space-y-14 border-t border-[#DCE7E2] pt-12">
      <section aria-labelledby="how-thinkfix-works">
        <h2
          id="how-thinkfix-works"
          className="text-3xl font-black text-[#254C49]"
        >
          How ThinkFix works
        </h2>

        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          <li className="rounded-2xl border border-[#DCE7E2] bg-white p-6">
            <h3 className="text-xl font-bold text-[#254C49]">1. Join a class</h3>
            <p className="mt-2 leading-7 text-[#526B67]">
              Students enter the class code provided by their teacher.
            </p>
          </li>

          <li className="rounded-2xl border border-[#DCE7E2] bg-white p-6">
            <h3 className="text-xl font-bold text-[#254C49]">2. Solve questions</h3>
            <p className="mt-2 leading-7 text-[#526B67]">
              Students practise questions and see feedback on their answers.
            </p>
          </li>

          <li className="rounded-2xl border border-[#DCE7E2] bg-white p-6">
            <h3 className="text-xl font-bold text-[#254C49]">
              3. Learn from mistakes
            </h3>
            <p className="mt-2 leading-7 text-[#526B67]">
              Students review mistakes and practise the skills they need to improve.
            </p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="thinkfix-faq">
        <h2
          id="thinkfix-faq"
          className="text-3xl font-black text-[#254C49]"
        >
          ThinkFix questions and answers
        </h2>

        <div className="mt-6 space-y-4">
          {faqs.map(({ question, answer }) => (
            <details
              key={question}
              className="rounded-2xl border border-[#DCE7E2] bg-white p-5"
            >
              <summary className="cursor-pointer text-lg font-bold text-[#254C49]">
                {question}
              </summary>
              <p className="mt-3 leading-7 text-[#526B67]">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}