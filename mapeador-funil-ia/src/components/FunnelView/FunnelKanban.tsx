import type { Etapa, FunilGerado } from '../../lib/types'

function ListField({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <div className="kanban-field">
      <div className="kanban-field-label">{label}</div>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function TextField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="kanban-field">
      <div className="kanban-field-label">{label}</div>
      <p className="kanban-field-value">{value}</p>
    </div>
  )
}

function EtapaColumn({ etapa }: { etapa: Etapa }) {
  const isPerdido = /perdido|desqualificad/i.test(etapa.nome)
  return (
    <div className={`kanban-col${isPerdido ? ' perdido' : ''}`}>
      <h4>{etapa.nome}</h4>
      <TextField label="Objetivo" value={etapa.objetivo} />
      <TextField label="Gatilho de entrada" value={etapa.gatilho_entrada} />
      <TextField label="Gatilho de saída" value={etapa.gatilho_saida} />
      <ListField label="Tarefas" items={etapa.tarefas} />
      <ListField label="Campos obrigatórios" items={etapa.campos_obrigatorios} />
      <ListField label="Campos desejáveis" items={etapa.campos_desejaveis} />
      <TextField label="SLA" value={etapa.sla} />
      <ListField label="Regras de negócio" items={etapa.regras_negocio} />
      <ListField label="Regras de perda" items={etapa.regras_perda} />
      <TextField label="Responsável" value={etapa.responsavel} />
      <ListField label="Automação" items={etapa.automacao} />
      <TextField label="Script sugerido" value={etapa.script_sugerido} />
    </div>
  )
}

export function FunnelKanban({ funil }: { funil: FunilGerado }) {
  return (
    <div className="kanban-scroll">
      <div className="kanban">
        {funil.etapas.map((etapa, i) => (
          <EtapaColumn etapa={etapa} key={i} />
        ))}
      </div>
    </div>
  )
}
