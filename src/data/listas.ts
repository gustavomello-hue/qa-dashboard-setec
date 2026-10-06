// Listas de cards por trás dos números (tela "Lista de cards", #/cards).
//
// Regra da casa: a lista é calculada da MESMA fonte que gerou o número
// clicado (eventos do dia na Agora, atribuições na Equipe/Pessoa, fila e
// carga para o que é "agora"), e a soma das marcas N× é igual ao número.
// listas.test.ts confere isso para cada origem.

import type { Atribuicao, Dashboard, Metrica } from "./contrato";
import type { Tom } from "../componentes/Kpi";
import type { Rota } from "./rota";
import { dentro, escreverPeriodo, intervalo, lerPeriodo, periodoPadrao, rotuloPeriodo, type Intervalo, type Periodo } from "./periodo";
import { diaCurto, numero } from "./formato";
import { passaNoFiltro, semReprovacao, type Filtro } from "./seletores";
import { PAPEIS_CARGA, atribuicoesDe, indicePessoas, nomeDe } from "./pessoas";

/** Números da tela Agora: contam eventos (e a fila) da equipe toda. */
export const METRICAS_EVENTO = ["em_qa", "entrou_qa", "qa_para_concluida", "qa_para_correcao", "concluida"] as const;
/** Números da Equipe e da Pessoa: contam atribuições. */
export const METRICAS_PESSOA = [
  "entregue_qa", "aprovado", "reprovado", "cards_reprovados", "devolvido", "concluidos", "concluido_sem_qa", "criado",
  "testados", "testou_aprovado", "testou_reprovado", "cards_reprovou", "testou_devolvido", "saida_qa_nao_qa", "abertos",
] as const;
export type MetricaLista = (typeof METRICAS_EVENTO)[number] | (typeof METRICAS_PESSOA)[number];
export const METRICAS_LISTA: readonly MetricaLista[] = [...METRICAS_EVENTO, ...METRICAS_PESSOA];

export const ROTULO_LISTA: Record<MetricaLista, string> = {
  em_qa: "Em QA agora",
  entrou_qa: "Entraram em QA",
  qa_para_concluida: "Aprovados",
  qa_para_correcao: "Reprovados",
  concluida: "Concluídos sem QA",
  entregue_qa: "Entregues para QA",
  aprovado: "Aprovados",
  reprovado: "Reprovações",
  cards_reprovados: "Cards reprovados (base da %)",
  devolvido: "Devolvidos",
  concluidos: "Concluídos",
  concluido_sem_qa: "Concluídos sem QA",
  criado: "Criados",
  testados: "Testados",
  testou_aprovado: "Aprovou",
  testou_reprovado: "Reprovou",
  cards_reprovou: "Cards que reprovou (base da %)",
  testou_devolvido: "Devolveu",
  saida_qa_nao_qa: "Saídas de QA",
  abertos: "Abertos agora",
};

/** O que é "agora": não depende de período. */
export const SEM_PERIODO: readonly MetricaLista[] = ["em_qa", "abertos"];

/** Atribuições que cada métrica de pessoa soma. */
const FONTE: Partial<Record<MetricaLista, Metrica[]>> = {
  entregue_qa: ["entregue_qa"],
  aprovado: ["aprovado"],
  reprovado: ["reprovado"],
  cards_reprovados: ["reprovado"],
  devolvido: ["devolvido"],
  concluidos: ["aprovado", "concluido_sem_qa"],
  concluido_sem_qa: ["concluido_sem_qa"],
  criado: ["criado"],
  // Igual a testados() de pessoas.ts: devolvido NÃO entra.
  testados: ["testou_aprovado", "testou_reprovado"],
  testou_aprovado: ["testou_aprovado"],
  testou_reprovado: ["testou_reprovado"],
  cards_reprovou: ["testou_reprovado"],
  testou_devolvido: ["testou_devolvido"],
  saida_qa_nao_qa: ["saida_qa_nao_qa"],
};

const ETIQUETA: Partial<Record<Metrica, { texto: string; tom: Tom }>> = {
  aprovado: { texto: "Aprovado", tom: "aprovado" },
  concluido_sem_qa: { texto: "Sem QA", tom: "sem-qa" },
  testou_aprovado: { texto: "Aprovou", tom: "aprovado" },
  testou_reprovado: { texto: "Reprovou", tom: "reprovado" },
};

