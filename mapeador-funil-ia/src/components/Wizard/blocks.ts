export type QuestionType =
  | 'texto_curto'
  | 'texto_longo'
  | 'numero'
  | 'escolha_unica'
  | 'escolha_multipla'

export interface Question {
  id: string
  label: string
  type: QuestionType
  helper?: string
  prefix?: string
  options?: string[]
  allowOther?: boolean
}

export interface Block {
  title: string
  questions: Question[]
}

export const BLOCKS: Block[] = [
  {
    title: 'Sobre o negócio',
    questions: [
      {
        id: 'q0_nome_negocio',
        label: 'Qual o nome do negócio?',
        type: 'texto_curto',
      },
      {
        id: 'q0_descricao_produto',
        label: 'O que vocês vendem, em poucas palavras?',
        type: 'texto_longo',
        helper: 'Produto, serviço, especialidade.',
      },
      {
        id: 'q0_ticket_medio',
        label: 'Qual o valor médio de cada venda/atendimento?',
        type: 'numero',
        prefix: 'R$',
      },
      {
        id: 'q0_modelo_atendimento',
        label: 'O atendimento comercial é feito por...',
        type: 'escolha_unica',
        options: ['Pessoas (time humano)', 'Robô/automação', 'Misto (pessoas + automação)'],
      },
    ],
  },
  {
    title: 'Como o lead chega até vocês',
    questions: [
      {
        id: 'q1_canais_entrada',
        label: 'Por onde os leads chegam até vocês?',
        type: 'escolha_multipla',
        options: [
          'WhatsApp',
          'Site',
          'Instagram/Redes sociais',
          'Indicação',
          'Anúncio pago',
          'Ligação telefônica',
          'Presencial',
        ],
        allowOther: true,
      },
      {
        id: 'q1_tempo_primeiro_contato',
        label: 'Hoje, em quanto tempo vocês costumam dar a primeira resposta a um lead novo?',
        type: 'escolha_unica',
        options: ['Até 5 minutos', 'Até 30 minutos', 'Até 24 horas', 'Mais de 1 dia', 'Não temos um padrão'],
      },
      {
        id: 'q1_triagem_inicial',
        label: 'Assim que o lead chega, existe alguma pergunta ou triagem imediata? Qual?',
        type: 'texto_longo',
      },
    ],
  },
  {
    title: 'Qualificação',
    questions: [
      {
        id: 'q2_criterio_qualificado',
        label: "O que precisa ser verdade sobre uma pessoa para vocês considerarem que ela 'tem perfil' para comprar/ser atendida?",
        type: 'texto_longo',
      },
      {
        id: 'q2_perguntas_qualificacao',
        label: 'Quais perguntas vocês costumam fazer para entender se essa pessoa é um bom cliente em potencial?',
        type: 'texto_longo',
      },
      {
        id: 'q2_desqualifica_na_hora',
        label: 'Existe algo que já elimina o lead na hora?',
        type: 'texto_longo',
        helper: 'Ex: fora da região, não tem o problema que vocês resolvem, sem orçamento mínimo.',
      },
    ],
  },
  {
    title: 'Agendamento / Proposta',
    questions: [
      {
        id: 'q3_proximo_passo',
        label: 'Depois que o lead é qualificado, qual é o próximo passo?',
        type: 'texto_curto',
        helper: 'Ex: marcar reunião, agendar consulta, enviar orçamento.',
      },
      {
        id: 'q3_dados_coletados',
        label: 'Quais informações vocês PRECISAM ter dessa pessoa antes de avançar?',
        type: 'texto_longo',
        helper: 'Ex: nome completo, CPF, data de nascimento, documento específico.',
      },
      {
        id: 'q3_prazo_padrao',
        label: 'Existe um prazo padrão para isso acontecer?',
        type: 'texto_curto',
        helper: 'Ex: agendar em até 24h.',
      },
    ],
  },
  {
    title: 'Apresentação, negociação e fechamento',
    questions: [
      {
        id: 'q4_como_apresenta_preco',
        label: 'Como e quando o preço/orçamento é apresentado ao cliente?',
        type: 'texto_longo',
      },
      {
        id: 'q4_objecoes_comuns',
        label: 'Quais são as objeções/dúvidas mais comuns nessa fase, e como vocês costumam responder?',
        type: 'texto_longo',
      },
      {
        id: 'q4_o_que_define_venda_ganha',
        label: "O que precisa acontecer para a venda ser considerada 'fechada'?",
        type: 'texto_longo',
        helper: 'Ex: assinatura de contrato, pagamento de entrada, confirmação verbal.',
      },
    ],
  },
  {
    title: 'Pós-venda / retenção',
    questions: [
      {
        id: 'q5_acompanhamento_pos_venda',
        label: 'O que acontece depois que a venda é fechada? Existe algum acompanhamento?',
        type: 'texto_longo',
      },
      {
        id: 'q5_pede_feedback',
        label: 'Vocês pedem avaliação/feedback do cliente? Como e quando?',
        type: 'texto_longo',
      },
      {
        id: 'q5_gatilho_reativacao',
        label: 'Existe algum motivo para vocês entrarem em contato de novo com um cliente antigo?',
        type: 'texto_longo',
        helper: 'Ex: renovação, check-up, nova compra. Depois de quanto tempo?',
      },
    ],
  },
  {
    title: 'Perda e desqualificação',
    questions: [
      {
        id: 'q6_motivos_perda',
        label: 'Quais são os principais motivos pelos quais um lead NÃO vira cliente?',
        type: 'texto_longo',
        helper: 'Liste os que mais acontecem.',
      },
      {
        id: 'q6_lead_sumiu',
        label: 'O que vocês fazem quando um lead para de responder?',
        type: 'texto_longo',
      },
    ],
  },
  {
    title: 'Pessoas e responsabilidades',
    questions: [
      {
        id: 'q7_responsaveis_por_etapa',
        label: 'Quem cuida de cada parte do processo?',
        type: 'texto_longo',
        helper: 'Ex: recepção cuida do agendamento, vendedor cuida da negociação, gestor aprova descontos.',
      },
      {
        id: 'q7_tamanho_equipe',
        label: 'Quantas pessoas trabalham hoje no processo comercial?',
        type: 'numero',
      },
    ],
  },
  {
    title: 'Ferramentas e automação atual',
    questions: [
      {
        id: 'q8_ferramentas_atuais',
        label: 'Quais ferramentas vocês já usam?',
        type: 'escolha_multipla',
        options: ['CRM', 'Planilha', 'WhatsApp Business', 'Agenda/sistema de agendamento', 'Nenhuma'],
        allowOther: true,
      },
      {
        id: 'q8_automacoes_existentes',
        label: 'Já existe algo automático hoje?',
        type: 'texto_longo',
        helper: 'Ex: lembrete automático, mensagem de boas-vindas, cobrança automática.',
      },
    ],
  },
  {
    title: 'Particularidades do negócio',
    questions: [
      {
        id: 'q9_diferenca_tipo_cliente',
        label: 'Existe algum tipo de cliente que segue um caminho diferente?',
        type: 'texto_longo',
        helper: 'Ex: particular x convênio, à vista x parcelado, pessoa física x empresa.',
      },
      {
        id: 'q9_documentos_ou_aprovacoes',
        label: 'Existe algum documento, exame ou aprovação necessária antes de fechar a venda?',
        type: 'texto_longo',
      },
      {
        id: 'q9_regra_importante',
        label: 'Existe alguma regra importante do seu negócio que nunca pode ser esquecida no atendimento?',
        type: 'texto_longo',
        helper: 'Ex: sigilo, prazo legal, protocolo específico.',
      },
    ],
  },
]

export const OTHER_SUFFIX = '_outro'
