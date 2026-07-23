import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const ANTHROPIC_MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-4-6'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Você é um arquiteto de funis de vendas e CRM, especialista em modelar processos comerciais complexos (o mesmo padrão de modelagem usado em funis de clínicas médicas, imobiliárias e negócios de serviço de alto valor).

Você vai receber as respostas de um formulário de mapeamento de processo comercial de um negócio. Sua tarefa é transformar essas respostas na estrutura técnica de um ou mais funis de CRM.

REGRAS:

1. Decida quantos funis fazem sentido para este negócio. Não force um número fixo. Use como referência os tipos comuns: "Engajamento & Qualificação", "Agendamento/Vendas/Fechamento", "Comparecimento" (quando há reagendamento relevante), "Pós-venda/Retenção". Combine ou separe funis conforme a complexidade real do processo descrito. Justifique cada funil escolhido em uma frase.

2. Para cada funil, construa uma lista de ETAPAS. Cada etapa deve ter exatamente estes campos:
   - nome: nome curto da etapa
   - objetivo: o que essa etapa busca alcançar (1 frase)
   - gatilho_entrada: o que faz o lead entrar nessa etapa
   - gatilho_saida: os caminhos possíveis de saída (avanço, retrocesso, perda) e a condição de cada um
   - tarefas: lista de ações que quem trabalha o lead precisa fazer nessa etapa
   - campos_obrigatorios: lista de campos que OBRIGATORIAMENTE precisam ser preenchidos nessa etapa para o processo funcionar (extraia isso das respostas sobre dados coletados, documentos, critérios de qualificação etc.)
   - campos_desejaveis: campos que enriquecem o atendimento mas não bloqueiam o avanço
   - sla: prazo esperado para essa etapa, se houver informação suficiente nas respostas (senão, sugira um prazo razoável e marque como "sugestão")
   - regras_negocio: regras/condições especiais mencionadas que afetam decisões nessa etapa
   - regras_perda: motivos específicos de perda nessa etapa, quando aplicável
   - responsavel: cargo/pessoa responsável (baseado no bloco de "pessoas e responsabilidades")
   - automacao: sugestões de automação para essa etapa (baseadas no que já existe + oportunidades óbvias de melhoria)
   - script_sugerido: um exemplo curto de mensagem/abordagem para essa etapa, no tom apropriado ao negócio (nulo se não fizer sentido, ex: etapas internas)

3. Sempre inclua uma última etapa "Perdido/Desqualificado" com os motivos de perda coletados no formulário.

4. Use linguagem de negócio, mas com o rigor técnico de quem vai configurar isso em um CRM (Kommo, Pipedrive, RD Station etc.) de verdade. Não invente informação que contradiga o que foi respondido — quando faltar informação, escreva "[sugestão — validar com o cliente]" em vez de inventar como se fosse certeza.

5. Responda APENAS com um JSON válido, sem markdown, sem texto fora do JSON, no formato:

