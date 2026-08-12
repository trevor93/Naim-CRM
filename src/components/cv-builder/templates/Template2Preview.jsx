const EMPTY_VALUE = ' '

function valueOrBlank(value) {
  return value || EMPTY_VALUE
}

function hasSkill(skills, ...matches) {
  return skills.some((skill) => matches.some((match) => skill.toUpperCase().includes(match)))
}

function SectionTitle({ english, arabic, colSpan }) {
  return (
    <tr>
      <th colSpan={colSpan} className="cv-t2-section">
        <span>{english}</span>
        <span dir="rtl">{arabic}</span>
      </th>
    </tr>
  )
}

function PersonalField({ label, value, arabic }) {
  return (
    <>
      <td className="cv-t2-label">{label}</td>
      <td className="cv-t2-value">{valueOrBlank(value)}</td>
      <td className="cv-t2-arabic" dir="rtl">{arabic}</td>
    </>
  )
}

function SkillRow({ english, arabic, enabled, photo, photoRowSpan }) {
  return (
    <tr>
      <td className="cv-t2-skill-name">{english}</td>
      <td className="cv-t2-skill-value">{enabled ? 'YES' : 'NO'}</td>
      <td className="cv-t2-arabic" dir="rtl">{arabic}</td>
      {photo && (
        <td rowSpan={photoRowSpan} className="cv-t2-full-photo">
          {photo}
        </td>
      )}
    </tr>
  )
}

