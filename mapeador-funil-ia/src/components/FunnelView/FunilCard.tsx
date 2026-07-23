import { useState } from 'react'
import type { FunilGerado } from '../../lib/types'
import { FunnelKanban } from './FunnelKanban'
import { FunnelTable } from './FunnelTable'

const TIPO_LABEL: Record<string, string> = {
  qualificacao: 'Engajamento & Qualificação',
  vendas: 'Vendas / Fechamento',
  comparecimento: 'Comparecimento',
  pos_venda: 'Pós-venda',
  outro: 'Outro',
}

export function FunilCard({ funil }: { funil: FunilGerado }) {
  const [view, setView] = useState<'kanban' | 'tabela'>('kanban')

  return (
    <div className="funil-card">
      <div className="funil-card-header">
        <span className="funil-tipo">{TIPO_LABEL[funil.tipo_funil] ?? funil.tipo_funil}</span>
        <h2>{funil.nome_funil}</h2>
        {funil.justificativa && <p className="funil-justificativa">{funil.justificativa}</p>}
      </div>

      <div style={{ padding: '16px 24px 0' }}>
        <div className="view-toggle">
          <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>
            Kanban
          </button>
          <button className={view === 'tabela' ? 'active' : ''} onClick={() => setView('tabela')}>
            Tabela
          </button>
        </div>
      </div>

      {view === 'kanban' ? <FunnelKanban funil={funil} /> : <FunnelTable funil={funil} />}
    </div>
  )
}