export type PeriodoLista = Periodo | { tipo: "dia"; dia: string };

export interface Consulta {
  metrica: MetricaLista;
  periodo: PeriodoLista;
  pessoa?: number;
  filtro: Filtro;
}

export interface LinhaLista {
  task_id: number;
  project_id: number;
  /** Quantas vezes o card conta no número clicado. */
  vezes: number;
  /** Momento do último fato contado (unix s). */
  quando: number | null;
  /** Quem recebe o crédito, pelo nome curto da equipe. */
  pessoa: string;
  /** Coluna atual do card, quando se sabe. */
  coluna: string | null;
  /** Desfecho, nas métricas que juntam mais de um (Concluídos, Testados). */
  etiqueta?: { texto: string; tom: Tom };
}

export interface ResultadoLista {
  linhas: LinhaLista[];
  /** Soma das marcas N×: é o número que foi clicado. */
  total: number;
  /** Só nas bases de taxa: cards julgados (DEV) ou testados (QA). */
  base?: number;
}

export function familiaDe(m: MetricaLista): readonly MetricaLista[] {
  return (METRICAS_EVENTO as readonly MetricaLista[]).includes(m) ? METRICAS_EVENTO : METRICAS_PESSOA;
}

export function intervaloLista(p: PeriodoLista, agora: Date): Intervalo {
  return p.tipo === "dia" ? { de: p.dia, ate: p.dia } : intervalo(p, agora);
}

/** "AAAA-MM-DD" (dia real), "AAAA-MM" ou "7d". */
export function lerPeriodoLista(texto: string | null): PeriodoLista | undefined {
  if (texto && /^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [a, m, d] = texto.split("-").map(Number);
    const data = new Date(a, m - 1, d);
    if (data.getFullYear() === a && data.getMonth() === m - 1 && data.getDate() === d) return { tipo: "dia", dia: texto };
    return undefined;
  }
  // "2026-13" passa no formato de lerPeriodo; aqui o mês tem de existir.
  if (texto && /^\d{4}-\d{2}$/.test(texto) && !(+texto.slice(5) >= 1 && +texto.slice(5) <= 12)) return undefined;
  return lerPeriodo(texto);
}

export function escreverPeriodoLista(p: PeriodoLista): string {
  return p.tipo === "dia" ? p.dia : escreverPeriodo(p);
}

export function rotuloPeriodoLista(p: PeriodoLista): string {
  return p.tipo === "dia" ? diaCurto(p.dia) : rotuloPeriodo(p);
}

/** Coluna atual de um card: detalhes, fila ou carga, nesta ordem. */
function colunaAtual(d: Dashboard): (task: number) => string | null {
  const fila = new Map(d.fila_qa.map((f) => [f.task_id, f.coluna]));
  const carga = new Map((d.carga ?? []).map((c) => [c.task_id, c.coluna]));
  return (task) => d.detalhes_cards?.[String(task)]?.coluna ?? fila.get(task) ?? carga.get(task) ?? null;
}

function baseDaTaxa(atribs: Atribuicao[], m: MetricaLista, semRep: Set<number>): number {
  const conta: Metrica[] = m === "cards_reprovados" ? ["aprovado", "reprovado"] : ["testou_aprovado", "testou_reprovado"];
  return new Set(
    atribs.filter((a) => a.user_id !== null && conta.includes(a.metrica) && !semRep.has(a.project_id)).map((a) => a.task_id),
  ).size;
}

