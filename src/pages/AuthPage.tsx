import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTE_PATHS } from '@/constants/app'
import { useUserStore } from '@/store/useUserStore'
import { Logo } from '@/components/ui/Logo'
import { SignUpScreen } from '@/components/auth/SignUpScreen'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('signup')
  const navigate = useNavigate()
  const markInteracted = useUserStore((state) => state.markInteracted)
  const setProfile = useUserStore((state) => state.setProfile)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [forgotSent, setForgotSent] = useState(false)

  const handleGuest = () => {
    // Clear profile to represent guest
    setProfile(null)
    markInteracted()
    navigate(ROUTE_PATHS.chat, { replace: true })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!email) newErrors.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Please enter a valid email address'

    if (mode === 'login' && !password) {
      newErrors.password = 'Password is required'
    }

    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})

    if (mode === 'forgot') {
      setForgotSent(true)
      return
    }

    const dateStr = new Date().toISOString().split('T')[0] ?? '2025-01-01'
    setProfile({
      id: 'u_' + Date.now(),
      name: 'Logged In User',
      email,
      avatarInitials: (email[0] ?? 'U').toUpperCase(),
      memberSince: dateStr
    })
    markInteracted()
    navigate(ROUTE_PATHS.forYou, { replace: true })
  }

  if (mode === 'signup') {
    return <SignUpScreen onLoginClick={() => setMode('login')} />
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-sunken p-6">
      <div className="flex flex-1 flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo variant="stacked" className="text-brand h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-ink mt-2">
            {mode === 'login' ? 'Welcome back' : 'Reset password'}
          </h1>
          <p className="text-sm text-ink-subtle mt-1 text-center">
            {mode === 'login'
              ? 'Log in to see your saved products and tailored feed.'
              : 'Enter your email and we will send you a reset link.'}
          </p>
        </div>

        {mode === 'forgot' && forgotSent ? (
          <div className="w-full text-center space-y-6">
            <div className="p-4 bg-brand-soft rounded-2xl text-brand text-sm font-medium">
              If an account exists for this email, a reset link has been sent.
            </div>
            <Button variant="outline" className="w-full rounded-2xl" onClick={() => { setMode('login'); setForgotSent(false); }}>
              Back to Log In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-ink-subtle" />
                <input 
                  type="email" 
                  placeholder="Email address" 
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }}
                  className={`w-full rounded-2xl bg-surface border ${errors.email ? 'border-critical' : 'border-ink-subtle/20'} py-3 pl-10 pr-4 text-ink focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors`}
                />
              </div>
              {errors.email && <p className="text-xs text-critical pl-2">{errors.email}</p>}
            </div>

            {mode === 'login' && (
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-ink-subtle" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Password" 
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })) }}
                    className={`w-full rounded-2xl bg-surface border ${errors.password ? 'border-critical' : 'border-ink-subtle/20'} py-3 pl-10 pr-10 text-ink focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-critical pl-2">{errors.password}</p>}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setMode('forgot')} className="text-sm font-medium text-brand hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full py-6 text-base font-semibold rounded-2xl mt-4">
              {mode === 'login' ? 'Log In' : 'Send reset link'}
            </Button>
          </form>
        )}

        <div className="mt-8 flex flex-col items-center space-y-4 w-full">
          {mode !== 'forgot' && (
            <>
              <div className="flex items-center w-full">
                <div className="flex-1 h-px bg-ink-subtle/20" />
                <span className="px-3 text-xs text-ink-subtle uppercase">or</span>
                <div className="flex-1 h-px bg-ink-subtle/20" />
              </div>
              
              <button 
                type="button"
                onClick={handleGuest}
                className="group flex items-center gap-2 text-sm font-medium text-ink hover:text-brand transition-colors"
              >
                Continue as Guest
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

          <div className="w-full h-px bg-ink-subtle/20 mt-4" />
          
          <button 
            type="button"
            onClick={() => {
              setMode('signup')
              setErrors({})
            }}
            className="text-sm text-ink-subtle hover:text-ink transition-colors"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  )
}
