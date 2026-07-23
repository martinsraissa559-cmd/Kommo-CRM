import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const { user, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'entrar' | 'criar_conta'>('entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const result = mode === 'entrar' ? await signIn(email, password) : await signUp(email, password)

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (mode === 'criar_conta') {
      setInfo('Conta criada. Verifique seu e-mail para confirmar o acesso, se necessário, e faça login.')
      setMode('entrar')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Mapeador de Funil IA</h1>
        <p className="auth-subtitle">
          {mode === 'entrar' ? 'Entre para continuar' : 'Crie sua conta'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          {info && <p className="form-info">{info}</p>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Aguarde...' : mode === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          className="btn-link"
          onClick={() => {
            setMode(mode === 'entrar' ? 'criar_conta' : 'entrar')
            setError(null)
            setInfo(null)
          }}
        >
          {mode === 'entrar' ? 'Não tem conta? Criar uma agora' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  )
}
