import { useState } from 'react'
import { Save } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { updateCandidate } from '../../services/candidateService'
import { isSupabaseConfigured } from '../../supabase/client'
import { demoCandidatesList } from '../../services/demoData'
import { useToast } from '../../contexts/ToastContext'
import { CANDIDATE_STATUSES } from './StatusDropdown'

const STAGE_OPTIONS = CANDIDATE_STATUSES.map((status) => status.label)

// Candidate salaries are stored for display ("Ksh 1,100.00" / "N/A") in demo
// mode but as a NUMERIC column in Supabase, so the field edits plain digits.
function salaryToInput(value) {
  const digits = String(value ?? '').replace(/[^\d.]/g, '')
  const numeric = Number(digits)
  return digits && Number.isFinite(numeric) ? String(numeric) : ''
}

function salaryToDisplay(value) {
  const numeric = Number(value)
  if (value === '' || !Number.isFinite(numeric)) return 'N/A'
  return `Ksh ${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function CandidateEditForm({ candidate, onSave, onCancel }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: candidate?.name || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    job_title: candidate?.position || candidate?.job_title || '',
    salary: salaryToInput(candidate?.salary),
    stage: candidate?.stage || candidate?.status || STAGE_OPTIONS[0],
    country_applying_to: candidate?.country_applying_to || '',
    passport_number: candidate?.passport_number || '',
  })

  // Keep the candidate's existing stage selectable even if it predates the
  // five statuses used on this page.
  const stageOptions = STAGE_OPTIONS.includes(form.stage) ? STAGE_OPTIONS : [...STAGE_OPTIONS, form.stage]

  function handleChange(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) return toast.error('Full Name is required')
    if (!form.email.trim()) return toast.error('Email is required')
    if (!form.phone.trim()) return toast.error('Phone is required')

    setLoading(true)
    try {
      if (!isSupabaseConfigured) {
        const demo = demoCandidatesList.find((entry) => entry.id === candidate.id)
        if (demo) {
          Object.assign(demo, {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            job_title: form.job_title.trim(),
            position: form.job_title.trim(),
            salary: salaryToDisplay(form.salary),
            stage: form.stage,
            status: form.stage,
            country_applying_to: form.country_applying_to.trim(),
            passport_number: form.passport_number.trim(),
            updated_at: new Date().toISOString(),
          })
        }
      } else {
        await updateCandidate(candidate.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          job_title: form.job_title.trim(),
          salary: form.salary === '' ? null : Number(form.salary),
          stage: form.stage,
          country_applying_to: form.country_applying_to.trim(),
          passport_number: form.passport_number.trim(),
        })
      }
      toast.success('Candidate updated!')
      onSave()
    } catch (error) {
      toast.error(error.message || 'Failed to save candidate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        <Input label="Full Name *" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
        <Input label="Email *" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
        <Input label="Phone *" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} required />
        <Input label="Job Title" value={form.job_title} onChange={(e) => handleChange('job_title', e.target.value)} />
        <Input label="Salary (KES)" inputMode="decimal" value={form.salary} onChange={(e) => handleChange('salary', e.target.value)} />
        <Select label="Stage" value={form.stage} onChange={(e) => handleChange('stage', e.target.value)} options={stageOptions} />
        <div className="sm:col-span-2">
          <Input label="Country Applying To" value={form.country_applying_to} onChange={(e) => handleChange('country_applying_to', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Input label="Passport Number" value={form.passport_number} onChange={(e) => handleChange('passport_number', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-cream pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {!loading && <Save className="h-4 w-4" aria-hidden="true" />}
          Update Candidate
        </Button>
      </div>
    </form>
  )
}
