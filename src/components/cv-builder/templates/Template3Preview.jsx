const EMPTY_VALUE = ' '

function valueOrBlank(value, fallback = EMPTY_VALUE) {
  return value || fallback
}

function lines(value) {
  return String(value || '').split('\n').filter(Boolean)
}

function DetailRow({ label, value, arabic, gold = false }) {
  return (
    <tr>
      <td className={gold ? 'cv-t3-label cv-t3-gold' : 'cv-t3-label'}>{label}</td>
      <td className="cv-t3-value">{valueOrBlank(value)}</td>
      <td className="cv-t3-arabic cv-t3-gold" dir="rtl">{arabic}</td>
    </tr>
  )
}

function LevelRow({ label, english, arabic, arabicLabel }) {
  return (
    <tr>
      <td className="cv-t3-language-label">{label}</td>
      <td>{valueOrBlank(english)}</td>
      <td>{valueOrBlank(arabic)}</td>
      <td className="cv-t3-gold" dir="rtl">{arabicLabel}</td>
    </tr>
  )
}

// This template's language table has four fixed rows, while the builder offers
// the reference form's levels (NONE/LITTLE/BASIC/GOOD/FLUENT/EXCELLENT). Each
// level folds onto the nearest row so the tick still lands where it belongs.
const LEVEL_ROWS = {
  none: 'POOR',
  poor: 'POOR',
  little: 'LITTLE',
  basic: 'LITTLE',
  beginner: 'LITTLE',
  fair: 'FAIR',
  good: 'FAIR',
  fluent: 'FLUENT',
  excellent: 'FLUENT',
}

function levelTick(value, row) {
  return LEVEL_ROWS[String(value || '').trim().toLowerCase()] === row ? '✓' : ''
}

