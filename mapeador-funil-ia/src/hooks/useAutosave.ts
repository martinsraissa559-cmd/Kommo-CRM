import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export type AutosaveStatus = 'idle' | 'salvando' | 'salvo' | 'erro'

export function useAutosave(mapeamentoId: string | null, respostas: Record<string, unknown>) {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (!mapeamentoId) return

    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    setStatus('salvando')
    timeoutRef.current = setTimeout(async () => {
      const nomeNegocio = (respostas['q0_nome_negocio'] as string | undefined) || null

      const { error } = await supabase
        .from('mapeamentos')
        .update({ respostas, nome_negocio: nomeNegocio })
        .eq('id', mapeamentoId)

      setStatus(error ? 'erro' : 'salvo')
    }, 1000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respostas, mapeamentoId])

  return status
}
