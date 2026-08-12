import { useRef } from 'react'
import { Camera, Upload } from 'lucide-react'

export default function CVUploadButton({ camera = false, onFile }) {
  const inputRef = useRef(null)
  const Icon = camera ? Camera : Upload
  const label = camera ? 'Camera' : 'Upload'

  function handleChange(event) {
    const input = event.currentTarget
    const file = input.files?.[0]

    try {
      if (file) onFile(file)
    } finally {
      input.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        capture={camera ? 'environment' : undefined}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${
          camera
            ? 'border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100'
            : 'border-cream bg-white text-primary hover:bg-cream-warm'
        } inline-flex items-center gap-2 rounded-lg border px-4 py-1.5 text-[13px] font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </button>
    </>
  )
}
