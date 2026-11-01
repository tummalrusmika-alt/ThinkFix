import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getResolvedFocusMistake,
  getStudentSession,
  getAllMistakes,
  setFocusMistake,
} from '../lib/data'
import { pick, speak, t, getLanguage } from '../lib/i18n'

const BASICS = [
  {
    title: {
      en: 'What is a fraction?',
      te: 'భిన్నం అంటే ఏమిటి?',
      hi: 'भिन्न क्या है?',
    },
    text: {
      en: 'A fraction shows equal parts of a whole. In 3/4, the bottom number (denominator) says the whole is cut into 4 equal parts. The top number (numerator) says we are talking about 3 of those parts.',
      te: 'భిన్నం అంటే ఒక పూర్ణంలోని సమాన భాగాలు. 3/4లో కింది సంఖ్య (హారం) పూర్ణాన్ని 4 సమాన భాగాలుగా చేశామని చెబుతుంది. పై సంఖ్య (లవం) వాటిలో 3 భాగాల గురించి మాట్లాడుతున్నామని చెబుతుంది.',
      hi: 'भिन्न किसी पूर्ण के बराबर भागों को दर्शाता है। 3/4 में नीचे की संख्या (हर) बताती है कि पूर्ण को 4 बराबर भागों में बाँटा गया है। ऊपर की संख्या (अंश) बताती है कि हम उनमें से 3 भागों की बात कर रहे हैं।',
    },
  },
  {
    title: {
      en: 'Kinds of fractions',
      te: 'భిన్నాల రకాలు',
      hi: 'भिन्नों के प्रकार',
    },
    text: {
      en: 'Proper fraction (3/4): the numerator is smaller than the denominator, so it is less than 1 whole. Improper fraction (7/4): the numerator is bigger than or equal to the denominator. Mixed number (1 3/4): a whole number and a fraction together.',
      te: 'క్రమ భిన్నం (3/4): లవం హారం కంటే చిన్నది, కాబట్టి అది 1 పూర్ణం కంటే తక్కువ. అపక్రమ భిన్నం (7/4): లవం హారం కంటే పెద్దది లేదా సమానం. మిశ్రమ భిన్నం (1 3/4): పూర్ణ సంఖ్య, భిన్నం కలిసి ఉంటాయి.',
      hi: 'उचित भिन्न (3/4): अंश हर से छोटा होता है, इसलिए वह 1 पूर्ण से कम है। विषम भिन्न (7/4): अंश हर से बड़ा या बराबर होता है। मिश्रित भिन्न (1 3/4): पूर्ण संख्या और भिन्न साथ-साथ।',
    },
  },
  {
    title: {
      en: 'Equivalent fractions',
      te: 'సమాన భిన్నాలు',
      hi: 'समतुल्य भिन्न',
    },
    text: {
      en: 'Different fractions can show the same amount. Multiply or divide the top and bottom by the same number: 1/2 = 2/4 = 3/6. The picture of the shaded part stays the same size.',
      te: 'వేర్వేరు భిన్నాలు ఒకే విలువను చూపవచ్చు. లవం, హారం రెండింటినీ ఒకే సంఖ్యతో గుణించండి లేదా భాగించండి: 1/2 = 2/4 = 3/6. రంగు వేసిన భాగం పరిమాణం మారదు.',
      hi: 'अलग-अलग भिन्न एक ही मान दिखा सकते हैं। अंश और हर को एक ही संख्या से गुणा या भाग करें: 1/2 = 2/4 = 3/6। रंगे हुए भाग का आकार वही रहता है।',
    },
  },
  {
    title: {
      en: 'Adding fractions with the same denominator',
      te: 'ఒకే హారం గల భిన్నాలను కలపడం',
      hi: 'समान हर वाले भिन्नों को जोड़ना',
    },
    text: {
      en: 'Add the numerators and keep the denominator: 2/7 + 3/7 = 5/7. You are counting pieces of the same size.',
      te: 'లవాలను కలపండి, హారాన్ని అలాగే ఉంచండి: 2/7 + 3/7 = 5/7. ఒకే పరిమాణం గల ముక్కలను లెక్కిస్తున్నాం.',
      hi: 'अंश जोड़ें और हर वही रखें: 2/7 + 3/7 = 5/7। आप एक ही आकार के टुकड़े गिन रहे हैं।',
    },
  },
  {
    title: {
      en: 'Comparing fractions',
      te: 'భిన్నాలను పోల్చడం',
      hi: 'भिन्नों की तुलना',
    },
    text: {
      en: 'Same denominator: the bigger numerator is bigger. Same numerator: the smaller denominator is bigger (1/3 > 1/4). Different denominators: change to a common denominator first.',
      te: 'హారం సమానమైతే: పెద్ద లవం ఉన్నది పెద్దది. లవం సమానమైతే: చిన్న హారం ఉన్నది పెద్దది (1/3 > 1/4). హారాలు వేరైతే: ముందు ఉమ్మడి హారం చేయండి.',
      hi: 'हर समान हो तो बड़ा अंश बड़ा होता है। अंश समान हो तो छोटा हर बड़ा होता है (1/3 > 1/4)। हर अलग हों तो पहले समान हर बनाएँ।',
    },
  },
]

