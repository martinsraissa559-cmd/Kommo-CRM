import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './routes/Login'
import { Dashboard } from './routes/Dashboard'
import { NovoMapeamento } from './routes/NovoMapeamento'
import { VisualizarMapeamento } from './routes/VisualizarMapeamento'

function TopBar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <header className="topbar">
      <Link to="/" className="topbar-brand">
        Mapeador de Funil <span>IA</span>
      </Link>
      <div className="topbar-right">
        <span className="topbar-email">{user.email}</span>
        <button
          className="btn-link"
          onClick={async () => {
            await signOut()
            navigate('/login')
          }}
        >
          Sair
        </button>
      </div>
    </header>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TopBar />
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/novo"
              element={
                <ProtectedRoute>
                  <NovoMapeamento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mapeamento/:id"
              element={
                <ProtectedRoute>
                  <VisualizarMapeamento />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
