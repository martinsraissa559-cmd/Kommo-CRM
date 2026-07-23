import { BLOCKS, OTHER_SUFFIX } from './blocks'

function formatAnswer(value: unknown, otherValue: string): string {
  if (value === undefined || value === null || value === '') return '—'

  if (Array.isArray(value)) {
    const parts = value.map((v) => (v === 'Outro' && otherValue ? `Outro: ${otherValue}` : String(v)))
    return parts.length ? parts.join(', ') : '—'
  }

  if (value === 'Outro' && otherValue) return `Outro: ${otherValue}`

  return String(value)
}

export function Resumo({ respostas }: { respostas: Record<string, unknown> }) {
  return (
    <div className="resumo">
      {BLOCKS.map((block) => (
        <div className="resumo-block" key={block.title}>
          <h3>{block.title}</h3>
          {block.questions.map((q) => (
            <div className="resumo-item" key={q.id}>
              <strong>{q.label}</strong>
              <span>{formatAnswer(respostas[q.id], (respostas[`${q.id}${OTHER_SUFFIX}`] as string) ?? '')}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
