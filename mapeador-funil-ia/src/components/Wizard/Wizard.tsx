import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAutosave } from '../../hooks/useAutosave'
import { BLOCKS, OTHER_SUFFIX } from './blocks'
import { QuestionField } from './QuestionField'
import { Resumo } from './Resumo'

interface Props {
  mapeamentoId: string
  initialRespostas: Record<string, unknown>
}

export function Wizard({ mapeamentoId, initialRespostas }: Props) {
  const navigate = useNavigate()
  const [respostas, setRespostas] = useState<Record<string, unknown>>(initialRespostas)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const autosaveStatus = useAutosave(mapeamentoId, respostas)

  const totalSteps = BLOCKS.length + 1 // +1 for the summary/review step
  const isSummaryStep = step === BLOCKS.length
  const block = !isSummaryStep ? BLOCKS[step] : null
  const progressPct = Math.round(((step + 1) / totalSteps) * 100)

  function updateAnswer(id: string, value: unknown) {
    setRespostas((prev) => ({ ...prev, [id]: value }))
  }

  function updateOther(id: string, value: string) {
    setRespostas((prev) => ({ ...prev, [`${id}${OTHER_SUFFIX}`]: value }))
  }

  function goNext() {
    if (step < totalSteps - 1) setStep(step + 1)
  }

  function goBack() {
    if (step > 0) setStep(step - 1)
  }

  async function handleGerarFunil() {
    setSubmitting(true)
    setSubmitError(null)

    const nomeNegocio = (respostas['q0_nome_negocio'] as string | undefined) || null

    const { error: updateError } = await supabase
      .from('mapeamentos')
      .update({ respostas, nome_negocio: nomeNegocio, status: 'processando_ia' })
      .eq('id', mapeamentoId)

    if (updateError) {
      setSubmitError(updateError.message)
      setSubmitting(false)
      return
    }

    const { error: fnError } = await supabase.functions.invoke('gerar-funil', {
      body: { mapeamento_id: mapeamentoId },
    })

    if (fnError) {
      setSubmitError(fnError.message)
      setSubmitting(false)
      return
    }

    navigate(`/mapeamento/${mapeamentoId}`)
  }

  return (
    <div className="wizard">
      <div className="wizard-progress-track">
        <div className="wizard-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <p className="wizard-progress-label">
        <span>
          {isSummaryStep ? 'Resumo' : `Etapa ${step + 1} de ${BLOCKS.length}`}
        </span>
        <span>{progressPct}%</span>
      </p>

      {block && (
        <>
          <h2 className="wizard-block-title">{block.title}</h2>
          <div className="wizard-questions">
            {block.questions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={respostas[q.id]}
                otherValue={(respostas[`${q.id}${OTHER_SUFFIX}`] as string) ?? ''}
                onChange={(value) => updateAnswer(q.id, value)}
                onOtherChange={(value) => updateOther(q.id, value)}
              />
            ))}
          </div>
        </>
      )}

      {isSummaryStep && (
        <>
          <h2 className="wizard-block-title">Confira suas respostas</h2>
          <Resumo respostas={respostas} />
          {submitError && <p className="form-error">{submitError}</p>}
        </>
      )}

      <div className="wizard-nav">
        <button className="btn-secondary" onClick={goBack} disabled={step === 0 || submitting}>
          Voltar
        </button>
        {!isSummaryStep && (
          <button className="btn-primary" onClick={goNext}>
            Continuar
          </button>
        )}
        {isSummaryStep && (
          <button className="btn-primary" onClick={handleGerarFunil} disabled={submitting}>
            {submitting ? 'Gerando...' : 'Gerar meu funil com IA'}
          </button>
        )}
      </div>

      <p className="wizard-autosave-status">
        {autosaveStatus === 'salvando' && 'Salvando...'}
        {autosaveStatus === 'salvo' && 'Progresso salvo automaticamente'}
        {autosaveStatus === 'erro' && 'Não foi possível salvar. Verifique sua conexão.'}
      </p>
    </div>
  )
}
