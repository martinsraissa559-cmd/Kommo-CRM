import type { FunilGerado } from '../../lib/types'

function renderList(items: string[]) {
  if (!items || items.length === 0) return '—'
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export function FunnelTable({ funil }: { funil: FunilGerado }) {
  return (
    <div className="funil-table-wrap">
      <table className="funil-table">
        <thead>
          <tr>
            <th>Etapa</th>
            <th>Objetivo</th>
            <th>Gatilho de entrada</th>
            <th>Gatilho de saída</th>
            <th>Tarefas</th>
            <th>Campos obrigatórios</th>
            <th>Campos desejáveis</th>
            <th>SLA</th>
            <th>Regras de negócio</th>
            <th>Regras de perda</th>
            <th>Responsável</th>
            <th>Automação</th>
            <th>Script sugerido</th>
          </tr>
        </thead>
        <tbody>
          {funil.etapas.map((etapa, i) => (
            <tr key={i}>
              <td>{etapa.nome}</td>
              <td>{etapa.objetivo}</td>
              <td>{etapa.gatilho_entrada}</td>
              <td>{etapa.gatilho_saida}</td>
              <td>{renderList(etapa.tarefas)}</td>
              <td>{renderList(etapa.campos_obrigatorios)}</td>
              <td>{renderList(etapa.campos_desejaveis)}</td>
              <td>{etapa.sla}</td>
              <td>{renderList(etapa.regras_negocio)}</td>
              <td>{renderList(etapa.regras_perda)}</td>
              <td>{etapa.responsavel}</td>
              <td>{renderList(etapa.automacao)}</td>
              <td>{etapa.script_sugerido ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