export default function Template3Preview({ draft }) {
  const education = lines(draft.additionalEducation)
  const destination = valueOrBlank(draft.destination, 'SAUDI ARABIA')
  const idNumber = valueOrBlank(draft.idNumber, '30132445')

  return (
    <div className="cv-template-scroll" data-testid="template-3-scroll">
      <article
        data-testid="template-3-preview"
        className="cv-template-print-area cv-template-3"
        aria-label="Template 3 CV - Naim Investments maroon and gold"
      >
        <header className="cv-t3-letterhead">
          <div className="cv-t3-logo-slot">
            <img src="/assets/naim-agency-logo.webp" alt="Naim Agency logo" />
          </div>
          <div className="cv-t3-brand">
            <h2>Naim Investments</h2>
          </div>
        </header>
        <p className="cv-t3-contact">
          P O Box 80249-80100 Mombasa, Kenya. Tel/Fax: +254 41 2317883, Mobile: {valueOrBlank(draft.companyPhone)}
        </p>

        <table className="cv-t3-intro">
          <tbody>
            <tr className="cv-t3-maroon cv-t3-name-row">
              <th>NAME IN FULL</th>
              <td>{valueOrBlank(draft.fullName)}</td>
              <th>Tel No: {valueOrBlank(draft.contact)}</th>
              <th dir="rtl">الاسم الكامل</th>
            </tr>
            <tr>
              <th>NEXT OF KIN:</th>
              <td>{valueOrBlank(draft.nextOfKin)}</td>
              <th colSpan={2}>Tel NO: {valueOrBlank(draft.emergencyContact)}</th>
            </tr>
            <tr>
              <th>KINSHIP:</th>
              <td>{valueOrBlank(draft.kinship)}</td>
              <th colSpan={2}>{valueOrBlank(draft.otherEmergencyInfo)}</th>
            </tr>
          </tbody>
        </table>

        <section className="cv-t3-main-grid">
          <div className="cv-t3-profile-photo"><span>Profile Photo</span></div>
          <div className="cv-t3-placement">
            <table>
              <tbody>
                <tr>
                  <th className="cv-t3-maroon">REF.<br />NO</th>
                  <td>{valueOrBlank(draft.referenceNumber, '001')}</td>
                  <th className="cv-t3-maroon">DATE</th>
                  <td>{valueOrBlank(draft.referenceDate, '18/JUL/2025')}</td>
                  <th className="cv-t3-maroon">TO</th>
                  <td>{destination}</td>
                </tr>
                <tr>
                  <th>BROKER:</th>
                  <td colSpan={3}>{valueOrBlank(draft.companyName)}</td>
                  <th>Tel:</th>
                  <td>{valueOrBlank(draft.companyPhone)}</td>
                </tr>
                <tr>
                  <th className="cv-t3-gold">Post<br />applied<br />for</th>
                  <td colSpan={4} className="cv-t3-position-value">{valueOrBlank(draft.position)}<br />KSA (CLIENT)</td>
                  <td className="cv-t3-gold" dir="rtl">{valueOrBlank(draft.positionArabic)}</td>
                </tr>
                <tr>
                  <th className="cv-t3-gold">Monthly<br />Salary</th>
                  <td colSpan={4}>{valueOrBlank(draft.salary)}</td>
                  <td className="cv-t3-gold" dir="rtl">الراتب الشهري</td>
                </tr>
                <tr>
                  <th className="cv-t3-gold">Contract<br />period</th>
                  <td colSpan={4}>{EMPTY_VALUE}</td>
                  <td className="cv-t3-gold" dir="rtl">مدة العقد</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="cv-t3-details-grid">
          <div>
            <table className="cv-t3-applicant">
              <tbody>
                <tr className="cv-t3-section-title"><th colSpan={2}>APPLICANT DETAILS</th><th dir="rtl">بيانات صاحب العمل</th></tr>
                <DetailRow label="Nationality" value={draft.nationality} arabic="الجنسية" gold />
                <DetailRow label="Religion" value={draft.religion} arabic="الديانة" gold />
                <DetailRow label="Date of Birth" value={draft.dateOfBirth} arabic="تاريخ الميلاد" gold />
                <DetailRow label="Age" value={draft.age} arabic="العمر" gold />
                <DetailRow label="Place of birth" value={draft.placeOfBirth} arabic="مكان الميلاد" gold />
                <DetailRow label="Living Area" value={draft.address} arabic="مكان السكن" gold />
                <DetailRow label="Marital Status" value={draft.civilStatus} arabic="الحالة الاجتماعية" gold />
                <DetailRow label="Children" value={draft.numberOfKids} arabic="الأطفال" gold />
                <DetailRow label="Weight" value={draft.weight} arabic="الوزن" gold />
                <DetailRow label="Height" value={draft.height} arabic="الطول" gold />
                <DetailRow label="Complexion" value={valueOrBlank(draft.complexion, 'N/A')} arabic="لون البشرة" gold />
                <tr className="cv-t3-education-row">
                  <td className="cv-t3-label cv-t3-gold">Educational<br />Qualifications</td>
                  <td>
                    <strong>{valueOrBlank(draft.educationLevel)}</strong>
                    {education.map((line) => <span key={line}>{line}</span>)}
                    <span>{valueOrBlank(draft.educationPeriod)}</span>
                    <span>N/A</span>
                  </td>
                  <td className="cv-t3-arabic cv-t3-gold" dir="rtl">الدرجة العلمية</td>
                </tr>
              </tbody>
            </table>

            <table className="cv-t3-languages">
              <tbody>
                <tr className="cv-t3-section-title"><th colSpan={3}>LANGUAGES</th><th dir="rtl">إجادة اللغات</th></tr>
                <tr className="cv-t3-maroon"><th>ENGLISH</th><th dir="rtl">إنجليزي</th><th>ARABIC</th><th dir="rtl">عربي</th></tr>
                <LevelRow label="POOR" english={levelTick(draft.englishLevel, 'POOR')} arabic={levelTick(draft.arabicLevel, 'POOR')} arabicLabel="لا شيء" />
                <LevelRow label="LITTLE" english={levelTick(draft.englishLevel, 'LITTLE')} arabic={levelTick(draft.arabicLevel, 'LITTLE')} arabicLabel="قليل" />
                <LevelRow label="FAIR" english={levelTick(draft.englishLevel, 'FAIR')} arabic={levelTick(draft.arabicLevel, 'FAIR')} arabicLabel="وسط" />
                <LevelRow label="FLUENT" english={levelTick(draft.englishLevel, 'FLUENT')} arabic={levelTick(draft.arabicLevel, 'FLUENT')} arabicLabel="" />
              </tbody>
            </table>

            <table className="cv-t3-employment">
              <tbody>
                <tr className="cv-t3-section-title"><th colSpan={2}>PREVIOUS EMPLOYMENT ABROAD</th><th dir="rtl">الخبرة خارج البلاد</th></tr>
                <tr className="cv-t3-maroon"><th>COUNTRY</th><td>{valueOrBlank(draft.workCountry)}</td><th dir="rtl">البلد</th></tr>
                <tr><th className="cv-t3-gold">PERIOD</th><td>{valueOrBlank(draft.workYears)}</td><th className="cv-t3-gold" dir="rtl">المدة</th></tr>
              </tbody>
            </table>
          </div>

          <div className="cv-t3-passport-column">
            <table>
              <tbody>
                <tr className="cv-t3-section-title"><th colSpan={2}>PASSPORT DETAILS</th><th dir="rtl">بيانات جواز السفر</th></tr>
                <DetailRow label="Passport No." value={draft.passportNumber} arabic="رقم الجواز" gold />
                <DetailRow label="Date of Issue" value={draft.dateIssued} arabic="تاريخ الإصدار" gold />
                <DetailRow label="Place of Issue" value={draft.placeIssued} arabic="مكان الإصدار" gold />
                <DetailRow label="Date of Exp." value={draft.dateExpiry} arabic="تاريخ الانتهاء" gold />
                <DetailRow label="ID Number:" value={idNumber} arabic="" gold />
                <tr className="cv-t3-photo-title"><th colSpan={3}>PHOTO</th></tr>
                <tr><td colSpan={3} className="cv-t3-full-photo"><span>Full Body Photo</span></td></tr>
                <tr><td colSpan={3} className="cv-t3-medical">CASE OF OLD SICKNESS : {valueOrBlank(draft.medicalHistory, 'N/A')}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="cv-t3-work">
          <div className="cv-t3-work-title"><span>WORK EXPERIENCE</span><span dir="rtl">خبرة العمل</span></div>
          <div className="cv-t3-work-items">
            <span>Baby Sitting</span>
            <span>Cleaning</span>
            <span>Washing</span>
          </div>
        </section>
      </article>
    </div>
  )
}
