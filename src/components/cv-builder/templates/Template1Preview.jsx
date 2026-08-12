const EMPTY_VALUE = ' '

function valueOrBlank(value) {
  return value || EMPTY_VALUE
}

function hasSkill(skills, ...matches) {
  return skills.some((skill) => matches.some((match) => skill.toUpperCase().includes(match)))
}

function SectionTitle({ english, arabic, colSpan = 3 }) {
  return (
    <tr>
      <th colSpan={colSpan} className="cv-t1-section">
        <span>{english}</span>
        <span dir="rtl">{arabic}</span>
      </th>
    </tr>
  )
}

function DetailRow({ label, value, arabic, photo, photoRowSpan }) {
  return (
    <tr>
      <td className="cv-t1-label">{label}</td>
      <td className="cv-t1-value">{valueOrBlank(value)}</td>
      <td className="cv-t1-arabic" dir="rtl">{arabic}</td>
      {photo && (
        <td rowSpan={photoRowSpan} className="cv-t1-photo">
          <span>{photo}</span>
        </td>
      )}
    </tr>
  )
}

function DutyCell({ english, arabic }) {
  return (
    <th>
      <span>{english}</span>
      <small dir="rtl">{arabic}</small>
    </th>
  )
}

export default function Template1Preview({ draft }) {
  const cooking = hasSkill(draft.skills, 'ARABIC DISH', 'COOKING')
  const cleaning = hasSkill(draft.skills, 'CLEANING')
  const washing = hasSkill(draft.skills, 'WASHING')
  const babysitting = hasSkill(draft.skills, 'BABYSITTING')
  const elderCare = hasSkill(draft.skills, 'CARING ELDERS', 'ELDER')
  const ironing = hasSkill(draft.skills, 'IRONING')

  return (
    <div className="cv-template-scroll" data-testid="template-1-scroll">
      <article
        data-testid="template-1-preview"
        className="cv-template-print-area cv-template-1"
        aria-label="Template 1 CV - Naim Investment Limited"
      >
        <header className="cv-t1-header">
          <div className="cv-t1-logo">
            <img src="/assets/naim-agency-logo.webp" alt="Naim Agency logo" />
          </div>
          <h2>NAIM INVESTMENT LIMITED</h2>
          <div>
            <strong>HOUSEMAID APPLICATION FORM</strong>
            <span aria-hidden="true"> - </span>
            <strong className="cv-t1-header-arabic" dir="rtl">بيانات طلب الخادمة</strong>
          </div>
        </header>

        <table className="cv-t1-details">
          <colgroup>
            <col className="cv-t1-col-label" />
            <col className="cv-t1-col-value" />
            <col className="cv-t1-col-arabic" />
            <col className="cv-t1-col-photo" />
          </colgroup>
          <tbody>
            <DetailRow label="POST APPLIED FOR" value={draft.position} arabic="الوظيفة المطلوبة" photo="Profile Photo" photoRowSpan={8} />
            <DetailRow label="CONTRACT PERIOD" value="" arabic="مدة العقد" />
            <DetailRow label="MONTHLY SALARY" value={draft.salary} arabic="الراتب الشهري" />
            <SectionTitle english="PERSONAL INFORMATION" arabic="المعلومات الشخصية" />
            <DetailRow label="Name" value={draft.fullName} arabic="اسم" />
            <DetailRow label="Nationality" value={draft.nationality} arabic="الجنسية" />
            <DetailRow label="Date of Birth" value={draft.dateOfBirth} arabic="العمر" />
            <DetailRow label="Civil Status" value={draft.civilStatus} arabic="الحالة الاجتماعية" />

            <DetailRow label="Living town" value={draft.address} arabic="مكان السكن" photo="Full Body Photo" photoRowSpan={16} />
            <DetailRow label="Weight" value={draft.weight} arabic="الوزن" />
            <DetailRow label="Height" value={draft.height} arabic="الطول" />
            <DetailRow label="Religion" value={draft.religion} arabic="الديانة" />
            <DetailRow label="Highest Education" value={draft.educationLevel} arabic="أعلى تعليم" />
            <SectionTitle english="PASSPORT DETAILS" arabic="بيانات جواز السفر" />
            <DetailRow label="Passport No" value={draft.passportNumber} arabic="رقم جواز السفر" />
            <DetailRow label="Date of Issue" value={draft.dateIssued} arabic="تاريخ الإصدار" />
            <DetailRow label="Date of Expiry" value={draft.dateExpiry} arabic="تاريخ الانتهاء" />
            <DetailRow label="Place of Issue" value={draft.placeIssued} arabic="مكان الإصدار" />
            <SectionTitle english="SPOKEN LANGUAGE" arabic="اللغة المتحدثة" />
            <DetailRow label="English" value={draft.englishLevel} arabic="إنجليزي" />
            <DetailRow label="Arabic" value={draft.arabicLevel} arabic="عربي" />
            <SectionTitle english="WORK EXPERIENCE" arabic="خبرة العمل" />
            <tr className="cv-t1-work-head">
              <th>Designation <small dir="rtl">المهنة</small></th>
              <th>Country <small dir="rtl">البلد</small></th>
              <th>Period <small dir="rtl">الفترة</small></th>
            </tr>
            <tr className="cv-t1-work-value">
              <td>{valueOrBlank(draft.workPosition)}</td>
              <td>{valueOrBlank(draft.workCountry)}</td>
              <td>{valueOrBlank(draft.workYears)}</td>
            </tr>
          </tbody>
        </table>

        <section className="cv-t1-duties" aria-label="Duties">
          <h3><span>DUTIES</span> <span dir="rtl">الواجبات</span></h3>
          <table>
            <thead>
              <tr>
                <DutyCell english="Cooking /ARABIC FOODS" arabic="الطبخ" />
                <DutyCell english="Cleaning" arabic="النظافة" />
                <DutyCell english="Washing" arabic="الغسيل" />
                <DutyCell english="Baby-sitting / Elderly Care" arabic="رعاية طفل / مسن" />
                <DutyCell english="Ironing" arabic="كي الملابس" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{cooking ? 'YES' : 'NO'}</td>
                <td>{cleaning ? 'YES' : 'NO'}</td>
                <td>{washing ? 'YES' : 'NO'}</td>
                <td>{babysitting || elderCare ? `${babysitting ? 'YES' : 'NO'} /${elderCare ? 'YES' : 'NO'}` : 'NO /NO'}</td>
                <td>{ironing ? 'YES' : 'NO'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer className="cv-t1-remarks">
          <h3><span>REMARKS</span> <span dir="rtl">ملاحظات</span></h3>
          <p>{valueOrBlank(draft.remarks)}</p>
        </footer>
      </article>
    </div>
  )
}