function toText(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return pick(value) || ''
}

function toList(value, language) {
  if (Array.isArray(value)) return value.map(toText).filter(Boolean)
  if (value && typeof value === 'object') {
    const list = value[language] || value.en || []
    return Array.isArray(list) ? list.map(toText).filter(Boolean) : []
  }
  return []
}

export default function Learn() {
  const navigate = useNavigate()
  const language = getLanguage()

  const hasSession = Boolean(getStudentSession())
  const allMistakes = getAllMistakes()

  const [recommendedId] = useState(() =>
    hasSession ? getResolvedFocusMistake(true)?.id ?? null : null
  )
  const [selectedId, setSelectedId] = useState(recommendedId)

  if (!hasSession) {
    return (
      <main style={styles.page}>
        <section style={styles.emptyCard}>
          <div style={styles.emptyEmoji}>📚</div>
          <h1 style={styles.pageTitle}>{t('student.learn')}</h1>
          <p style={styles.mutedText}>{t('learn.joinFirst')}</p>
          <button
            type="button"
            onClick={() => navigate('/join')}
            style={styles.primaryButton}
          >
            {t('learn.goJoin')}
          </button>
        </section>
      </main>
    )
  }

  const mistake = allMistakes.find(item => item.id === selectedId) || null

  function selectConcept(id) {
    setSelectedId(id)
    setFocusMistake(id)
  }

  const name = mistake ? toText(mistake.name) : ''
  const explanation = mistake ? toText(mistake.explanation) : ''
  const hint = mistake ? toText(mistake.hint) : ''
  const example = mistake ? toText(mistake.example) : ''
  const keyIdeas = mistake ? toList(mistake.keyIdeas, language) : []
  const tryThese = mistake ? toList(mistake.tryThese, language) : []
  const steps = mistake ? toList(mistake.buddySteps, language) : []

  function listenToLesson() {
    const text = [name, explanation, example, hint, ...keyIdeas]
      .filter(Boolean)
      .join('. ')

    if (text) speak(text)
  }

  const conceptColors = [
    '#DCEBFA',
    '#DDEFEF',
    '#FFF0BD',
    '#E8E2FA',
    '#E4EDC9',
    '#FFE3CC'
  ]

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <Link to="/student/dashboard" style={styles.backLink}>
            {t('learn.backDashboard')}
          </Link>
          <span style={styles.headerTag}>{t('learn.header')}</span>
        </header>

        <section style={styles.hero}>
          <div style={styles.heroText}>
            <span style={styles.eyebrow}>{t('learn.space')}</span>
            <h1 style={styles.heroTitle}>{t('student.learn')}</h1>
            <p style={styles.heroDescription}>
              {t('learn.heroDescription')}
            </p>
          </div>
          <div style={styles.heroEmoji}>🌱</div>
        </section>

        <details style={styles.basicsCard}>
          <summary style={styles.basicsSummary}>
            <span style={styles.basicsIcon}>📘</span>
            <span>{t('learn.fractionsBasics')}</span>
            <span style={styles.openLabel}>{t('learn.tapExplore')}</span>
          </summary>

          <div style={styles.basicsContent}>
            {BASICS.map((item, index) => (
              <article key={index} style={styles.basicItem}>
                <span style={styles.basicNumber}>{index + 1}</span>
                <div>
                  <strong style={styles.basicTitle}>
                    {pick(item.title, language)}
                  </strong>
                  <p style={styles.basicText}>
                    {pick(item.text, language)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </details>

        <section style={styles.conceptSection}>
          <div style={styles.sectionHeading}>
            <span style={styles.sectionIcon}>🧭</span>
            <div>
              <h2 style={styles.sectionTitle}>{t('learn.chooseConcept')}</h2>
              <p style={styles.sectionSubtitle}>
                {t('learn.chooseConceptDesc')}
              </p>
            </div>
          </div>

          <div style={styles.conceptGrid}>
            {allMistakes.map((item, index) => {
              const active = item.id === selectedId
              const recommended = item.id === recommendedId

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectConcept(item.id)}
                  style={{
                    ...styles.conceptButton,
                    background: active
                      ? '#DDEFEF'
                      : conceptColors[index % conceptColors.length],
                    border: active
                      ? '2px solid #72AFA3'
                      : '1px solid #E1E5E9',
                    boxShadow: active
                      ? '0 4px 12px #6A9D911F'
                      : 'none'
                  }}
                >
                  <span style={styles.conceptId}>{item.id}</span>
                  <span style={styles.conceptName}>{toText(item.name)}</span>
                  {recommended && <span style={styles.star}>⭐</span>}
                </button>
              )
            })}
          </div>

          <p style={styles.recommendationNote}>
            ⭐ {t('learn.recommended')}
          </p>
        </section>

        {mistake ? (
          <section style={styles.lessonSection}>
            <div style={styles.lessonHeading}>
              <span style={styles.lessonIcon}>💡</span>
              <div>
                <span style={styles.eyebrow}>{t('learn.letsUnderstand')}</span>
                <h2 style={styles.lessonTitle}>{name}</h2>
              </div>
            </div>

            {explanation && (
              <section style={styles.explanationCard}>
                <h3 style={styles.cardHeading}>{t('learn.understandIdea')}</h3>
                <p style={styles.bodyText}>{explanation}</p>
              </section>
            )}

            {example && (
              <section style={styles.exampleCard}>
                <h3 style={styles.cardHeading}>
                  ✏️ {t('student.example')}
                </h3>
                <p style={styles.bodyText}>{example}</p>
              </section>
            )}

            {keyIdeas.length > 0 && (
              <section style={styles.keyCard}>
                <h3 style={styles.cardHeading}>{t('learn.keyIdeas')}</h3>
                <ul style={styles.list}>
                  {keyIdeas.map((idea, index) => (
                    <li key={index} style={styles.listItem}>{idea}</li>
                  ))}
                </ul>
              </section>
            )}

            {hint && (
              <section style={styles.hintCard}>
                <h3 style={styles.cardHeading}>💡 {t('student.hint')}</h3>
                <p style={styles.bodyText}>{hint}</p>
              </section>
            )}

            {steps.length > 0 && (
              <section style={styles.stepsCard}>
                <h3 style={styles.cardHeading}>{t('learn.stepsToFix')}</h3>
                <ol style={styles.list}>
                  {steps.map((step, index) => (
                    <li key={index} style={styles.listItem}>{step}</li>
                  ))}
                </ol>
              </section>
            )}

            {tryThese.length > 0 && (
              <section style={styles.tryCard}>
                <h3 style={styles.cardHeading}>{t('learn.tryThese')}</h3>
                <p style={styles.smallNote}>{t('learn.practiceExamples')}</p>
                <ul style={styles.list}>
                  {tryThese.map((item, index) => (
                    <li key={index} style={styles.listItem}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            <section style={styles.actionCard}>
              <h3 style={styles.actionTitle}>{t('learn.readyNext')}</h3>
              <p style={styles.actionDescription}>
                {t('learn.readyDescription')}
              </p>

              <div style={styles.actionButtons}>
                <button
                  type="button"
                  onClick={listenToLesson}
                  style={styles.listenButton}
                >
                  🔊 {t('student.listen')}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/buddy')}
                  style={styles.primaryButton}
                >
                  {t('student.tryBuddy')} →
                </button>
              </div>
            </section>
          </section>
        ) : (
          <section style={styles.emptyLesson}>
            <div style={styles.emptyEmoji}>🔎</div>
            <h2 style={styles.emptyTitle}>{t('learn.chooseBegin')}</h2>
            <p style={styles.mutedText}>
              {t('learn.choosePrompt')}
            </p>
          </section>
        )}

        <footer style={styles.footer}>
          <span>🌿</span>
          {t('learn.footer')}
        </footer>
      </div>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FFFCF5',
    padding: '26px 18px 45px',
    fontFamily: 'Arial, sans-serif',
    color: '#344B59',
    lineHeight: 1.65,
    boxSizing: 'border-box'
  },
  container: {
    maxWidth: 760,
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22
  },
  backLink: {
    color: '#527C83',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 13
  },
  headerTag: {
    background: '#E4EDC9',
    color: '#58704B',
    padding: '7px 12px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '27px 24px',
    background: 'linear-gradient(120deg, #DCEBFA, #DDEFEF)',
    border: '1px solid #D0E5E8',
    borderRadius: 24,
    marginBottom: 20
  },
  heroText: { flex: 1 },
  eyebrow: {
    color: '#64858A',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.3
  },
  heroTitle: {
    color: '#294E5B',
    fontSize: 30,
    margin: '7px 0'
  },
  heroDescription: {
    color: '#526E78',
    fontSize: 14,
    lineHeight: 1.7,
    margin: 0,
    maxWidth: 490
  },
  heroEmoji: {
    fontSize: 57,
    background: '#FFFFFFAA',
    borderRadius: 20,
    padding: 13
  },
  basicsCard: {
    background: '#FFFFFF',
    border: '1px solid #E9E5D9',
    borderRadius: 19,
    padding: 18,
    marginBottom: 27,
    boxShadow: '0 4px 14px #5B6B730D'
  },
  basicsSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    fontWeight: 800,
    color: '#405E69',
    listStyle: 'none'
  },
  basicsIcon: {
    background: '#FFF0BD',
    padding: 9,
    borderRadius: 12,
    fontSize: 20
  },
  openLabel: {
    marginLeft: 'auto',
    color: '#9B8247',
    fontSize: 11,
    fontWeight: 600
  },
  basicsContent: {
    display: 'grid',
    gap: 17,
    marginTop: 20
  },
  basicItem: {
    display: 'flex',
    gap: 13,
    padding: 14,
    background: '#FFFCF5',
    borderRadius: 14
  },
  basicNumber: {
    flexShrink: 0,
    width: 29,
    height: 29,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#DDEFEF',
    color: '#477E72',
    borderRadius: 10,
    fontWeight: 800
  },
  basicTitle: {
    color: '#405E69',
    fontSize: 14
  },
  basicText: {
    color: '#657780',
    fontSize: 13,
    margin: '5px 0 0'
  },
  conceptSection: { marginBottom: 28 },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  sectionIcon: {
    background: '#E8E2FA',
    padding: 10,
    borderRadius: 14,
    fontSize: 23
  },
  sectionTitle: {
    color: '#344B59',
    fontSize: 20,
    margin: 0
  },
  sectionSubtitle: {
    color: '#829099',
    fontSize: 12,
    margin: '3px 0 0'
  },
  conceptGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 11
  },
  conceptButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    minHeight: 58,
    padding: '12px 13px',
    borderRadius: 15,
    textAlign: 'left',
    color: '#40545E',
    cursor: 'pointer',
    fontSize: 13
  },
  conceptId: {
    fontSize: 10,
    fontWeight: 800,
    color: '#527C83',
    background: '#FFFFFFAA',
    padding: '5px 7px',
    borderRadius: 7
  },
  conceptName: { flex: 1, fontWeight: 700 },
  star: { fontSize: 13 },
  recommendationNote: {
    color: '#8A9290',
    fontSize: 11,
    marginTop: 10
  },
  lessonSection: {
    display: 'grid',
    gap: 15
  },
  lessonHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    padding: '19px',
    background: '#FFFFFF',
    border: '1px solid #E9E5D9',
    borderRadius: 18
  },
  lessonIcon: {
    background: '#FFF0BD',
    padding: 12,
    borderRadius: 14,
    fontSize: 25
  },
  lessonTitle: {
    color: '#344B59',
    fontSize: 22,
    margin: '4px 0 0'
  },
  explanationCard: {
    background: '#FFFFFF',
    border: '1px solid #DCE7F0',
    borderLeft: '5px solid #A8C9E6',
    borderRadius: 17,
    padding: 19
  },
  exampleCard: {
    background: '#DDEFEF',
    border: '1px solid #C7E2DA',
    borderRadius: 17,
    padding: 19
  },
  keyCard: {
    background: '#E8E2FA',
    border: '1px solid #D8CEF1',
    borderRadius: 17,
    padding: 19
  },
  hintCard: {
    background: '#FFF0BD',
    border: '1px solid #F0DFA8',
    borderRadius: 17,
    padding: 19
  },
  stepsCard: {
    background: '#E4EDC9',
    border: '1px solid #D6E3B9',
    borderRadius: 17,
    padding: 19
  },
  tryCard: {
    background: '#FFE3CC',
    border: '1px solid #F2D4B9',
    borderRadius: 17,
    padding: 19
  },
  cardHeading: {
    color: '#405967',
    fontSize: 16,
    margin: '0 0 10px'
  },
  bodyText: {
    color: '#536873',
    fontSize: 14,
    margin: 0,
    lineHeight: 1.8
  },
  list: {
    paddingLeft: 22,
    margin: '8px 0 0',
    color: '#536873'
  },
  listItem: {
    paddingLeft: 4,
    marginBottom: 9,
    fontSize: 14,
    lineHeight: 1.7
  },
  smallNote: {
    color: '#8A796B',
    fontSize: 12,
    margin: '-5px 0 8px'
  },
  actionCard: {
    background: 'linear-gradient(120deg, #DCEBFA, #E8E2FA)',
    border: '1px solid #D8DFEF',
    borderRadius: 19,
    padding: 21,
    marginTop: 5
  },
  actionTitle: {
    color: '#344F64',
    fontSize: 18,
    margin: '0 0 5px'
  },
  actionDescription: {
    color: '#627583',
    fontSize: 13,
    margin: '0 0 17px'
  },
  actionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 11
  },
  listenButton: {
    padding: '12px 17px',
    background: '#FFFFFF',
    color: '#527C83',
    border: '1px solid #C8DDE0',
    borderRadius: 11,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer'
  },
  primaryButton: {
    padding: '12px 19px',
    background: '#527F83',
    color: '#FFFFFF',
    border: 0,
    borderRadius: 11,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer'
  },
  emptyCard: {
    maxWidth: 500,
    margin: '65px auto',
    padding: 30,
    textAlign: 'center',
    background: '#FFFFFF',
    border: '1px solid #E9E5D9',
    borderRadius: 22,
    boxShadow: '0 5px 20px #5B6B7310'
  },
  emptyLesson: {
    textAlign: 'center',
    padding: '30px 22px',
    background: '#FFFFFF',
    border: '1px solid #E9E5D9',
    borderRadius: 19
  },
  emptyEmoji: { fontSize: 45 },
  emptyTitle: {
    color: '#405E69',
    fontSize: 19
  },
  pageTitle: {
    color: '#345967',
    fontSize: 27
  },
  mutedText: {
    color: '#71818A',
    fontSize: 14,
    lineHeight: 1.7
  },
  footer: {
    textAlign: 'center',
    color: '#81918D',
    fontSize: 12,
    padding: '25px 10px 5px'
  }
}