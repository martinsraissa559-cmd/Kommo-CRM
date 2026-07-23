import type { Question } from './blocks'

interface Props {
  question: Question
  value: unknown
  otherValue: string
  onChange: (value: unknown) => void
  onOtherChange: (value: string) => void
}

export function QuestionField({ question, value, otherValue, onChange, onOtherChange }: Props) {
  return (
    <div className="question">
      <label className="question-label" htmlFor={question.id}>
        {question.label}
      </label>
      {question.helper && <p className="question-helper">{question.helper}</p>}

      {question.type === 'texto_curto' && (
        <input
          id={question.id}
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === 'texto_longo' && (
        <textarea
          id={question.id}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === 'numero' && question.prefix && (
        <div className="input-prefix-group">
          <span>{question.prefix}</span>
          <input
            id={question.id}
            type="number"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {question.type === 'numero' && !question.prefix && (
        <input
          id={question.id}
          type="number"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === 'escolha_unica' && (
        <div className="choice-options">
          {question.options?.map((opt) => (
            <label className="choice-option" key={opt}>
              <input
                type="radio"
                name={question.id}
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              {opt}
            </label>
          ))}
          {question.allowOther && (
            <label className="choice-option">
              <input
                type="radio"
                name={question.id}
                checked={value === 'Outro'}
                onChange={() => onChange('Outro')}
              />
              Outro
            </label>
          )}
          {question.allowOther && value === 'Outro' && (
            <input
              className="choice-other-input"
              type="text"
              placeholder="Qual?"
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
            />
          )}
        </div>
      )}

      {question.type === 'escolha_multipla' && (
        <div className="choice-options">
          {question.options?.map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt)
            return (
              <label className="choice-option" key={opt}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
                    const current = Array.isArray(value) ? [...(value as string[])] : []
                    if (selected) {
                      onChange(current.filter((v) => v !== opt))
                    } else {
                      onChange([...current, opt])
                    }
                  }}
                />
                {opt}
              </label>
            )
          })}
          {question.allowOther && (
            <label className="choice-option">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes('Outro')}
                onChange={() => {
                  const current = Array.isArray(value) ? [...(value as string[])] : []
                  const selected = current.includes('Outro')
                  onChange(selected ? current.filter((v) => v !== 'Outro') : [...current, 'Outro'])
                }}
              />
              Outro
            </label>
          )}
          {question.allowOther && Array.isArray(value) && value.includes('Outro') && (
            <input
              className="choice-other-input"
              type="text"
              placeholder="Qual?"
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
            />
          )}
        </div>
      )}
    </div>
  )
}
