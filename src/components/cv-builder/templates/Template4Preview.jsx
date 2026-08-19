const EMPTY_VALUE = ' '

function valueOrBlank(value, fallback = EMPTY_VALUE) {
  return value || fallback
}

function hasSkill(skills, ...matches) {
  return skills.some((skill) => matches.some((match) => skill.toUpperCase().includes(match)))
}

function PhotoPlaceholder({ type }) {
  return (
    <div className={`cv-t4-photo-placeholder cv-t4-photo-${type}`}>
      <span className="cv-t4-person-icon" aria-hidden="true" />
      <span>{type === 'profile' ? 'Profile Photo' : 'Full Body Photo'}</span>
    </div>
  )
}

function ApplicationRow({ english, value, arabic }) {
  return (
    <tr>
      <td>{english}</td>
      <td className="cv-t4-value">{valueOrBlank(value)}</td>
      <td className="cv-t4-arabic" dir="rtl">{arabic}</td>
    </tr>
  )
}

function SkillRow({ left, leftArabic, leftEnabled, right, rightArabic, rightEnabled }) {
  return (
    <tr>
      <td>{left}</td>
      <td className="cv-t4-value">{leftEnabled ? 'YES' : 'NO'}</td>
      <td className="cv-t4-arabic" dir="rtl">{leftArabic}</td>
      <td>{right}</td>
      <td className="cv-t4-value">{rightEnabled ? 'YES' : 'NO'}</td>
      <td className="cv-t4-arabic" dir="rtl">{rightArabic}</td>
    </tr>
  )
}

function Letterhead({ draft, arabic = false }) {
  return (
    <header className="cv-t4-letterhead">
      <div className="cv-t4-logo">
        <img src="/assets/naim-agency-logo.png" alt="Naim Agency logo" />
      </div>
      <div className="cv-t4-heading-block">
        <h2>{arabic ? valueOrBlank(draft.companyNameArabic, 'شركة نعيم للاستثمارات المحدودة') : 'NAIM INVESTMENTS LIMITED'}</h2>
        <div className="cv-t4-contact-lines">
          <span>Email: admin@naiminvestments.com</span>
          <span>Website: www.naiminvestments.com</span>
          <span>Contact: {valueOrBlank(draft.companyPhone)} or +254799859792</span>
        </div>
        <h3>{arabic ? 'طلب توظيف' : 'APPLICATION FOR EMPLOYMENT'}</h3>
        <p dir="rtl">استمارة طلب عمل</p>
        <strong>{arabic ? 'وكالة نعيم - كينيا' : 'NAIM AGENCY-KENYA'}</strong>
      </div>
      <PhotoPlaceholder type="profile" />
    </header>
  )
}

