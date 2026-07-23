import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { FunilGerado, Mapeamento } from '../lib/types'
import { FunilCard } from '../components/FunnelView/FunilCard'

export function VisualizarMapeamento() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [mapeamento, setMapeamento] = useState<Mapeamento | null>(null)
  const [funis, setFunis] = useState<FunilGerado[]>([])
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return

    const { data: mData, error: mError } = await supabase
      .from('mapeamentos')
      .select('*')
      .eq('id', id)
      .single()

    if (mError || !mData) {
      setErro('Mapeamento não encontrado.')
      setLoading(false)
      return
    }

    if (mData.status === 'em_preenchimento') {
      navigate(`/novo?id=${id}`, { replace: true })
      return
    }

    setMapeamento(mData)

    if (mData.status === 'concluido') {
      const { data: fData } = await supabase
        .from('funis_gerados')
        .select('*')
        .eq('mapeamento_id', id)
        .order('ordem', { ascending: true })
      setFunis(fData ?? [])
    }

    setLoading(false)
  }, [id, navigate])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (mapeamento?.status !== 'processando_ia') return
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [mapeamento?.status, load])

  async function handleGerar() {
    if (!id) return
    setGerando(true)
    setErro(null)

    const { error: fnError } = await supabase.functions.invoke('gerar-funil', {
      body: { mapeamento_id: id },
    })

    setGerando(false)

    if (fnError) {
      setErro(fnError.message)
      return
    }

    load()
  }

  function handleExportar() {
    if (!mapeamento) return
    const payload = {
      nome_negocio: mapeamento.nome_negocio,
      funis: funis.map((f) => ({
        nome_funil: f.nome_funil,
        tipo_funil: f.tipo_funil,
        justificativa: f.justificativa,
        etapas: f.etapas,
      })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `funil-${(mapeamento.nome_negocio || 'negocio').toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="page">
        <p className="page-loading">Carregando...</p>
      </div>
    )
  }

  if (erro && !mapeamento) {
    return (
      <div className="page">
        <p className="form-error">{erro}</p>
      </div>
    )
  }

  if (!mapeamento) return null

  return (
    <div className="page">
      <div className="page-header">
        <h1>{mapeamento.nome_negocio || 'Mapeamento'}</h1>
        {mapeamento.status === 'concluido' && (
          <button className="btn-secondary" onClick={handleExportar}>
            Exportar JSON
          </button>
        )}
      </div>

      {mapeamento.status === 'processando_ia' && (
        <div className="gerar-ia-panel">
          <p>A IA está analisando as respostas e montando os funis. Isso pode levar até um minuto...</p>
        </div>
      )}

      {mapeamento.status === 'erro' && (
        <div className="gerar-ia-panel">
          <p>Não foi possível gerar o funil.</p>
          {erro && <p className="form-error">{erro}</p>}
          {mapeamento.erro_detalhe && <p className="form-error">{mapeamento.erro_detalhe}</p>}
          <button className="btn-primary" onClick={handleGerar} disabled={gerando}>
            {gerando ? 'Tentando novamente...' : 'Tentar novamente'}
          </button>
        </div>
      )}

      {mapeamento.status === 'concluido' && funis.length === 0 && (
        <div className="gerar-ia-panel">
          <p>Ainda não geramos um funil para este mapeamento.</p>
          <button className="btn-primary" onClick={handleGerar} disabled={gerando}>
            {gerando ? 'Gerando...' : 'Gerar meu funil com IA'}
          </button>
        </div>
      )}

      {mapeamento.status === 'concluido' &&
        funis.map((funil) => <FunilCard key={funil.id} funil={funil} />)}
    </div>
  )
}
