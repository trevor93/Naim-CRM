export const CV_BUILDER_STORAGE_KEY = 'naim-cv-builder-draft'

export const DEFAULT_CV_BUILDER_DRAFT = Object.freeze({
  template: '3',
  autoSave: true,
  companyName: 'NAIM INVESTMENT OFFICE',
  companyNameArabic: 'مكتب نعيم للاستثمار',
  companyLocation: 'P O Box 80249-80100 Mombasa, Kenya',
  companyPhone: '+254720931164',
  position: 'DOMESTIC WORKER',
  positionArabic: 'الوظيفة',
  salary: '1100',
  passportNumber: 'AK0597068',
  dateIssued: '',
  dateExpiry: '',
  placeIssued: '',
  fullName: 'AMINA ALI KAKAWA',
  fullNameArabic: 'أمينة علي كاكاوا',
  address: '',
  nationality: '',
  religion: '',
  dateOfBirth: '',
  placeOfBirth: '',
  fatherName: '',
  motherName: '',
  age: '',
  height: '',
  weight: '',
  civilStatus: '',
  spouse: '',
  numberOfKids: '',
  educationLevel: '',
  englishLevel: '',
  arabicLevel: '',
  workPosition: 'DOMESTIC WORKER',
  workCountry: '',
  workYears: '',
  contact: '+000-000-0000',
  email: '1783949273605@temp.com',
  emergencyContact: '',
  workCompany: '',
  workCity: 'TANA DELTA, KENYA',
  stage: 'Onboarding',
  referenceNumber: '',
  referenceDate: '',
  destination: '',
  nextOfKin: '',
  kinship: '',
  otherEmergencyInfo: '',
  idNumber: '',
  complexion: '',
  educationPeriod: '',
  additionalEducation: '',
  hobbies: '1. COOKING\n2. GOING OUT\n3. HOUSE CHORES',
  medicalHistory: '',
  remarks: 'COOPERATIVE / HIGHLY DISCIPLINE / HARDWORKING & EXPERIENCED, WORKED IN IRAQ FOR 8 YEARS  AS A DOMESTIC WORKER',
  newSkill: '',
  skills: [
    'ARABIC DISH COOKING',
    'CLEANING',
    'WASHING',
    'IRONING',
    'BABYSITTING',
    'CARING ELDERS',
  ],
  files: {},
})

export function createDefaultCVBuilderDraft() {
  return {
    ...DEFAULT_CV_BUILDER_DRAFT,
    skills: [...DEFAULT_CV_BUILDER_DRAFT.skills],
    files: {},
  }
}

function normalizeDraft(value) {
  const defaults = createDefaultCVBuilderDraft()
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults
  return {
    ...defaults,
    ...value,
    template: ['1', '2', '3', '4', '5'].includes(String(value.template)) ? String(value.template) : defaults.template,
    autoSave: value.autoSave !== false,
    skills: Array.isArray(value.skills)
      ? value.skills.filter((skill) => typeof skill === 'string' && skill.trim()).map((skill) => skill.trim())
      : defaults.skills,
    files: value.files && typeof value.files === 'object' && !Array.isArray(value.files) ? value.files : {},
  }
}

export function loadCVBuilderDraft(storage = window.localStorage) {
  try {
    const raw = storage.getItem(CV_BUILDER_STORAGE_KEY)
    return raw === null ? createDefaultCVBuilderDraft() : normalizeDraft(JSON.parse(raw))
  } catch {
    return createDefaultCVBuilderDraft()
  }
}

export function saveCVBuilderDraft(draft, storage = window.localStorage) {
  const normalized = normalizeDraft(draft)
  storage.setItem(CV_BUILDER_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function clearCVBuilderDraft(storage = window.localStorage) {
  storage.removeItem(CV_BUILDER_STORAGE_KEY)
  return createDefaultCVBuilderDraft()
}