function EnglishPage({ draft, skills }) {
  return (
    <section className="cv-t4-page cv-t4-page-english" aria-label="Template 4 English application page">
      <Letterhead draft={draft} />

      <table className="cv-t4-name-strip">
        <tbody>
          <tr>
            <th>NAME: {valueOrBlank(draft.fullName)}</th>
            <th>AGE: {valueOrBlank(draft.age, '22 YEARS')}</th>
          </tr>
        </tbody>
      </table>

      <div className="cv-t4-application-grid">
        <div className="cv-t4-photo-column">
          <table className="cv-t4-summary-table">
            <thead>
              <tr><th>Ref</th><th>Religion</th><th>Height</th><th>Weight</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>{valueOrBlank(draft.referenceNumber, 'GDAL09/S')}</td>
                <td>{valueOrBlank(draft.religion, 'CHRISTIAN')}</td>
                <td>{valueOrBlank(draft.height, '5.4 FT')}</td>
                <td>{valueOrBlank(draft.weight, '54 KGs')}</td>
              </tr>
            </tbody>
          </table>
          <PhotoPlaceholder type="full" />
        </div>

        <div className="cv-t4-details-column">
          <table className="cv-t4-details-table">
            <tbody>
              <ApplicationRow english="Position Applied" value={draft.position} arabic="الوظيفة المطلوبة" />
              <ApplicationRow english="Monthly Salary" value={draft.salary} arabic="الراتب الشهري" />
              <ApplicationRow english="Contract Period" value="2 YEARS" arabic="مدة العقد" />
              <ApplicationRow english="Passport No." value={draft.passportNumber} arabic="رقم جواز السفر" />
              <tr><th colSpan={3} className="cv-t4-section">Details of Application <span dir="rtl">تفاصيل الطلب</span></th></tr>
              <ApplicationRow english="Nationality" value={draft.nationality} arabic="الجنسية" />
              <ApplicationRow english="Resident" value={draft.address || draft.workCity} arabic="مكان السكن" />
              <ApplicationRow english="Date of Birth" value={draft.dateOfBirth} arabic="تاريخ الميلاد" />
              <ApplicationRow english="Place of Birth" value={draft.placeOfBirth} arabic="مكان الميلاد" />
              <ApplicationRow english="Marital Status" value={draft.civilStatus} arabic="الحالة الاجتماعية" />
              <ApplicationRow english="No. of Children" value={draft.numberOfKids || '0'} arabic="عدد الأطفال" />
              <tr><th colSpan={3} className="cv-t4-section">Languages &amp; Education <span dir="rtl">اللغة والتعليم</span></th></tr>
              <ApplicationRow english="English" value={draft.englishLevel} arabic="الإنجليزية" />
              <ApplicationRow english="Arabic" value={draft.arabicLevel} arabic="العربية" />
              <ApplicationRow english="Education" value={draft.educationLevel} arabic="المستوى التعليمي" />
              <tr><th colSpan={3} className="cv-t4-section">Previous Employment Abroad <span dir="rtl">خبرة خارج البلاد</span></th></tr>
              <tr className="cv-t4-work-head"><th>Period</th><th>Position</th><th>City, Country</th></tr>
              <tr><td className="cv-t4-value">{valueOrBlank(draft.workYears, 'N/A')}</td><td className="cv-t4-value">{valueOrBlank(draft.workPosition)}</td><td className="cv-t4-value">{valueOrBlank(draft.workCountry, 'N/A')}</td></tr>
              <tr><th colSpan={3} className="cv-t4-section">Inside Country Employment</th></tr>
              <tr className="cv-t4-inside-values"><td>{valueOrBlank(draft.workYears, '2 YEARS')}</td><td>{valueOrBlank(draft.workPosition)}</td><td>{valueOrBlank(draft.workCountry, 'KENYA')}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <table className="cv-t4-skills-table">
        <tbody>
          <tr><th colSpan={6} className="cv-t4-section">Skills &amp; Experience <span dir="rtl">خبرة العمل</span></th></tr>
          <SkillRow left="Ironing" leftArabic="الكي" leftEnabled={skills.ironing} right="Baby Sitting" rightArabic="عناية الرضيع" rightEnabled={skills.babysitting} />
          <SkillRow left="Cooking" leftArabic="الطبخ" leftEnabled={skills.cooking} right="Children Care" rightArabic="عناية الأطفال" rightEnabled={skills.babysitting} />
          <SkillRow left="Arabic Cooking" leftArabic="الطبخ العربي" leftEnabled={skills.arabicCooking} right="Tutoring" rightArabic="تعليم الأطفال" rightEnabled={false} />
          <SkillRow left="Sewing" leftArabic="الخياطة" leftEnabled={false} right="Cleaning" rightArabic="التنظيف" rightEnabled={skills.cleaning} />
          <tr><td>Other Skills</td><td colSpan={2}>{EMPTY_VALUE}</td><td colSpan={2}>{EMPTY_VALUE}</td><td className="cv-t4-arabic" dir="rtl">خبرات أخرى</td></tr>
        </tbody>
      </table>

      <table className="cv-t4-remarks-table">
        <tbody>
          <tr>
            <th>Remarks</th>
            <td>{valueOrBlank(draft.remarks)}</td>
            <th dir="rtl">ملاحظات</th>
          </tr>
        </tbody>
      </table>
    </section>
  )
}

