import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import type { Mapeamento, StatusMapeamento } from '../lib/types'

const STATUS_LABEL: Record<StatusMapeamento, string> = {
  em_preenchimento: 'Em preenchimento',
  processando_ia: 'Processando IA',
  concluido: 'Concluído',
  erro: 'Erro',
}

const STATUS_CLASS: Record<StatusMapeamento, string> = {
  em_preenchimento: 'badge-neutral',
  processando_ia: 'badge-processing',
  concluido: 'badge-success',
  erro: 'badge-error',
}

export function Dashboard() {
  const { user } = useAuth()
  const [mapeamentos, setMapeamentos] = useState<Mapeamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    supabase
      .from('mapeamentos')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setMapeamentos(data ?? [])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Seus mapeamentos</h1>
        <Link to="/novo" className="btn-primary">
          + Novo mapeamento
        </Link>
      </div>

      {loading && <p className="page-loading">Carregando...</p>}

      {!loading && mapeamentos.length === 0 && (
        <div className="empty-state">
          <p>Você ainda não fez nenhum mapeamento de processo.</p>
          <Link to="/novo" className="btn-primary">
            Começar agora
          </Link>
        </div>
      )}

      {!loading && mapeamentos.length > 0 && (
        <div className="card-list">
          {mapeamentos.map((m) => {
            const href = m.status === 'em_preenchimento' ? `/novo?id=${m.id}` : `/mapeamento/${m.id}`
            return (
              <Link to={href} key={m.id} className="card-list-item">
                <div className="card-list-main">
                  <span className="card-list-title">{m.nome_negocio || 'Sem nome ainda'}</span>
                  <span className="card-list-date">
                    Atualizado em {new Date(m.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span className={`badge ${STATUS_CLASS[m.status]}`}>{STATUS_LABEL[m.status]}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
