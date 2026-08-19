import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Loader2, Upload } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import DocumentsTabs, { DOCUMENT_TAB_IDS } from '../components/documents/DocumentsTabs'
import CVIntegrationBanner from '../components/documents/CVIntegrationBanner'
import CVDocumentSection from '../components/documents/CVDocumentSection'
import CVDraftsSection from '../components/documents/CVDraftsSection'
import MedicalReportsPanel, { MEDICAL_SECTIONS } from '../components/documents/MedicalReportsPanel'
import ContractsPanel, { CONTRACT_SECTIONS } from '../components/documents/ContractsPanel'
import LicensesCertificationsPanel, { LICENSE_SECTIONS } from '../components/documents/LicensesCertificationsPanel'
import AdvertsMarketingPanel, { MARKETING_SECTIONS } from '../components/documents/AdvertsMarketingPanel'
import ReportsPanel, { REPORT_SECTIONS } from '../components/documents/ReportsPanel'
import { demoCVDrafts, demoLicenseDocuments, demoMedicalDocuments } from '../services/demoData'
import { getDocuments, uploadDocument, downloadDocument, deleteDocument, updateDocument } from '../services/documentService'
import { getCVDrafts, deleteCVDraft } from '../services/cvDraftService'
import { isSupabaseConfigured } from '../supabase/client'
import { useToast } from '../contexts/ToastContext'

const ACCEPTED_DOCUMENT_EXTENSIONS = /\.(pdf|doc|docx|jpe?g|png|gif|webp|bmp|tiff?|heic|heif)$/i
const ACCEPTED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

function formatFileSize(bytes) {
  const size = Number(bytes)
  if (!Number.isFinite(size) || size < 0) return 'Size unavailable'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : DATE_FORMATTER.format(date)
}

function normalizeSupabaseDraft(row, index) {
  const name = row.full_name || row.name || row.title || 'Untitled CV'
  const kind = row.kind || (row.auto_saved ? 'Auto-saved Draft' : 'CV Draft')
  return {
    ...row,
    id: row.id || `live-cv-draft-${index + 1}`,
    number: index + 1,
    name,
    kind,
    title: row.title || `${name} - ${kind}`,
    size: row.size || formatFileSize(row.file_size),
    uploadedAt: row.uploadedAt || formatDate(row.updated_at || row.created_at),
    uploadedBy: row.uploadedBy || row.uploaded_by || 'CV Builder',
    description: row.description || `CV draft for ${name}`,
    filePath: row.filePath || row.file_path || null,
    fileName: row.fileName || row.file_name || null,
    fileUrl: row.fileUrl || row.file_url || null,
  }
}

function validateUploadFile(file) {
  if (!file || file.size <= 0) return 'Select a non-empty file to upload.'
  const validType = ACCEPTED_DOCUMENT_MIME_TYPES.has(file.type) || file.type.startsWith('image/')
  const validExtension = ACCEPTED_DOCUMENT_EXTENSIONS.test(file.name)
  return validType || validExtension ? null : 'Upload a PDF, DOC, DOCX, or image file.'
}

