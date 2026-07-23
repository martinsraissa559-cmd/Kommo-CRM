export type StatusMapeamento = 'em_preenchimento' | 'processando_ia' | 'concluido' | 'erro'

export type TipoFunil = 'qualificacao' | 'vendas' | 'comparecimento' | 'pos_venda' | 'outro'

export interface Etapa {
  nome: string
  objetivo: string
  gatilho_entrada: string
  gatilho_saida: string
  tarefas: string[]
  campos_obrigatorios: string[]
  campos_desejaveis: string[]
  sla: string
  regras_negocio: string[]
  regras_perda: string[]
  responsavel: string
  automacao: string[]
  script_sugerido: string | null
}

export interface Mapeamento {
  id: string
  user_id: string
  nome_negocio: string | null
  status: StatusMapeamento
  respostas: Record<string, unknown>
  erro_detalhe: string | null
  created_at: string
  updated_at: string
}

export interface FunilGerado {
  id: string
  user_id: string
  mapeamento_id: string
  nome_funil: string
  tipo_funil: TipoFunil
  justificativa: string | null
  etapas: Etapa[]
  ordem: number
  created_at: string
}

export interface CampoPadrao {
  id: string
  entidade: 'LEAD' | 'CONTATO'
  nome_campo: string
  tipo: 'lista_suspensa' | 'texto_curto' | 'texto_longo' | 'numero' | 'data' | 'checkbox' | 'telefone'
  opcoes: unknown
  created_at: string
}

