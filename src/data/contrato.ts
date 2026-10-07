// Formato do dashboard.json, versão 1 (com os blocos de pessoas, aditivos).
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
  /** false: quadro sem coluna de Correções; fica fora da taxa de reprovação (etapa 4). */
  mede_reprovacao?: boolean;
  /** Projeto promovido à frente de QA: só conta a partir desta data (AAAA-MM-DD). */
  qa_desde?: string | null;
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
  /**
   * Se o card aparece no painel "Teste de QA" do Kanboard (plugin
   * PainelKanboard), que tem a própria lista de projetos. null = painel não
   * consultado nesta coleta; ausente em JSONs anteriores a este campo.
   */
  no_painel?: boolean | null;
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
  /** Aprovados só dos quadros que medem reprovação: a base da taxa (etapa 4). */
  aprovados_medidos?: number;
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

export type Grupo = "qa" | "dev" | "estagiario_dev" | "estagiario_qa" | "gestao" | "outros";

export interface Pessoa {
  user_id: number;
  /** Nome curto do equipe.json (ou o do Kanboard, para quem não está lá). */
  nome: string;
  nome_kanboard: string;
  /** Uma pessoa pode estar em dois grupos (estagiário de QA: qa + estagiario_qa). */
  grupos: Grupo[];
  /** null = não está no equipe.json. */
  ativo: boolean | null;
  classificado: boolean;
}

export interface Equipe {
  grupos: Partial<Record<Grupo, string>>;
  pessoas: Pessoa[];
  /** Mês a partir do qual há atribuições. */
  desde: string;
}

/**
 * Métricas creditadas a uma pessoa. As do responsável usam o dono do card NO
 * MOMENTO do evento; as "testou_*" usam quem moveu o card para fora de QA.
 */
export type Metrica =
  | "entregue_qa"
  | "aprovado"
  | "reprovado"
  | "devolvido"
  | "concluido_sem_qa"
  | "criado"
  /** Mudou de coluna fora do fluxo de QA (Backlog, A iniciar, Em andamento, Interrompidas, outra). */
  | "movimentado"
  | "testou_aprovado"
  | "testou_reprovado"
  | "testou_devolvido"
  | "saida_qa_nao_qa"
  | "saida_qa_sem_autor";

/** Um fato: "esta pessoa recebe crédito por esta métrica neste card". */
export interface Atribuicao {
  momento: number;
  dia: string;
  ano_mes: string;
  metrica: Metrica;
  /** null só em saida_qa_sem_autor; 0 = card sem responsável. */
  user_id: number | null;
  /** Quem moveu o card (null se desconhecido). */
  por: number | null;
  task_id: number;
  project_id: number;
}

/** Card aberto, fora de Concluídas, com responsável: a carga de agora. */
export interface CargaCard {
  task_id: number;
  titulo: string | null;
  project_id: number;
  user_id: number;
  coluna: string;
  papel: Papel;
  desde: number | null;
  prioridade: number;
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

// --- Tela Projetos (etapa 4): fluxo de todos os projetos ------------------

export interface MesFluxo {
  ano_mes: string;
  entradas: number;
  /** null = saída não medida (quadro sem coluna concluída e que nunca fechou card). */
  saidas: number | null;
  ciclo_mediana: number | null;
  ciclo_p85: number | null;
  ciclo_n: number;
}

export interface CardParado {
  task_id: number;
  titulo: string;
  dias: number;
  coluna: string;
  responsavel: string;
  link: string;
}

export interface ProjetoFluxo {
  id: number;
  nome: string;
  grupo: "qa" | "geral";
  /** Quadro do projeto no Kanboard. */
  link: string;
  mede_saida: boolean;
  abertos_por_papel: Record<string, number>;
  colunas: { nome: string; papel: string; cards: number }[];
  mensal: MesFluxo[];
  ciclo_90d: { mediana: number | null; p85: number | null; n: number };
  parados_total: number;
  parados: CardParado[];
}

export interface ProjetosFluxo {
  parado_dias: number;
  janela_ciclo_dias: number;
  /** Última coleta de cards fechados (unix) ou null se nunca rodou. */
  fechadas_em: number | null;
  projetos: ProjetoFluxo[];
}

// --- Cards clicáveis: descrição e campos do Kanboard ------------------------

/** Detalhe de um card do universo da spec (D7). Opcionais só vêm preenchidos. */
export interface DetalheCard {
  titulo: string | null;
  link: string | null;
  /** Markdown do Kanboard, já cortado no teto de 8 KB. */
  descricao: string | null;
  descricao_cortada: boolean;
  /** Coluna atual (no Kanboard). */
  coluna: string;
  papel: Papel;
  /** 0 = sem responsável. */
  responsavel_id: number;
  prioridade: number;
  criado_em: number | null;
  /** false = fechado no Kanboard. */
  aberto: boolean;
  prazo?: number;
  inicio?: number;
  /** Horas. */
  tempo_estimado?: number;
  tempo_gasto?: number;
  categoria?: string;
  cor?: string;
  referencia?: string;
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
  /** Resultado da consulta ao painel do Kanboard nesta coleta. */
  painel_kanboard?: { consultado: boolean; cards: number | null };
  fila_qa: CardNaFila[];
  distribuicao: Distribuicao[];
  resumo_mensal: ResumoMensal[];
  resumo_mensal_geral: ResumoMensal[];
  cards: CardMetricas[];
  levantamento_anual: LevantamentoAnual[];
  levantamento_projeto: LevantamentoProjeto[];
  /** Ausentes em JSONs anteriores às métricas por pessoa. */
  equipe?: Equipe;
  atribuicoes?: Atribuicao[];
  carga?: CargaCard[];
  /** Momentos das coletas bem-sucedidas. */
  execucoes: number[];
  lacunas: Lacuna[];
  eventos: Evento[];
  /** Fluxo de todos os projetos (tela Projetos). Ausente em JSONs anteriores à etapa 4. */
  projetos_fluxo?: ProjetosFluxo;
  /** Descrição e campos por task_id. Ausente em JSONs anteriores ou publicados sem cifra. */
  detalhes_cards?: Record<string, DetalheCard>;
}
