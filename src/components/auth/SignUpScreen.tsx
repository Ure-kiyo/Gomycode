import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { ROUTE_PATHS } from '@/constants/app'
import { useUserStore } from '@/store/useUserStore'

export interface SignUpScreenProps {
  onLoginClick: () => void
}

export function SignUpScreen({ onLoginClick }: SignUpScreenProps) {
  const navigate = useNavigate()
  const markInteracted = useUserStore((state) => state.markInteracted)
  const setProfile = useUserStore((state) => state.setProfile)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation Rules
  const isValidEmail = /^\S+@\S+\.\S+$/.test(email)
  const isValidPassword = password.length >= 8 && /\d/.test(password)
  const isPasswordsMatch = password !== '' && password === confirmPassword
  const isNameValid = name.trim().length > 0

  const isFormValid = isNameValid && isValidEmail && isValidPassword && isPasswordsMatch

  // Error tracking (show errors on blur)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    const initials = name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)

    const memberSinceStr = new Date().toISOString().split('T')[0] ?? '2025-01-01'
    setProfile({
      id: 'u_' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      avatarInitials: initials || 'U',
      memberSince: memberSinceStr,
    })
    markInteracted()
    navigate(ROUTE_PATHS.chat, { replace: true })
  }

  const handleGuest = () => {
    setProfile(null)
    markInteracted()
    navigate(ROUTE_PATHS.chat, { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-sunken p-6">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo variant="stacked" className="mb-4 h-12 w-auto text-brand" />
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Create your account</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-subtle">
            Sift through, find what fits — save your searches and get personalized picks
          </p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`w-full rounded-2xl border bg-surface px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand focus:ring-1 focus:ring-brand ${
                touched.name && !isNameValid ? 'border-critical' : 'border-line-strong'
              }`}
            />
            {touched.name && !isNameValid && (
              <p className="px-2 text-xs text-critical">Full name is required</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full rounded-2xl border bg-surface px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand focus:ring-1 focus:ring-brand ${
                touched.email && email && !isValidEmail ? 'border-critical' : 'border-line-strong'
              }`}
            />
            {touched.email && email && !isValidEmail && (
              <p className="px-2 text-xs text-critical">Please enter a valid email address</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full rounded-2xl border bg-surface px-4 py-3 pr-10 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand focus:ring-1 focus:ring-brand ${
                  touched.password && password && !isValidPassword ? 'border-critical' : 'border-line-strong'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle transition-colors hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {touched.password && password && !isValidPassword && (
              <p className="px-2 text-xs text-critical">Minimum 8 characters, at least one number</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full rounded-2xl border bg-surface px-4 py-3 pr-10 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand focus:ring-1 focus:ring-brand ${
                  touched.confirmPassword && confirmPassword && !isPasswordsMatch
                    ? 'border-critical'
                    : 'border-line-strong'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle transition-colors hover:text-ink"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {touched.confirmPassword && confirmPassword && !isPasswordsMatch && (
              <p className="px-2 text-xs text-critical">Passwords do not match</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!isFormValid}
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="flex w-full items-center">
            <div className="h-px flex-1 bg-line-strong/50" />
            <span className="px-4 text-[0.6875rem] font-bold uppercase tracking-wider text-ink-subtle">
              or
            </span>
            <div className="h-px flex-1 bg-line-strong/50" />
          </div>

          <Button type="button" variant="outline" size="lg" fullWidth onClick={handleGuest}>
            Continue as Guest
          </Button>

          <div className="pt-4">
            <button
              type="button"
              onClick={onLoginClick}
              className="text-[0.9375rem] text-ink-subtle transition-colors hover:text-ink"
            >
              Already have an account? <span className="font-semibold text-brand">Log in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
