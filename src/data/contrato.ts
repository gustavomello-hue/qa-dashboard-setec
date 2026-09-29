// Formato do dashboard.json, versão 1.
//
// Quem gera é o exportar_dashboard.py (repo qa-monitor-setec). As métricas
// vêm das mesmas funções que montam a planilha painel_qa.xlsx; este site só
// filtra, soma e desenha. Datas chegam como timestamp unix em segundos.

export const VERSAO_CONTRATO = 1;

export type Papel =
  | "backlog"
  | "a_iniciar"
  | "andamento"
  | "interrompida"
  | "correcao"
  | "qa"
  | "concluida"
  | "outra";

export type Prefixo = "DEV" | "WEB" | "MOB" | "Demandas" | "Outros";

export type TipoEvento =
  | "entrou_qa"
  | "qa_para_correcao"
  | "qa_para_concluida"
  | "qa_para_outra"
  | "entrou_correcao"
  | "concluida"
  | "criada"
  | "movimentacao"
  | "movimentacao_perdida"
  | "sumiu"
  | "fechada"
  | "mudou_projeto"
  | "bootstrap";

export interface Projeto {
  id: number;
  nome: string;
  prefixo: Prefixo;
  ativo: boolean;
}

export interface CardNaFila {
  task_id: number;
  titulo: string;
  projeto: string;
  project_id: number;
  coluna: string;
  designado: string;
  criador: string;
  prioridade: number;
  entrou_em: number | null;
  /** Dias corridos, como na planilha. */
  dias_em_qa: number | null;
  retornos: number;
  link: string;
}

export interface Distribuicao {
  projeto: string;
  project_id: number;
  coluna: string;
  papel: Papel;
  cards: number;
  dias_mais_antigo: number | null;
}

export interface ResumoMensal {
  ano_mes: string;
  ano: number;
  mes: number;
  projeto: string;
  /** null na versão geral (todos os projetos). */
  project_id: number | null;
  entradas: number;
  cards_distintos: number;
  reprovados: number;
  aprovados: number;
  outras_saidas: number;
  saldo_qa: number;
  taxa_aprovacao: number | null;
  tempo_medio_qa_h: number | null;
  completude: string;
  /** Soma e contagem para refazer a média ao somar projetos. */
  horas_qa_soma: number;
  pares_qa: number;
}

export interface CardMetricas {
  task_id: number;
  titulo: string;
  projeto: string;
  project_id: number | null;
  criador: string;
  designado: string;
  situacao: string;
  primeira_qa: number | null;
  ultima_qa: number | null;
  entradas_qa: number;
  retornos: number;
  concluido_em: number | null;
  concluido_por: string;
  horas_qa: number | null;
  link: string;
}

export interface LevantamentoAnual {
  ano_mes: string;
  ano: number;
  mes: number;
  criados: number;
  concluidos: number;
  lead_medio_dias: number | null;
  lead_mediano_dias: number | null;
  proxy_passaram_qa: number;
  qa_medido: number;
  qa_amostra: number;
  cobertura: string;
}

export interface LevantamentoProjeto {
  ano_mes: string;
  projeto: string;
  project_id: number;
  criados: number;
  concluidos: number;
  lead_medio_dias: number | null;
}

export interface PorResponsavel {
  ano_mes: string;
  responsavel: string;
  user_id: number;
  concluidos: number;
  criados: number;
  em_qa_agora: number;
  observacao: string;
}

export interface Lacuna {
  inicio: number;
  fim: number;
  horas: number;
  /** Horas de expediente (dia útil, horário de trabalho) sem coleta. */
  horas_expediente: number;
  movimentacoes_perdidas: number;
}

export interface Evento {
  momento: number;
  dia: string;
  ano_mes: string;
  evento: TipoEvento;
  task_id: number;
  titulo: string | null;
  project_id: number;
  de_coluna: string | null;
  de_papel: Papel | null;
  para_coluna: string | null;
  para_papel: Papel | null;
  owner_nome: string | null;
  creator_nome: string | null;
  movido_por: string | null;
  origem: "diff" | "atividade" | "bootstrap" | "excel" | "getTask";
  link: string | null;
}

export interface Dashboard {
  versao: typeof VERSAO_CONTRATO;
  gerado_em: number;
  gerado_em_texto: string;
  coleta: {
    run_id: string | null;
    momento: number | null;
    momento_texto: string | null;
    tarefas: number;
    eventos_ledger: number;
  };
  regras: {
    lacuna_horas: number;
    /** [hora de início, hora de fim] do expediente. */
    expediente: [number, number];
    /** Antes deste mês as contagens de QA são amostra incompleta. */
    qa_confiavel_desde: string;
  };
  projetos: Projeto[];
  fila_qa: CardNaFila[];
  distribuicao: Distribuicao[];
  resumo_mensal: ResumoMensal[];
  resumo_mensal_geral: ResumoMensal[];
  cards: CardMetricas[];
  levantamento_anual: LevantamentoAnual[];
  levantamento_projeto: LevantamentoProjeto[];
  por_responsavel: PorResponsavel[];
  /** Momentos das coletas bem-sucedidas. */
  execucoes: number[];
  lacunas: Lacuna[];
  eventos: Evento[];
}