{
  "funis": [
    {
      "nome_funil": "string",
      "tipo_funil": "qualificacao | vendas | comparecimento | pos_venda | outro",
      "justificativa": "string",
      "etapas": [
        {
          "nome": "string",
          "objetivo": "string",
          "gatilho_entrada": "string",
          "gatilho_saida": "string",
          "tarefas": ["string"],
          "campos_obrigatorios": ["string"],
          "campos_desejaveis": ["string"],
          "sla": "string",
          "regras_negocio": ["string"],
          "regras_perda": ["string"],
          "responsavel": "string",
          "automacao": ["string"],
          "script_sugerido": "string ou null"
        }
      ]
    }
  ]
}`

const PERGUNTAS: { bloco: string; id: string; label: string }[] = [
  { bloco: 'Sobre o negócio', id: 'q0_nome_negocio', label: 'Nome do negócio' },
  { bloco: 'Sobre o negócio', id: 'q0_descricao_produto', label: 'O que vendem' },
  { bloco: 'Sobre o negócio', id: 'q0_ticket_medio', label: 'Valor médio de cada venda/atendimento (R$)' },
  { bloco: 'Sobre o negócio', id: 'q0_modelo_atendimento', label: 'Atendimento comercial feito por' },

  { bloco: 'Como o lead chega até vocês', id: 'q1_canais_entrada', label: 'Canais de entrada dos leads' },
  { bloco: 'Como o lead chega até vocês', id: 'q1_tempo_primeiro_contato', label: 'Tempo até a primeira resposta' },
  { bloco: 'Como o lead chega até vocês', id: 'q1_triagem_inicial', label: 'Triagem imediata ao chegar' },

  { bloco: 'Qualificação', id: 'q2_criterio_qualificado', label: "O que define 'ter perfil'" },
  { bloco: 'Qualificação', id: 'q2_perguntas_qualificacao', label: 'Perguntas de qualificação usadas' },
  { bloco: 'Qualificação', id: 'q2_desqualifica_na_hora', label: 'O que já elimina o lead na hora' },

  { bloco: 'Agendamento / Proposta', id: 'q3_proximo_passo', label: 'Próximo passo após qualificação' },
  { bloco: 'Agendamento / Proposta', id: 'q3_dados_coletados', label: 'Dados obrigatórios antes de avançar' },
  { bloco: 'Agendamento / Proposta', id: 'q3_prazo_padrao', label: 'Prazo padrão para esse passo' },

  { bloco: 'Apresentação, negociação e fechamento', id: 'q4_como_apresenta_preco', label: 'Como/quando o preço é apresentado' },
  { bloco: 'Apresentação, negociação e fechamento', id: 'q4_objecoes_comuns', label: 'Objeções comuns e respostas' },
  { bloco: 'Apresentação, negociação e fechamento', id: 'q4_o_que_define_venda_ganha', label: "O que define a venda como 'fechada'" },

  { bloco: 'Pós-venda / retenção', id: 'q5_acompanhamento_pos_venda', label: 'Acompanhamento pós-venda' },
  { bloco: 'Pós-venda / retenção', id: 'q5_pede_feedback', label: 'Como/quando pedem feedback' },
  { bloco: 'Pós-venda / retenção', id: 'q5_gatilho_reativacao', label: 'Gatilho de reativação de cliente antigo' },

  { bloco: 'Perda e desqualificação', id: 'q6_motivos_perda', label: 'Principais motivos de perda' },
  { bloco: 'Perda e desqualificação', id: 'q6_lead_sumiu', label: 'O que fazem quando o lead some' },

  { bloco: 'Pessoas e responsabilidades', id: 'q7_responsaveis_por_etapa', label: 'Quem cuida de cada parte do processo' },
  { bloco: 'Pessoas e responsabilidades', id: 'q7_tamanho_equipe', label: 'Tamanho da equipe comercial' },

  { bloco: 'Ferramentas e automação atual', id: 'q8_ferramentas_atuais', label: 'Ferramentas usadas hoje' },
  { bloco: 'Ferramentas e automação atual', id: 'q8_automacoes_existentes', label: 'Automações já existentes' },

  { bloco: 'Particularidades do negócio', id: 'q9_diferenca_tipo_cliente', label: 'Tipos de cliente com caminhos diferentes' },
  { bloco: 'Particularidades do negócio', id: 'q9_documentos_ou_aprovacoes', label: 'Documentos/aprovações necessárias' },
  { bloco: 'Particularidades do negócio', id: 'q9_regra_importante', label: 'Regra importante que nunca pode ser esquecida' },
]

function formatValue(value: unknown, other: unknown): string {
  if (value === undefined || value === null || value === '') return 'Não informado'
  if (Array.isArray(value)) {
    const parts = value.map((v) => (v === 'Outro' && other ? `Outro: ${other}` : String(v)))
    return parts.length ? parts.join(', ') : 'Não informado'
  }
  if (value === 'Outro' && other) return `Outro: ${other}`
  return String(value)
}

function montarRespostasLegiveis(respostas: Record<string, unknown>): string {
  const blocos = new Map<string, string[]>()

  for (const p of PERGUNTAS) {
    const linhas = blocos.get(p.bloco) ?? []
    const valor = formatValue(respostas[p.id], respostas[`${p.id}_outro`])
    linhas.push(`- ${p.label}: ${valor}`)
    blocos.set(p.bloco, linhas)
  }

  const secoes: string[] = []
  for (const [bloco, linhas] of blocos) {
    secoes.push(`## ${bloco}\n${linhas.join('\n')}`)
  }
  return secoes.join('\n\n')
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return fenced ? fenced[1] : trimmed
}

