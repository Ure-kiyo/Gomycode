import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { TabBar } from '@/components/layout/TabBar'
import { ProductDetailSheet } from '@/components/product/ProductDetailSheet'
import { Toaster } from '@/components/ui/Toaster'
import { ROUTE_PATHS } from '@/constants/app'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { useTheme } from '@/hooks/useTheme'
import { useUserStore } from '@/store/useUserStore'
import { Logo } from '@/components/ui/Logo'

// Lazy-load pages to keep the initial bundle slim.
const ChatPage = lazy(() =>
  import('@/pages/ChatPage').then((m) => ({ default: m.ChatPage })),
)
const ForYouPage = lazy(() =>
  import('@/pages/ForYouPage').then((m) => ({ default: m.ForYouPage })),
)
const AccountPage = lazy(() =>
  import('@/pages/AccountPage').then((m) => ({ default: m.AccountPage })),
)

const AuthPage = lazy(() =>
  import('@/pages/AuthPage').then((m) => ({ default: m.AuthPage })),
)

/**
 * Root app shell.
 *
 * Responsibilities:
 *   - Bootstrap (theme + profile + feed + product hydration)
 *   - Route layout: three tabs, global sheet overlay, toasts
 *   - Smart redirect: new users land on Chat, returning users on For You
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

import { useLocation } from 'react-router-dom'

function AppShell() {
  // Applies data-theme to <html> and keeps it in sync with system preference.
  useTheme()
  const location = useLocation()

  const { isReady } = useAppBootstrap()
  const hasInteracted = useUserStore((state) => state.hasInteracted)
  const profile = useUserStore((state) => state.profile)

  // Show a minimal splash while the mock bootstrap resolves (~500ms).
  if (!isReady) {
    return <BootSplash />
  }

  // Where the root path should redirect depends on first-run state.
  // If no profile and hasn't interacted (guest), force to auth
  const isAuthRoute = location.pathname === ROUTE_PATHS.auth
  const needsAuth = !profile && !hasInteracted && !isAuthRoute

  let homeRedirect = hasInteracted ? ROUTE_PATHS.forYou : ROUTE_PATHS.chat
  if (needsAuth) {
    homeRedirect = ROUTE_PATHS.auth
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <Suspense fallback={null}>
        <Routes>
          {/* Smart home redirect */}
          <Route path={ROUTE_PATHS.root} element={<Navigate to={homeRedirect} replace />} />

          {/* Auth */}
          <Route 
            path={ROUTE_PATHS.auth} 
            element={(hasInteracted || profile) ? <Navigate to={homeRedirect} replace /> : <AuthPage />} 
          />

          {/* Three main tabs */}
          <Route path={ROUTE_PATHS.chat} element={<ChatPage />} />
          <Route path={ROUTE_PATHS.forYou} element={<ForYouPage />} />
          <Route path={ROUTE_PATHS.account} element={<AccountPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={homeRedirect} replace />} />
        </Routes>
      </Suspense>

      {/* Global overlays — always rendered outside the page tree */}
      <ProductDetailSheet />
      <Toaster />

      {/* Bottom tab navigation */}
      {!isAuthRoute && <TabBar />}
    </div>
  )
}

/** Minimal branded splash shown for the ~500ms bootstrap window. */
function BootSplash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface-sunken">
      <div className="flex flex-col items-center gap-3 animate-fade-in animate-drift">
        <Logo variant="stacked" className="scale-150 mb-2" />
      </div>
      {/* Subtle loading dots */}
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-brand-300 animate-typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