function triggerBlobDownload(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

async function downloadRemoteFile(url, fileName) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Download failed with status ${response.status}`)
    triggerBlobDownload(await response.blob(), fileName)
  } catch {
    window.open(url, '_blank', 'noopener')
  }
}

function triggerTextDownload(draft) {
  const contents = [
    draft.title,
    '',
    `File size: ${draft.size}`,
    `Uploaded: ${draft.uploadedAt} by ${draft.uploadedBy}`,
    '',
    draft.description,
  ].join('\n')
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
  const safeName = (draft.name || 'cv-draft').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '')
  triggerBlobDownload(blob, `${safeName || 'cv-draft'}.txt`)
}

export default function DocumentsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  // Global search links in as /documents?tab=<section>, so open that tab.
  const [activeTab, setActiveTab] = useState(() => {
    const requested = searchParams.get('tab')
    return DOCUMENT_TAB_IDS.includes(requested) ? requested : 'cvs'
  })
  const [builderCVs, setBuilderCVs] = useState([])
  const [uploadedCVs, setUploadedCVs] = useState([])
  const [drafts, setDrafts] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [medicalDocuments, setMedicalDocuments] = useState(demoMedicalDocuments)
  const [medicalSelected, setMedicalSelected] = useState({ examination: new Set(), certificate: new Set(), vaccination: new Set(), other: new Set() })
  const [contractDocuments, setContractDocuments] = useState([])
  const [contractSelected, setContractSelected] = useState({ candidate: new Set(), company: new Set(), employee: new Set(), other: new Set() })
  const [licenseDocuments, setLicenseDocuments] = useState(demoLicenseDocuments)
  const [licenseSelected, setLicenseSelected] = useState({ business: new Set(), professional: new Set(), regulatory: new Set(), other: new Set() })
  const [marketingDocuments, setMarketingDocuments] = useState([])
  const [marketingSelected, setMarketingSelected] = useState({ materials: new Set(), advertisements: new Set(), brand: new Set(), social: new Set() })
  const [reportDocuments, setReportDocuments] = useState([])
  const [reportSelected, setReportSelected] = useState({ financial: new Set(), performance: new Set(), compliance: new Set(), analytics: new Set() })
  const [previewDraft, setPreviewDraft] = useState(null)
  const [previewMedical, setPreviewMedical] = useState(null)
  const [editingMedical, setEditingMedical] = useState(null)
  const [medicalEditDescription, setMedicalEditDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [pendingUpload, setPendingUpload] = useState(null)
  const [candidateId, setCandidateId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [clearing, setClearing] = useState(false)
  const requestGenerationRef = useRef(0)
  const draftIds = useMemo(() => drafts.map((draft) => draft.id), [drafts])

  async function loadCVData({ showLoading = true } = {}) {
    const requestGeneration = ++requestGenerationRef.current
    if (showLoading) setLoading(true)

    if (!isSupabaseConfigured) {
      if (requestGeneration !== requestGenerationRef.current) return false
      setBuilderCVs([])
      setUploadedCVs([])
      setDrafts(demoCVDrafts)
      setMedicalDocuments(demoMedicalDocuments)
      setContractDocuments([])
      setLicenseDocuments(demoLicenseDocuments)
      setMarketingDocuments([])
      setReportDocuments([])
      setSelectedIds(new Set())
      setLoading(false)
      return true
    }

    const [documentsResult, medicalResult, draftsResult] = await Promise.allSettled([
      getDocuments({ documentType: 'Resume/CV' }),
      getDocuments(),
      getCVDrafts(),
    ])
    if (requestGeneration !== requestGenerationRef.current) return false

    if (documentsResult.status === 'fulfilled') {
      const documents = documentsResult.value || []
      const isBuilderDocument = (document) => (
        document.source === 'cv-builder' || document.file_path?.includes('/cv-builder/')
      )
      setBuilderCVs(documents.filter(isBuilderDocument))
      setUploadedCVs(documents.filter((document) => !isBuilderDocument(document)))
    } else {
      toast.error('Failed to load CV documents')
    }

    if (medicalResult.status === 'fulfilled') {
      const allDocuments = medicalResult.value || []
      const sectionByType = new Map(MEDICAL_SECTIONS.map((section) => [section.type, section.id]))
      const contractSectionByType = new Map(CONTRACT_SECTIONS.map((section) => [section.type, section.id]))
      const licenseSectionByType = new Map(LICENSE_SECTIONS.map((section) => [section.type, section.id]))
      const marketingSectionByType = new Map(MARKETING_SECTIONS.map((section) => [section.type, section.id]))
      const reportSectionByType = new Map(REPORT_SECTIONS.map((section) => [section.type, section.id]))
      const normalizeDocument = (document, section, uploadedBy) => ({
        ...document,
        section,
        size: formatFileSize(document.file_size),
        uploadedAt: formatDate(document.created_at),
        uploadedBy: document.uploaded_by || uploadedBy,
        description: document.description || document.document_type,
      })
      setMedicalDocuments(allDocuments.filter((document) => sectionByType.has(document.document_type)).map((document) => normalizeDocument(document, sectionByType.get(document.document_type), 'Medical Officer')))
      setContractDocuments(allDocuments.filter((document) => contractSectionByType.has(document.document_type)).map((document) => normalizeDocument(document, contractSectionByType.get(document.document_type), 'Current User')))
      setLicenseDocuments(allDocuments.filter((document) => licenseSectionByType.has(document.document_type)).map((document) => normalizeDocument(document, licenseSectionByType.get(document.document_type), 'Current User')))
      setMarketingDocuments(allDocuments.filter((document) => marketingSectionByType.has(document.document_type)).map((document) => normalizeDocument(document, marketingSectionByType.get(document.document_type), 'Current User')))
      setReportDocuments(allDocuments.filter((document) => reportSectionByType.has(document.document_type)).map((document) => normalizeDocument(document, reportSectionByType.get(document.document_type), 'Current User')))
    } else {
      toast.error('Failed to load medical documents')
    }

    if (draftsResult.status === 'fulfilled') {
      const normalizedDrafts = (draftsResult.value || []).map(normalizeSupabaseDraft)
      const validDraftIds = new Set(normalizedDrafts.map((draft) => draft.id))
      setDrafts(normalizedDrafts)
      setSelectedIds((current) => new Set([...current].filter((id) => validDraftIds.has(id))))
    } else {
      toast.error('Failed to load CV drafts')
    }

    setLoading(false)
    return documentsResult.status === 'fulfilled' && medicalResult.status === 'fulfilled' && draftsResult.status === 'fulfilled'
  }

  useEffect(() => {
    loadCVData()
    return () => { requestGenerationRef.current += 1 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleUnavailableTab(label) {
    toast.info(`${label} will be built from its template image next.`)
  }

  function handleUpload(file, source, documentSection = null, documentKind = null) {
    const validationError = validateUploadFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }
    if (!isSupabaseConfigured) {
      if (documentSection) {
        const document = {
          id: `demo-${documentKind}-${Date.now()}`,
          section: documentSection.id,
          document_type: documentSection.type,
          file_name: file.name,
          file_size: file.size,
          size: formatFileSize(file.size),
          uploadedAt: formatDate(new Date()),
          uploadedBy: 'Current User',
          description: documentSection.subtitle,
          mime_type: file.type,
          demoFile: file,
        }
        if (documentKind === 'contract') setContractDocuments((current) => [...current, document])
        else if (documentKind === 'license') setLicenseDocuments((current) => [...current, document])
        else if (documentKind === 'marketing') setMarketingDocuments((current) => [...current, document])
        else if (documentKind === 'report') setReportDocuments((current) => [...current, document])
        else setMedicalDocuments((current) => [...current, document])
        toast.success(`${file.name} uploaded successfully`)
      } else {
        toast.success(`${file.name} selected successfully`)
      }
      return
    }
    setCandidateId('')
    setPendingUpload({ file, source, documentSection, documentKind })
  }

  function closeUploadModal() {
    if (uploading) return
    setPendingUpload(null)
    setCandidateId('')
  }

  async function confirmSupabaseUpload(event) {
    event.preventDefault()
    const normalizedCandidateId = candidateId.trim()
    if (!pendingUpload) return
    if (!normalizedCandidateId) return toast.error('Candidate ID is required')

    setUploading(true)
    try {
      await uploadDocument(
        pendingUpload.file,
        normalizedCandidateId,
        pendingUpload.documentSection?.type || 'Resume/CV',
        pendingUpload.source,
      )
      const uploadedFileName = pendingUpload.file.name
      setPendingUpload(null)
      setCandidateId('')
      await loadCVData({ showLoading: false })
      toast.success(`${uploadedFileName} uploaded successfully`)
    } catch (error) {
      toast.error(error?.message || 'Failed to upload CV')
    } finally {
      setUploading(false)
    }
  }

  function handleToggleDraft(id) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleToggleAll() {
    setSelectedIds((current) => {
      const allSelected = draftIds.length > 0 && draftIds.every((id) => current.has(id))
      return allSelected ? new Set() : new Set(draftIds)
    })
  }

  function handleEditDraft() {
    if (!isSupabaseConfigured) toast.info('Opening CV Builder; changes to this demo draft are not persisted.')
    navigate('/cv-builder')
  }

  async function handleDownloadDraft(draft) {
    try {
      if (isSupabaseConfigured && draft.filePath) {
        await downloadDocument(draft.filePath, draft.fileName || `${draft.name}.pdf`)
        return
      }
      if (isSupabaseConfigured && draft.fileUrl) {
        await downloadRemoteFile(draft.fileUrl, draft.fileName || `${draft.name}.pdf`)
        return
      }
      triggerTextDownload(draft)
      if (isSupabaseConfigured) toast.info('No stored CV file was available, so the draft details were downloaded instead.')
    } catch (error) {
      toast.error(error?.message || 'Failed to download CV draft')
    }
  }

  async function handleDeleteDraft(draft) {
    if (!window.confirm(`Delete the CV draft for ${draft.name}?`)) return
    if (!isSupabaseConfigured) {
      setDrafts((current) => current.filter((item) => item.id !== draft.id))
      setSelectedIds((current) => {
        const next = new Set(current)
        next.delete(draft.id)
        return next
      })
      setPreviewDraft((current) => current?.id === draft.id ? null : current)
      toast.success('CV draft deleted')
      return
    }

    try {
      await deleteCVDraft(draft.id)
      setPreviewDraft((current) => current?.id === draft.id ? null : current)
      await loadCVData({ showLoading: false })
      toast.success('CV draft deleted')
    } catch (error) {
      toast.error(error?.message || 'Failed to delete CV draft')
    }
  }

  async function handleClearDrafts() {
    if (clearing) return
    if (drafts.length === 0) return toast.info('There are no CV drafts to clear.')
    if (!window.confirm('Clear all CV drafts? This action cannot be undone.')) return

    setClearing(true)
    try {
      if (!isSupabaseConfigured) {
        setDrafts([])
        setSelectedIds(new Set())
        setPreviewDraft(null)
        toast.success('All CV drafts cleared')
        return
      }

      const results = await Promise.allSettled(drafts.map((draft) => deleteCVDraft(draft.id)))
      const failedCount = results.filter((result) => result.status === 'rejected').length
      setPreviewDraft(null)
      await loadCVData({ showLoading: false })
      if (failedCount > 0) {
        toast.error(`${failedCount} of ${results.length} CV drafts could not be cleared`)
      } else {
        toast.success('All CV drafts cleared')
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to clear CV drafts')
    } finally {
      setClearing(false)
    }
  }

  const medicalBySection = useMemo(() => Object.fromEntries(MEDICAL_SECTIONS.map((section) => [
    section.id,
    medicalDocuments.filter((document) => document.section === section.id),
  ])), [medicalDocuments])
  const contractsBySection = useMemo(() => Object.fromEntries(CONTRACT_SECTIONS.map((section) => [
    section.id,
    contractDocuments.filter((document) => document.section === section.id),
  ])), [contractDocuments])
  const licensesBySection = useMemo(() => Object.fromEntries(LICENSE_SECTIONS.map((section) => [
    section.id,
    licenseDocuments.filter((document) => document.section === section.id),
  ])), [licenseDocuments])
  const marketingBySection = useMemo(() => Object.fromEntries(MARKETING_SECTIONS.map((section) => [
    section.id,
    marketingDocuments.filter((document) => document.section === section.id),
  ])), [marketingDocuments])
  const reportsBySection = useMemo(() => Object.fromEntries(REPORT_SECTIONS.map((section) => [
    section.id,
    reportDocuments.filter((document) => document.section === section.id),
  ])), [reportDocuments])

  function toggleMedical(sectionId, id) {
    setMedicalSelected((current) => {
      const next = new Set(current[sectionId])
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...current, [sectionId]: next }
    })
  }

  function toggleAllMedical(sectionId) {
    const ids = medicalBySection[sectionId].map((document) => document.id)
    setMedicalSelected((current) => ({
      ...current,
      [sectionId]: ids.length > 0 && ids.every((id) => current[sectionId].has(id)) ? new Set() : new Set(ids),
    }))
  }

  function toggleContract(sectionId, id) {
    setContractSelected((current) => {
      const next = new Set(current[sectionId])
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...current, [sectionId]: next }
    })
  }

  function toggleAllContracts(sectionId) {
    const ids = contractsBySection[sectionId].map((document) => document.id)
    setContractSelected((current) => ({
      ...current,
      [sectionId]: ids.length > 0 && ids.every((id) => current[sectionId].has(id)) ? new Set() : new Set(ids),
    }))
  }

  function toggleLicense(sectionId, id) {
    setLicenseSelected((current) => {
      const next = new Set(current[sectionId])
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...current, [sectionId]: next }
    })
  }

  function toggleAllLicenses(sectionId) {
    const ids = licensesBySection[sectionId].map((document) => document.id)
    setLicenseSelected((current) => ({
      ...current,
      [sectionId]: ids.length > 0 && ids.every((id) => current[sectionId].has(id)) ? new Set() : new Set(ids),
    }))
  }

  function toggleMarketing(sectionId, id) {
    setMarketingSelected((current) => {
      const next = new Set(current[sectionId])
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...current, [sectionId]: next }
    })
  }

  function toggleAllMarketing(sectionId) {
    const ids = marketingBySection[sectionId].map((document) => document.id)
    setMarketingSelected((current) => ({
      ...current,
      [sectionId]: ids.length > 0 && ids.every((id) => current[sectionId].has(id)) ? new Set() : new Set(ids),
    }))
  }

  function toggleReport(sectionId, id) {
    setReportSelected((current) => {
      const next = new Set(current[sectionId])
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...current, [sectionId]: next }
    })
  }

  function toggleAllReports(sectionId) {
    const ids = reportsBySection[sectionId].map((document) => document.id)
    setReportSelected((current) => ({
      ...current,
      [sectionId]: ids.length > 0 && ids.every((id) => current[sectionId].has(id)) ? new Set() : new Set(ids),
    }))
  }

  async function handleMedicalDownload(document) {
    try {
      if (document.demoFile) return triggerBlobDownload(document.demoFile, document.file_name)
      if (isSupabaseConfigured && document.file_path) return downloadDocument(document.file_path, document.file_name)
      if (document.file_url) return downloadRemoteFile(document.file_url, document.file_name)
      triggerTextDownload({ title: document.file_name, name: document.file_name, size: document.size, uploadedAt: document.uploadedAt, uploadedBy: document.uploadedBy, description: document.description })
    } catch (error) {
      toast.error(error?.message || 'Failed to download medical document')
    }
  }

  function beginDocumentEdit(document, documentKind = 'medical') {
    setEditingMedical({ ...document, documentKind })
    setMedicalEditDescription(document.description || '')
  }

  async function saveMedicalEdit(event) {
    event.preventDefault()
    const description = medicalEditDescription.trim()
    if (!description) return toast.error('Description is required')
    try {
      if (isSupabaseConfigured) await updateDocument(editingMedical.id, { description })
      const updateDocuments = (current) => current.map((document) => document.id === editingMedical.id ? { ...document, description } : document)
      if (editingMedical.documentKind === 'contract') setContractDocuments(updateDocuments)
      else if (editingMedical.documentKind === 'license') setLicenseDocuments(updateDocuments)
      else if (editingMedical.documentKind === 'marketing') setMarketingDocuments(updateDocuments)
      else if (editingMedical.documentKind === 'report') setReportDocuments(updateDocuments)
      else setMedicalDocuments(updateDocuments)
      setEditingMedical(null)
      const documentLabel = editingMedical.documentKind === 'contract' ? 'Contract' : editingMedical.documentKind === 'license' ? 'License document' : editingMedical.documentKind === 'marketing' ? 'Marketing document' : editingMedical.documentKind === 'report' ? 'Report' : 'Medical document'
      toast.success(`${documentLabel} updated`)
    } catch (error) {
      toast.error(error?.message || 'Failed to update medical document')
    }
  }

  async function handleDocumentDelete(document, documentKind = 'medical') {
    if (!window.confirm(`Delete ${document.file_name}?`)) return
    try {
      if (isSupabaseConfigured) await deleteDocument(document.id, document.file_path)
      const removeDocument = (current) => current.filter((item) => item.id !== document.id)
      if (documentKind === 'contract') setContractDocuments(removeDocument)
      else if (documentKind === 'license') setLicenseDocuments(removeDocument)
      else if (documentKind === 'marketing') setMarketingDocuments(removeDocument)
      else if (documentKind === 'report') setReportDocuments(removeDocument)
      else setMedicalDocuments(removeDocument)
      setPreviewMedical((current) => current?.id === document.id ? null : current)
      const documentLabel = documentKind === 'contract' ? 'Contract' : documentKind === 'license' ? 'License document' : documentKind === 'marketing' ? 'Marketing document' : documentKind === 'report' ? 'Report' : 'Medical document'
      toast.success(`${documentLabel} deleted`)
    } catch (error) {
      const documentLabel = documentKind === 'contract' ? 'contract' : documentKind === 'license' ? 'license document' : documentKind === 'marketing' ? 'marketing document' : documentKind === 'report' ? 'report' : 'medical document'
      toast.error(error?.message || `Failed to delete ${documentLabel}`)
    }
  }

  const previewTitle = previewDraft?.title || 'CV Draft Preview'

  return (
    <Layout title="Admin Dashboard">
      <div id="documents-cvs-page" className="mx-auto max-w-[1190px] animate-fade-in px-2 pb-8 pt-6 sm:px-4 lg:px-6">
        <header className="mb-5">
          <h1 className="text-2xl font-bold text-primary">Documents</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage contracts, licenses, certifications, and other important documents
          </p>
        </header>
        <DocumentsTabs activeTab={activeTab} onChange={setActiveTab} onUnavailable={handleUnavailableTab} />

        {activeTab === 'medical-reports' && (
          <MedicalReportsPanel
            documentsBySection={medicalBySection}
            selectedBySection={medicalSelected}
            onToggle={toggleMedical}
            onToggleAll={toggleAllMedical}
            onUpload={(file, section, source) => handleUpload(file, source, section, 'medical')}
            onPreview={setPreviewMedical}
            onEdit={(document) => beginDocumentEdit(document, 'medical')}
            onDownload={handleMedicalDownload}
            onDelete={(document) => handleDocumentDelete(document, 'medical')}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractsPanel
            documentsBySection={contractsBySection}
            selectedBySection={contractSelected}
            onToggle={toggleContract}
            onToggleAll={toggleAllContracts}
            onUpload={(file, section, source) => handleUpload(file, source, section, 'contract')}
            onPreview={setPreviewMedical}
            onEdit={(document) => beginDocumentEdit(document, 'contract')}
            onDownload={handleMedicalDownload}
            onDelete={(document) => handleDocumentDelete(document, 'contract')}
          />
        )}

        {activeTab === 'licenses-certifications' && (
          <LicensesCertificationsPanel
            documentsBySection={licensesBySection}
            selectedBySection={licenseSelected}
            onToggle={toggleLicense}
            onToggleAll={toggleAllLicenses}
            onUpload={(file, section, source) => handleUpload(file, source, section, 'license')}
            onPreview={setPreviewMedical}
            onEdit={(document) => beginDocumentEdit(document, 'license')}
            onDownload={handleMedicalDownload}
            onDelete={(document) => handleDocumentDelete(document, 'license')}
          />
        )}

        {activeTab === 'adverts-marketing' && (
          <AdvertsMarketingPanel
            documentsBySection={marketingBySection}
            selectedBySection={marketingSelected}
            onToggle={toggleMarketing}
            onToggleAll={toggleAllMarketing}
            onUpload={(file, section, source) => handleUpload(file, source, section, 'marketing')}
            onPreview={setPreviewMedical}
            onEdit={(document) => beginDocumentEdit(document, 'marketing')}
            onDownload={handleMedicalDownload}
            onDelete={(document) => handleDocumentDelete(document, 'marketing')}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsPanel
            documentsBySection={reportsBySection}
            selectedBySection={reportSelected}
            onToggle={toggleReport}
            onToggleAll={toggleAllReports}
            onUpload={(file, section, source) => handleUpload(file, source, section, 'report')}
            onPreview={setPreviewMedical}
            onEdit={(document) => beginDocumentEdit(document, 'report')}
            onDownload={handleMedicalDownload}
            onDelete={(document) => handleDocumentDelete(document, 'report')}
          />
        )}

        {activeTab === 'cvs' && (
        <div className="mt-6 space-y-6">
          <CVIntegrationBanner onClear={handleClearDrafts} disabled={clearing} />
          {loading && (
            <div role="status" className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
              Loading CV documents…
            </div>
          )}
          <CVDocumentSection
            id="cv-builder-cvs"
            icon={FileText}
            title="CV Builder CVs"
            subtitle="CVs created and saved from the CV Builder application"
            documents={builderCVs}
            onUpload={(file) => handleUpload(file, 'cv-builder')}
            onCamera={(file) => handleUpload(file, 'cv-builder')}
          />
          <CVDocumentSection
            id="uploaded-cvs"
            icon={Upload}
            title="Uploaded CVs"
            subtitle="CVs uploaded manually by users"
            documents={uploadedCVs}
            onUpload={(file) => handleUpload(file, 'manual')}
            onCamera={(file) => handleUpload(file, 'manual')}
          />
          <CVDraftsSection
            drafts={drafts}
            selectedIds={selectedIds}
            onToggle={handleToggleDraft}
            onToggleAll={handleToggleAll}
            onUpload={(file) => handleUpload(file, 'draft')}
            onCamera={(file) => handleUpload(file, 'draft')}
            onPreview={setPreviewDraft}
            onEdit={handleEditDraft}
            onDownload={handleDownloadDraft}
            onDelete={handleDeleteDraft}
          />
        </div>
        )}

        <Modal isOpen={Boolean(previewMedical)} onClose={() => setPreviewMedical(null)} title={previewMedical?.file_name || 'Medical Document Preview'}>
          <dl className="grid gap-3 text-sm text-text-secondary">
            <div><dt className="font-semibold text-text-primary">File size</dt><dd>{previewMedical?.size}</dd></div>
            <div><dt className="font-semibold text-text-primary">Uploaded</dt><dd>{previewMedical?.uploadedAt} by {previewMedical?.uploadedBy}</dd></div>
            <div><dt className="font-semibold text-text-primary">Description</dt><dd>{previewMedical?.description}</dd></div>
          </dl>
        </Modal>

        <Modal isOpen={Boolean(editingMedical)} onClose={() => setEditingMedical(null)} title={editingMedical?.documentKind === 'contract' ? 'Edit contract' : editingMedical?.documentKind === 'license' ? 'Edit license document' : editingMedical?.documentKind === 'marketing' ? 'Edit marketing document' : editingMedical?.documentKind === 'report' ? 'Edit report' : 'Edit medical document'} size="sm">
          <form onSubmit={saveMedicalEdit} className="space-y-4">
            <div><label htmlFor="medical-description" className="mb-1 block text-sm font-medium text-text-secondary">Description</label><textarea id="medical-description" value={medicalEditDescription} onChange={(event) => setMedicalEditDescription(event.target.value)} rows={4} autoFocus className="w-full rounded-lg border border-cream px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div className="flex justify-end gap-3 border-t border-cream pt-4"><button type="button" onClick={() => setEditingMedical(null)} className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:bg-cream">Cancel</button><button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">Save changes</button></div>
          </form>
        </Modal>

        <Modal isOpen={Boolean(previewDraft)} onClose={() => setPreviewDraft(null)} title={previewTitle}>
          <div>
            <dl className="grid gap-3 text-sm text-text-secondary">
              <div><dt className="font-semibold text-text-primary">File size</dt><dd>{previewDraft?.size}</dd></div>
              <div><dt className="font-semibold text-text-primary">Uploaded</dt><dd>{previewDraft?.uploadedAt} • {previewDraft?.uploadedBy}</dd></div>
              <div><dt className="font-semibold text-text-primary">Description</dt><dd>{previewDraft?.description}</dd></div>
            </dl>
          </div>
        </Modal>

        <Modal isOpen={Boolean(pendingUpload)} onClose={closeUploadModal} title={pendingUpload?.documentKind === 'contract' ? 'Link contract to candidate' : pendingUpload?.documentKind === 'license' ? 'Link license document to candidate' : pendingUpload?.documentKind === 'marketing' ? 'Link marketing document to candidate' : pendingUpload?.documentKind === 'report' ? 'Link report to candidate' : pendingUpload?.documentKind === 'medical' ? 'Link medical document to candidate' : 'Link CV to candidate'} size="sm">
          <form onSubmit={confirmSupabaseUpload} className="space-y-4">
            <p className="text-sm text-text-secondary">
              Enter the candidate ID before uploading <span className="font-medium text-text-primary">{pendingUpload?.file.name}</span>.
            </p>
            <div>
              <label htmlFor="upload-candidate-id" className="mb-1 block text-sm font-medium text-text-secondary">Candidate ID</label>
              <input
                id="upload-candidate-id"
                value={candidateId}
                onChange={(event) => setCandidateId(event.target.value)}
                autoComplete="off"
                autoFocus
                disabled={uploading}
                className="w-full rounded-lg border border-cream bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div className="flex justify-end gap-3 border-t border-cream pt-4">
              <button type="button" onClick={closeUploadModal} disabled={uploading} className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-cream disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={uploading} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
                {uploading ? 'Uploading…' : pendingUpload?.documentSection ? 'Upload Document' : 'Upload CV'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
