const EMPTY_VALUE = ' '

const PERSONAL_ROWS = [
  ['Full name', 'الاسم الكامل', 'fullName'],
  ['Nationality', 'الجنسية', 'nationality'],
  ['Religion', 'الديانة', 'religion'],
  ['Age', 'العمر', 'age'],
  ['Date of birth', 'تاريخ الميلاد', 'dateOfBirth'],
  ['Weight', 'الوزن', 'weight'],
  ['Height', 'الطول', 'height'],
  ['Number of children', 'عدد الأطفال', 'numberOfKids'],
  ['Marital Status', 'الحالة الاجتماعية', 'civilStatus'],
  ['Passport number', 'رقم الجواز', 'passportNumber'],
]

const SKILL_ROWS = [
  ['Elderly Care', 'رعاية كبار السن', ['CARING ELDERS', 'ELDERLY CARE']],
  ['Child Care', 'رعاية الأطفال', ['BABYSITTING', 'CHILD CARE']],
  ['Housework', 'أعمال المنزل', ['CLEANING', 'WASHING', 'IRONING', 'HOUSEWORK']],
  ['Cooking', 'الطبخ', ['COOKING', 'ARABIC DISH COOKING']],
  ['Sewing', 'الخياطة', ['SEWING']],
  ['Computer Use', 'استخدام الكمبيوتر', ['COMPUTER USE']],
]

function valueOrBlank(value) {
  return value || EMPTY_VALUE
}

function normalizedRemarks(value) {
  return value?.replace(/\s+/g, ' ').trim() || EMPTY_VALUE
}

function FieldRow({ english, arabic, value }) {
  return (
    <div className="cv-t5-field-row">
      <span className="cv-t5-field-label">• {english}</span>
      <strong>{valueOrBlank(value)}</strong>
      <span className="cv-t5-field-arabic" dir="rtl">: {arabic} •</span>
    </div>
  )
}

function SectionHeading({ english, arabic }) {
  return (
    <div className="cv-t5-section-heading">
      <h3>{english} :</h3>
      <h3 dir="rtl">{arabic} <span aria-hidden="true">●</span></h3>
    </div>
  )
}

function hasSkill(skills, aliases) {
  const selected = skills.map((skill) => skill.trim().toUpperCase())
  return aliases.some((alias) => selected.some((skill) => skill.includes(alias)))
}

export default function Template5Preview({ draft }) {
  return (
    <div className="cv-template-scroll" data-testid="template-5-scroll">
      <article
        data-testid="template-5-preview"
        className="cv-template-print-area cv-template-5"
        aria-label="Template 5 CV - Domestic Helper Almelhem layout"
      >
        <section className="cv-t5-page cv-t5-page-one">
          <header className="cv-t5-letterhead">
            <h2>DOMESTIC HELPER</h2>
            <div className="cv-t5-agency-block">
              <div className="cv-t5-logo">
                <svg
                  role="img"
                  aria-label="Almelhem Recruitment Office logo"
                  viewBox="0 0 88 64"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="none" stroke="#d99b18" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 45c5-1 10-4 14-9 3-4 5-9 6-15" strokeWidth="2.2" />
                    <path d="M67 45c-5-1-10-4-14-9-3-4-5-9-6-15" strokeWidth="2.2" />
                    <path d="M25 42c-4-3-7-7-9-12M30 38c-5-1-9-4-12-8M33 33c-5-1-9-3-12-6M63 42c4-3 7-7 9-12M58 38c5-1 9-4 12-8M55 33c5-1 9-3 12-6" strokeWidth="1.6" />
                    <path d="M32 16c3-4 7-6 12-6s9 2 12 6l-5 3H37l-5-3Z" fill="#d99b18" strokeWidth="1" />
                    <path d="M33 22h22M34 25h20" strokeWidth="1.5" />
                    <path d="M35 27c0 9 3 16 9 20 6-4 9-11 9-20" fill="#fffaf2" strokeWidth="2" />
                    <path d="M39 31h10v10H39zM44 31v10M39 36h10" strokeWidth="1.25" />
                    <path d="M36 48h16M32 51h24" strokeWidth="1.7" />
                  </g>
                  <text x="44" y="58" fill="#d99b18" fontFamily="Arial, sans-serif" fontSize="5.2" fontWeight="700" textAnchor="middle">ALMELHEM</text>
                </svg>
              </div>
              <div className="cv-t5-agency-copy">
                <strong dir="rtl">مكتب محمد عبدالله الملحم للإستقدام</strong>
                <small>Mohammed Abdullah Abdulaziz Almelhem Recruitment Office</small>
              </div>
            </div>
          </header>

          <div className="cv-t5-worker-strip">
            <strong>Worker data :</strong>
            <span>NAIM</span>
          </div>

          <SectionHeading english="" arabic="بيانات العامل / ـة الشخصية" />

          <div className="cv-t5-personal-grid">
            <div className="cv-t5-full-photo">FULL BODY PHOTO</div>
            <div className="cv-t5-personal-details">
              <div className="cv-t5-passport-photo">PASSPORT SIZE PHOTO</div>
              <div className="cv-t5-personal-rows">
                {PERSONAL_ROWS.map(([english, arabic, key]) => (
                  <FieldRow key={key} english={english} arabic={arabic} value={draft[key]} />
                ))}
              </div>
            </div>
          </div>

          <section className="cv-t5-contract-section">
            <SectionHeading english="Contract duration and Monthly Salary" arabic="مدة العقد والراتب الشهري" />
            <div className="cv-t5-two-column-fields">
              <FieldRow english="Duration of Insurance" arabic="مدة العقد" value={draft.workYears} />
              <FieldRow english="Month salary" arabic="الراتب الشهري" value={draft.salary} />
            </div>
          </section>

          <section className="cv-t5-education-section">
            <SectionHeading english="Educational level and language" arabic="مستوى التعليمي واللغة" />
            <div className="cv-t5-list-panel">
              <FieldRow english="Educational Level" arabic="المستوى التعليمي" value={draft.educationLevel} />
              <FieldRow english="English Language" arabic="اللغة الإنجليزية" value={draft.englishLevel} />
              <FieldRow english="Arabic Language" arabic="اللغة العربية" value={draft.arabicLevel} />
            </div>
          </section>

          <section className="cv-t5-work-section">
            <SectionHeading english="Work experience" arabic="خبرة العمل" />
            <div className="cv-t5-list-panel">
              <FieldRow english="Previously Worked" arabic="سبق لها العمل" value={draft.workPosition} />
              <FieldRow english="Duration (years)" arabic="المدة (سنوات)" value={draft.workYears} />
              <FieldRow english="City" arabic="المدينة" value={draft.workCity || draft.workCountry} />
            </div>
          </section>
        </section>

        <section className="cv-t5-page cv-t5-page-two">
          <section className="cv-t5-skills-section">
            <SectionHeading english="Skills and experience" arabic="المهارات والخبرات" />
            <div className="cv-t5-skills-panel">
              {SKILL_ROWS.map(([english, arabic, aliases]) => (
                <div key={english} className="cv-t5-skill-row" data-skill-check={english}>
                  <span>• {english}</span>
                  <strong>{hasSkill(draft.skills, aliases) ? '✓' : EMPTY_VALUE}</strong>
                  <span dir="rtl">: {arabic} •</span>
                </div>
              ))}
            </div>
          </section>

          <section className="cv-t5-other-section">
            <SectionHeading english="Other experiences" arabic="خيارات أخرى" />
            <p>{normalizedRemarks(draft.remarks)}</p>
          </section>
        </section>
      </article>
    </div>
  )
}
