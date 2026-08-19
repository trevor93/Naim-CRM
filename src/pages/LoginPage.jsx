import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password, name)
        toast.success('Account created! Check your email for verification.')
      } else {
        await login(email, password)
        toast.success('Welcome back!')
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-light via-beige to-cream p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            <img
              src="/assets/naim-agency-logo.png"
              alt="Naim Agency logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Naim CRM App</h1>
          <p className="mt-1 text-sm text-text-secondary">Recruitment Management System</p>
        </div>

        <div className="rounded-2xl border border-cream bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-center text-lg font-semibold text-text-primary">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-secondary">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="font-medium text-primary hover:text-primary-hover"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