interface FunilIA {
  nome_funil: string
  tipo_funil: string
  justificativa: string
  etapas: unknown[]
}

async function chamarAnthropic(userMessage: string, retryHint = false): Promise<FunilIA[]> {
  const messages = retryHint
    ? [
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          content: 'Entendido, vou responder novamente.',
        },
        {
          role: 'user',
          content: 'Responda apenas com JSON válido, sem texto adicional, sem markdown, seguindo exatamente o schema pedido.',
        },
      ]
    : [{ role: 'user', content: userMessage }]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Anthropic API error (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const textBlock = data.content?.find((c: { type: string }) => c.type === 'text')
  const rawText: string = textBlock?.text ?? ''
  const jsonText = stripCodeFences(rawText)

  const parsed = JSON.parse(jsonText)
  if (!parsed || !Array.isArray(parsed.funis)) {
    throw new Error('JSON retornado não contém "funis" como array.')
  }
  return parsed.funis
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const { mapeamento_id } = await req.json()
    if (!mapeamento_id) {
      return new Response(JSON.stringify({ error: 'mapeamento_id é obrigatório' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization') ?? ''

    const supabaseAsUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
    } = await supabaseAsUser.auth.getUser(authHeader.replace('Bearer ', ''))

    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      })
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: mapeamento, error: fetchError } = await admin
      .from('mapeamentos')
      .select('*')
      .eq('id', mapeamento_id)
      .single()

    if (fetchError || !mapeamento) {
      return new Response(JSON.stringify({ error: 'Mapeamento não encontrado' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      })
    }

    if (mapeamento.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), {
        status: 403,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      })
    }

    await admin.from('mapeamentos').update({ status: 'processando_ia' }).eq('id', mapeamento_id)

    const respostasLegiveis = montarRespostasLegiveis(mapeamento.respostas ?? {})
    const userMessage = `Aqui estão as respostas do formulário de mapeamento de processo comercial:\n\n${respostasLegiveis}`

    let funis: FunilIA[]
    try {
      funis = await chamarAnthropic(userMessage)
    } catch (firstError) {
      try {
        funis = await chamarAnthropic(userMessage, true)
      } catch (secondError) {
        const detalhe = `${(firstError as Error).message} | retry: ${(secondError as Error).message}`
        await admin
          .from('mapeamentos')
          .update({ status: 'erro', erro_detalhe: detalhe })
          .eq('id', mapeamento_id)
        return new Response(JSON.stringify({ error: 'Falha ao gerar funil com IA', detalhe }), {
          status: 502,
          headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
        })
      }
    }

    await admin.from('funis_gerados').delete().eq('mapeamento_id', mapeamento_id)

    const rows = funis.map((f, index) => ({
      user_id: user.id,
      mapeamento_id,
      nome_funil: f.nome_funil,
      tipo_funil: f.tipo_funil,
      justificativa: f.justificativa,
      etapas: f.etapas,
      ordem: index,
    }))

    const { error: insertError } = await admin.from('funis_gerados').insert(rows)

    if (insertError) {
      await admin
        .from('mapeamentos')
        .update({ status: 'erro', erro_detalhe: insertError.message })
        .eq('id', mapeamento_id)
      return new Response(JSON.stringify({ error: 'Falha ao salvar funis gerados' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      })
    }

    await admin
      .from('mapeamentos')
      .update({ status: 'concluido', erro_detalhe: null })
      .eq('id', mapeamento_id)

    return new Response(JSON.stringify({ ok: true, total_funis: rows.length }), {
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
    })
  }
})
