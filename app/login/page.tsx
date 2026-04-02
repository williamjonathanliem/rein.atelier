'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [checking, setChecking] = useState(true)

  // If already logged in, redirect straight to dashboard.
  // Safety timeout: if getSession hangs, stop spinning after 3s.
  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 3000)
    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(timer)
      if (data.session) {
        window.location.href = '/dashboard'
      } else {
        setChecking(false)
      }
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Full page navigation so the middleware reads the fresh cookie
      window.location.href = '/dashboard'
    }
  }

  if (checking) {
    return (
      <div style={styles.fullPage}>
        <div style={styles.spinner} />
      </div>
    )
  }

  return (
    <div style={styles.fullPage}>
      {/* Ambient background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>🌸</div>
          <span style={styles.logoText}>rein.atelier</span>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to your dashboard</p>

        {error && (
          <div style={styles.errorBox}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-email">Email</label>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={styles.input}
                onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)' }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-password">Password</label>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ ...styles.input, paddingRight: 40 }}
                onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)' }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            onMouseOver={e => { if (!loading) (e.target as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { (e.target as HTMLElement).style.transform = 'translateY(0)' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span style={styles.btnSpinner} />
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p style={styles.footer}>
          rein.atelier &copy; {new Date().getFullYear()} &middot; Internal dashboard
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-18px) scale(1.03); } }
      `}</style>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  fullPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #f8f7ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Instrument Sans', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: 360,
    height: 360,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 70%)',
    animation: 'float 8s ease-in-out infinite',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-60px',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(196,181,253,0.18) 0%, transparent 70%)',
    animation: 'float 11s ease-in-out infinite reverse',
    pointerEvents: 'none',
  },
  card: {
    background: '#ffffff',
    borderRadius: 24,
    padding: '44px 40px 36px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(109,40,217,0.12), 0 4px 16px rgba(0,0,0,0.06)',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(167,139,250,0.15)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    boxShadow: '0 2px 8px rgba(167,139,250,0.25)',
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 18,
    color: '#1e1b4b',
    letterSpacing: '-0.3px',
  },
  heading: {
    fontSize: 26,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 6px',
    letterSpacing: '-0.5px',
    fontFamily: "'Syne', sans-serif",
  },
  subheading: {
    fontSize: 14,
    color: '#6b7280',
    margin: '0 0 28px',
    fontWeight: 400,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#dc2626',
    fontWeight: 500,
    marginBottom: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    color: '#9ca3af',
    pointerEvents: 'none',
    flexShrink: 0,
  },
  input: {
    width: '100%',
    paddingLeft: 38,
    paddingRight: 14,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 14,
    fontFamily: 'inherit',
    color: '#111827',
    background: '#fafafa',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 6,
  },
  submitBtn: {
    marginTop: 4,
    width: '100%',
    padding: '13px 0',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    letterSpacing: '0.1px',
  },
  btnSpinner: {
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(167,139,250,0.25)',
    borderTopColor: '#8b5cf6',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
  },
}