export function listarCards(d: Dashboard, c: Consulta, agora: Date): ResultadoLista {
  const passa = passaNoFiltro(d, c.filtro);
  const pessoas = indicePessoas(d);
  const curto = new Map([...pessoas.values()].map((p) => [p.nome_kanboard, p.nome]));
  const nomeKb = (n: string | null | undefined) => (n ? curto.get(n) ?? n : "");
  const coluna = colunaAtual(d);
  const fim = (linhas: LinhaLista[], base?: number): ResultadoLista => ({
    linhas: linhas.sort((a, b) => (b.quando ?? 0) - (a.quando ?? 0) || b.task_id - a.task_id),
    total: linhas.reduce((s, l) => s + l.vezes, 0),
    ...(base !== undefined ? { base } : {}),
  });

  if (c.metrica === "em_qa") {
    return fim(
      d.fila_qa
        .filter((f) => passa(f.project_id))
        .map((f) => ({ task_id: f.task_id, project_id: f.project_id, vezes: 1, quando: f.entrou_em, pessoa: nomeKb(f.designado), coluna: f.coluna })),
    );
  }
  if (c.metrica === "abertos") {
    return fim(
      (d.carga ?? [])
        .filter((x) => (c.pessoa === undefined || x.user_id === c.pessoa) && passa(x.project_id) && PAPEIS_CARGA.includes(x.papel))
        .map((x) => ({ task_id: x.task_id, project_id: x.project_id, vezes: 1, quando: x.desde, pessoa: nomeDe(pessoas, x.user_id), coluna: x.coluna })),
    );
  }

  const i = intervaloLista(c.periodo, agora);
  const grupos = new Map<number, LinhaLista>();
  const somar = (task_id: number, project_id: number, momento: number, pessoa: string, etiqueta?: LinhaLista["etiqueta"]) => {
    const l = grupos.get(task_id) ?? { task_id, project_id, vezes: 0, quando: null, pessoa, coluna: coluna(task_id) };
    l.vezes++;
    if (l.quando === null || momento >= l.quando) {
      l.quando = momento;
      l.pessoa = pessoa;
      if (etiqueta) l.etiqueta = etiqueta;
    }
    grupos.set(task_id, l);
  };

  if ((METRICAS_EVENTO as readonly string[]).includes(c.metrica)) {
    // Mesmo critério de contarDia (seletores.ts): tipo do evento, dia e filtro.
    for (const e of d.eventos) {
      if (e.evento !== c.metrica || !dentro(e.dia, i) || !passa(e.project_id)) continue;
      somar(e.task_id, e.project_id, e.momento, nomeKb(e.owner_nome));
    }
    return fim([...grupos.values()]);
  }

  const fonte = FONTE[c.metrica] ?? [];
  const taxa = c.metrica === "cards_reprovados" || c.metrica === "cards_reprovou";
  const semRep = semReprovacao(d);
  const atribs = atribuicoesDe(d, i, c.filtro).filter((a) => c.pessoa === undefined || a.user_id === c.pessoa);
  for (const a of atribs) {
    if (a.user_id === null || !fonte.includes(a.metrica)) continue;
    // Taxa: mesma exclusão de resumirPorPessoa (quadros sem Correções, etapa 4 D2).
    if (taxa && semRep.has(a.project_id)) continue;
    somar(a.task_id, a.project_id, a.momento, nomeDe(pessoas, a.user_id), fonte.length > 1 ? ETIQUETA[a.metrica] : undefined);
  }
  return fim([...grupos.values()], taxa ? baseDaTaxa(atribs, c.metrica, semRep) : undefined);
}

export function cabecalhoLista(r: ResultadoLista, m: MetricaLista): string {
  const n = r.linhas.length;
  if (r.base !== undefined) return `${numero(n)} de ${numero(r.base)} cards ${m === "cards_reprovados" ? "julgados" : "testados"}`;
  const cards = `${numero(n)} card${n === 1 ? "" : "s"}`;
  return r.total === n ? cards : `${numero(r.total)} eventos em ${cards}`;
}

export function textoCopiar(linhas: LinhaLista[]): string {
  return linhas.map((l) => `#${l.task_id}`).join(", ");
}

/** Consulta da URL; null quando a URL não diz que lista é (a tela orienta). */
export function consultaDaRota(r: Rota, agora: Date): Consulta | null {
  // Período na URL que não se lê: orientar, nunca trocar por outra lista (mês padrão) sem avisar.
  if (!r.metrica || r.periodoInvalido) return null;
  const periodo: PeriodoLista = r.dia ? { tipo: "dia", dia: r.dia } : r.periodo ?? periodoPadrao(agora);
  return { metrica: r.metrica, periodo, filtro: r.filtro, ...(r.pessoa !== undefined ? { pessoa: r.pessoa } : {}) };
}

export function rotaDaConsulta(c: Consulta): Rota {
  return {
    tela: "cards",
    filtro: c.filtro,
    metrica: c.metrica,
    ...(c.pessoa !== undefined ? { pessoa: c.pessoa } : {}),
    ...(c.periodo.tipo === "dia" ? { dia: c.periodo.dia } : { periodo: c.periodo }),
  };
}