function ArabicPage({ draft, skills }) {
  return (
    <section className="cv-t4-page cv-t4-page-arabic" aria-label="Template 4 Arabic application page" dir="rtl">
      <Letterhead draft={draft} arabic />

      <table className="cv-t4-name-strip">
        <tbody>
          <tr>
            <th>الاسم: {valueOrBlank(draft.fullNameArabic)}</th>
            <th>العمر: {valueOrBlank(draft.age, '22 سنة')}</th>
          </tr>
        </tbody>
      </table>

      <div className="cv-t4-arabic-title">البيانات الشخصية</div>
      <table className="cv-t4-arabic-data">
        <tbody>
          <tr><th>الاسم الكامل</th><td>{valueOrBlank(draft.fullNameArabic)}</td><th>الجنسية</th><td>{valueOrBlank(draft.nationality)}</td></tr>
          <tr><th>تاريخ الميلاد</th><td>{valueOrBlank(draft.dateOfBirth)}</td><th>مكان الميلاد</th><td>{valueOrBlank(draft.placeOfBirth)}</td></tr>
          <tr><th>الحالة الاجتماعية</th><td>{valueOrBlank(draft.civilStatus)}</td><th>عدد الأطفال</th><td>{valueOrBlank(draft.numberOfKids, '0')}</td></tr>
          <tr><th>الديانة</th><td>{valueOrBlank(draft.religion)}</td><th>مكان السكن</th><td>{valueOrBlank(draft.address || draft.workCity)}</td></tr>
          <tr><th>الطول</th><td>{valueOrBlank(draft.height)}</td><th>الوزن</th><td>{valueOrBlank(draft.weight)}</td></tr>
        </tbody>
      </table>

      <div className="cv-t4-arabic-title">بيانات جواز السفر</div>
      <table className="cv-t4-arabic-data">
        <tbody>
          <tr><th>رقم جواز السفر</th><td>{valueOrBlank(draft.passportNumber)}</td><th>مكان الإصدار</th><td>{valueOrBlank(draft.placeIssued)}</td></tr>
          <tr><th>تاريخ الإصدار</th><td>{valueOrBlank(draft.dateIssued)}</td><th>تاريخ الانتهاء</th><td>{valueOrBlank(draft.dateExpiry)}</td></tr>
          <tr><th>الوظيفة المطلوبة</th><td>{valueOrBlank(draft.positionArabic, draft.position)}</td><th>الراتب الشهري</th><td>{valueOrBlank(draft.salary)}</td></tr>
        </tbody>
      </table>

      <div className="cv-t4-arabic-title">المؤهلات واللغات</div>
      <table className="cv-t4-arabic-data">
        <tbody>
          <tr><th>المستوى التعليمي</th><td>{valueOrBlank(draft.educationLevel)}</td><th>اللغة الإنجليزية</th><td>{valueOrBlank(draft.englishLevel)}</td></tr>
          <tr><th>اللغة العربية</th><td>{valueOrBlank(draft.arabicLevel)}</td><th>مدة الخبرة</th><td>{valueOrBlank(draft.workYears)}</td></tr>
        </tbody>
      </table>

      <div className="cv-t4-arabic-title">المهارات والخبرات</div>
      <table className="cv-t4-arabic-skills">
        <tbody>
          <tr><th>الكي</th><td>{skills.ironing ? 'نعم' : 'لا'}</td><th>رعاية الأطفال</th><td>{skills.babysitting ? 'نعم' : 'لا'}</td></tr>
          <tr><th>الطبخ</th><td>{skills.cooking ? 'نعم' : 'لا'}</td><th>التنظيف</th><td>{skills.cleaning ? 'نعم' : 'لا'}</td></tr>
          <tr><th>الطبخ العربي</th><td>{skills.arabicCooking ? 'نعم' : 'لا'}</td><th>الغسيل</th><td>{skills.washing ? 'نعم' : 'لا'}</td></tr>
          <tr><th>رعاية كبار السن</th><td>{skills.elderCare ? 'نعم' : 'لا'}</td><th>الخياطة</th><td>لا</td></tr>
        </tbody>
      </table>

      <div className="cv-t4-arabic-title">الخبرة السابقة</div>
      <table className="cv-t4-arabic-data">
        <tbody>
          <tr><th>المهنة</th><td>{valueOrBlank(draft.workPosition)}</td><th>الدولة</th><td>{valueOrBlank(draft.workCountry)}</td></tr>
          <tr><th>الفترة</th><td>{valueOrBlank(draft.workYears)}</td><th>الشركة</th><td>{valueOrBlank(draft.workCompany)}</td></tr>
        </tbody>
      </table>

      <div className="cv-t4-arabic-remarks">
        <strong>ملاحظات</strong>
        <p>{valueOrBlank(draft.remarks)}</p>
      </div>

      <footer className="cv-t4-signatures">
        <div><span>توقيع المتقدمة</span><i /></div>
        <div><span>توقيع الوكالة</span><i /></div>
        <div><span>التاريخ</span><i /></div>
      </footer>
    </section>
  )
}

export default function Template4Preview({ draft }) {
  const skills = {
    cooking: hasSkill(draft.skills, 'COOKING'),
    arabicCooking: hasSkill(draft.skills, 'ARABIC DISH'),
    cleaning: hasSkill(draft.skills, 'CLEANING'),
    washing: hasSkill(draft.skills, 'WASHING'),
    ironing: hasSkill(draft.skills, 'IRONING'),
    babysitting: hasSkill(draft.skills, 'BABYSITTING'),
    elderCare: hasSkill(draft.skills, 'CARING ELDERS', 'ELDER'),
  }

  return (
    <div className="cv-template-scroll" data-testid="template-4-scroll">
      <article
        data-testid="template-4-preview"
        className="cv-template-print-area cv-template-4"
        aria-label="Template 4 CV - Naim Investments two-page Arabic style"
      >
        <EnglishPage draft={draft} skills={skills} />
        <ArabicPage draft={draft} skills={skills} />
      </article>
    </div>
  )
}
