import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Wizard } from '../components/Wizard/Wizard'

export function NovoMapeamento() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [mapeamentoId, setMapeamentoId] = useState<string | null>(null)
  const [respostas, setRespostas] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const existingId = searchParams.get('id')

    async function init() {
      if (existingId) {
        const { data, error: fetchError } = await supabase
          .from('mapeamentos')
          .select('*')
          .eq('id', existingId)
          .single()

        if (fetchError || !data) {
          setError('Mapeamento não encontrado.')
          return
        }

        if (data.status === 'concluido') {
          navigate(`/mapeamento/${data.id}`, { replace: true })
          return
        }

        setMapeamentoId(data.id)
        setRespostas(data.respostas ?? {})
        return
      }

      const { data, error: insertError } = await supabase
        .from('mapeamentos')
        .insert({ user_id: user!.id, status: 'em_preenchimento', respostas: {} })
        .select()
        .single()

      if (insertError || !data) {
        setError('Não foi possível iniciar um novo mapeamento.')
        return
      }

      setMapeamentoId(data.id)
      setRespostas(data.respostas ?? {})
      setSearchParams({ id: data.id }, { replace: true })
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (error) {
    return (
      <div className="page">
        <p className="form-error">{error}</p>
      </div>
    )
  }

  if (!mapeamentoId || !respostas) {
    return (
      <div className="page">
        <p className="page-loading">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mapeamento de processo</h1>
      </div>
      <Wizard mapeamentoId={mapeamentoId} initialRespostas={respostas} />
    </div>
  )
}
