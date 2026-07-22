import { demoCVDrafts } from '../src/services/demoData.js'

const expectedNames = [
  'MWASITI JUMA BAKARI',
  'JOLINE CHELIMO KENTEIA',
  'MWATSENZE MESAIDI BAKARI',
  'MWANAISHA IDI BOHORA',
  'MARIAMU JUMA MBARAK',
  'GRACE KAZUNGU JEFA',
  'JULIA KEYA BARASA',
  'PHANICE KWEKWE KHAMIS',
  'RECHAL NDIKULI NZANGA',
  'MWANAKMKUU JUMA MWATWENYE CV',
  'LINDA MUTHONI WAMBUI CV',
  'MARGARET TEMBO MWALUMBI CV',
  'EMILY WANGUI MAINA CV',
  'MICHELLE KAHANDARI CV',
  'JANE MWELU MUSAU CV',
  'LEAH SALAMA KAZUNGU CV',
  'TERESIAH WAMBERE KARIUKI CV',
]

const expectedKinds = [
  ...Array(9).fill('Auto-saved Draft'),
  ...Array(8).fill('Manual Draft'),
]

const expectedSizes = [
  '496.74 KB', '145.86 KB', '123.55 KB', '1.9 KB', '1.82 KB', '1.91 KB',
  '1.88 KB', '1.42 KB', '252.9 KB', '448 KB', '270.88 KB', '353.37 KB',
  '480.68 KB', '316.44 KB', '280.28 KB', '1.81 KB', '1.9 KB',
]

const expectedUploadedAt = [
  'Jul 14, 2026, 11:59 AM',
  'Jul 13, 2026, 01:35 PM',
  'Jul 12, 2026, 02:33 PM',
  'Jun 13, 2026, 07:17 AM',
  'Jun 9, 2026, 08:16 PM',
  'May 29, 2026, 02:32 PM',
  'May 29, 2026, 01:53 PM',
  'Apr 2, 2026, 07:19 AM',
  'Jan 14, 2026, 07:49 PM',
  'Dec 17, 2025, 06:07 PM',
  'Dec 12, 2025, 02:39 PM',
  'Oct 19, 2025, 02:43 AM',
  'Oct 19, 2025, 02:35 AM',
  'Oct 14, 2025, 08:57 PM',
  'Oct 14, 2025, 08:21 PM',
  'Oct 13, 2025, 07:17 PM',
  'Oct 13, 2025, 07:16 PM',
]

const expectedLastUpdated = [
  '12/17/2025, 6:07:53 PM',
  '12/12/2025, 14:39:04',
  '10/19/2025, 2:43:42 AM',
  '10/19/2025, 2:35:35 AM',
  '10/14/2025, 8:57:07 PM',
  '10/14/2025, 8:21:26 PM',
  '10/13/2025, 6:17:30 PM',
  '10/13/2025, 6:16:10 PM',
]

if (demoCVDrafts.length !== 17) {
  throw new Error(`Expected 17 CV drafts, received ${demoCVDrafts.length}`)
}

for (const [index, draft] of demoCVDrafts.entries()) {
  const expectedUploader = index < 9 ? 'CV Builder Auto-save' : 'CV Builder'
  const expectedDescription = index < 9
    ? `Auto-saved draft for ${expectedNames[index]}`
    : `CV draft for ${expectedNames[index]} - Last updated: ${expectedLastUpdated[index - 9]}`

  if (draft.id !== `cv-draft-${index + 1}`) throw new Error(`Draft ${index + 1} has wrong id`)
  if (draft.number !== index + 1) throw new Error(`Draft ${index + 1} has wrong number`)
  if (draft.name !== expectedNames[index]) throw new Error(`Draft ${index + 1} has wrong name`)
  if (draft.kind !== expectedKinds[index]) throw new Error(`Draft ${index + 1} has wrong kind`)
  if (draft.title !== `${expectedNames[index]} - ${expectedKinds[index]}`) throw new Error(`Draft ${index + 1} has wrong title`)
  if (draft.size !== expectedSizes[index]) throw new Error(`Draft ${index + 1} has wrong size`)
  if (draft.uploadedAt !== expectedUploadedAt[index]) throw new Error(`Draft ${index + 1} has wrong uploadedAt`)
  if (draft.uploadedBy !== expectedUploader) throw new Error(`Draft ${index + 1} has wrong uploadedBy`)
  if (draft.description !== expectedDescription) throw new Error(`Draft ${index + 1} has wrong description`)

  for (const key of ['id', 'number', 'name', 'kind', 'title', 'size', 'uploadedAt', 'uploadedBy', 'description']) {
    if (!(key in draft)) throw new Error(`Draft ${index + 1} is missing ${key}`)
  }
}

console.log('Documents CV fixtures: 17 exact rows present')