export default function Template2Preview({ draft }) {
  const cooking = hasSkill(draft.skills, 'ARABIC DISH', 'COOKING')
  const cleaning = hasSkill(draft.skills, 'CLEANING')
  const washing = hasSkill(draft.skills, 'WASHING')
  const ironing = hasSkill(draft.skills, 'IRONING')
  const babysitting = hasSkill(draft.skills, 'BABYSITTING')
  const elderCare = hasSkill(draft.skills, 'CARING ELDERS', 'ELDER')

  return (
    <div className="cv-template-scroll" data-testid="template-2-scroll">
      <article
        data-testid="template-2-preview"
        className="cv-template-print-area cv-template-2"
        aria-label="Template 2 CV - Modern Layout"
      >
        <header className="cv-t2-letterhead">
          <div className="cv-t2-logo" aria-hidden="true" />
          <div className="cv-t2-company">
            <h2>{valueOrBlank(draft.companyName)}</h2>
            <p>{valueOrBlank(draft.companyLocation)}</p>
            <p>CONTACT NUMBER: {valueOrBlank(draft.companyPhone)}</p>
          </div>
        </header>

        <table className="cv-t2-position">
          <tbody>
            <tr>
              <th className="cv-t2-position-label">
                <span>POSITION APPLYING FOR</span>
                <small dir="rtl">الوظيفة المطلوبة</small>
              </th>
              <td className="cv-t2-position-value">{valueOrBlank(draft.position)}</td>
            </tr>
            <tr>
              <th className="cv-t2-salary-label" dir="rtl">الراتب</th>
              <td className="cv-t2-salary-value">SALARY: {valueOrBlank(draft.salary)}</td>
            </tr>
          </tbody>
        </table>

        <table className="cv-t2-passport">
          <colgroup>
            <col className="cv-t2-passport-label-col" />
            <col className="cv-t2-passport-value-col" />
            <col className="cv-t2-passport-arabic-col" />
            <col className="cv-t2-profile-col" />
          </colgroup>
          <tbody>
            <SectionTitle english="PASSPORT DETAILS" arabic="بيانات جواز السفر" colSpan={3} />
            <tr>
              <td className="cv-t2-label">Passport No.</td>
              <td className="cv-t2-value">{valueOrBlank(draft.passportNumber)}</td>
              <td className="cv-t2-arabic" dir="rtl">رقم جواز السفر</td>
              <td rowSpan={5} className="cv-t2-profile-photo">Profile Photo</td>
            </tr>
            <tr>
              <td className="cv-t2-label">Date Issued</td>
              <td className="cv-t2-value">{valueOrBlank(draft.dateIssued)}</td>
              <td className="cv-t2-arabic" dir="rtl">تاريخ الإصدار</td>
            </tr>
            <tr>
              <td className="cv-t2-label">Date of Expiry</td>
              <td className="cv-t2-value">{valueOrBlank(draft.dateExpiry)}</td>
              <td className="cv-t2-arabic" dir="rtl">تاريخ الانتهاء</td>
            </tr>
            <tr>
              <td className="cv-t2-label">Place Issued</td>
              <td className="cv-t2-value">{valueOrBlank(draft.placeIssued)}</td>
              <td className="cv-t2-arabic" dir="rtl">مكان الإصدار</td>
            </tr>
            <tr className="cv-t2-name-row">
              <th>
                <span>NAME IN FULL</span>
                <small dir="rtl">الاسم الكامل</small>
              </th>
              <td colSpan={2}>{valueOrBlank(draft.fullName)}</td>
            </tr>
          </tbody>
        </table>

        <table className="cv-t2-personal">
          <colgroup>
            <col className="cv-t2-personal-label-col" />
            <col className="cv-t2-personal-value-col" />
            <col className="cv-t2-personal-arabic-col" />
            <col className="cv-t2-personal-label-col" />
            <col className="cv-t2-personal-value-col" />
            <col className="cv-t2-personal-arabic-col" />
          </colgroup>
          <tbody>
            <SectionTitle english="PERSONAL INFORMATION" arabic="المعلومات الشخصية" colSpan={6} />
            <tr>
              <PersonalField label="Address" value={draft.address} arabic="العنوان" />
              <PersonalField label="Age" value={draft.age} arabic="العمر" />
            </tr>
            <tr>
              <PersonalField label="Nationality" value={draft.nationality} arabic="الجنسية" />
              <PersonalField label="Height" value={draft.height} arabic="الطول" />
            </tr>
            <tr>
              <PersonalField label="Religion" value={draft.religion} arabic="الديانة" />
              <PersonalField label="Weight" value={draft.weight} arabic="الوزن" />
            </tr>
            <tr>
              <PersonalField label="Date of Birth" value={draft.dateOfBirth} arabic="تاريخ الميلاد" />
              <PersonalField label="Civil Status" value={draft.civilStatus} arabic="الحالة الاجتماعية" />
            </tr>
            <tr>
              <PersonalField label="Place of Birth" value={draft.placeOfBirth} arabic="مكان الميلاد" />
              <PersonalField label="Spouse" value={draft.spouse} arabic="الزوج" />
            </tr>
            <tr>
              <PersonalField label="Father" value={draft.fatherName} arabic="الأب" />
              <PersonalField label="No. of Kids" value={draft.numberOfKids} arabic="عدد الأطفال" />
            </tr>
            <tr>
              <PersonalField label="Mother" value={draft.motherName} arabic="الأم" />
              <td colSpan={3} className="cv-t2-empty">{EMPTY_VALUE}</td>
            </tr>
          </tbody>
        </table>

        <table className="cv-t2-levels">
          <tbody>
            <tr>
              <th colSpan={3} className="cv-t2-section">
                <span>LANGUAGES LEVEL</span>
                <span dir="rtl">مستوى اللغات</span>
              </th>
              <th colSpan={3} className="cv-t2-section">
                <span>EDUCATION LEVEL</span>
                <span dir="rtl">المستوى التعليمي</span>
              </th>
            </tr>
            <tr>
              <td className="cv-t2-level-label">English <small dir="rtl">الإنجليزية</small></td>
              <td className="cv-t2-level-value">{valueOrBlank(draft.englishLevel)}</td>
              <td className="cv-t2-level-label">Arabic <small dir="rtl">العربية</small></td>
              <td colSpan={3} className="cv-t2-education-value">{valueOrBlank(draft.educationLevel)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="cv-t2-arabic-level">{valueOrBlank(draft.arabicLevel)}</td>
              <td colSpan={3} className="cv-t2-empty">{EMPTY_VALUE}</td>
            </tr>
          </tbody>
        </table>

        <table className="cv-t2-work">
          <tbody>
            <SectionTitle english="WORK EXPERIENCE" arabic="خبرة العمل" colSpan={3} />
            <tr className="cv-t2-work-head">
              <th>Position <small dir="rtl">المهنة</small></th>
              <th>Country <small dir="rtl">البلد</small></th>
              <th>Year <small dir="rtl">السنة</small></th>
            </tr>
            <tr className="cv-t2-work-values">
              <td>{valueOrBlank(draft.workPosition)}</td>
              <td>{valueOrBlank(draft.workCountry)}</td>
              <td>{valueOrBlank(draft.workYears)}</td>
            </tr>
          </tbody>
        </table>

        <table className="cv-t2-skills">
          <colgroup>
            <col className="cv-t2-skill-label-col" />
            <col className="cv-t2-skill-value-col" />
            <col className="cv-t2-skill-arabic-col" />
            <col className="cv-t2-full-photo-col" />
          </colgroup>
          <tbody>
            <SectionTitle english="SKILLS" arabic="المهارات" colSpan={3} />
            <SkillRow english="ARABIC DISH COOKING" arabic="طبخ الأطباق العربية" enabled={cooking} photo="Full Body Photo" photoRowSpan={7} />
            <SkillRow english="CLEANING" arabic="التنظيف" enabled={cleaning} />
            <SkillRow english="WASHING" arabic="الغسيل" enabled={washing} />
            <SkillRow english="IRONING" arabic="الكي" enabled={ironing} />
            <SkillRow english="BABYSITTING" arabic="رعاية الأطفال" enabled={babysitting} />
            <SkillRow english="CARING ELDERS" arabic="رعاية كبار السن" enabled={elderCare} />
          </tbody>
        </table>

        <footer className="cv-t2-remarks">
          <h3><span>REMARKS</span> <span dir="rtl">ملاحظات</span></h3>
          <p>{valueOrBlank(draft.remarks)}</p>
        </footer>
      </article>
    </div>
  )
}
