// Métricas por pessoa. A regra de QUEM recebe crédito mora no Python
// (metricas_pessoa.py): cada atribuição já diz "esta pessoa, esta métrica,
// este card". Aqui só se conta dentro do período e dos projetos filtrados.

import type { Atribuicao, CargaCard, Dashboard, Evento, Grupo, Metrica, Papel, Pessoa } from "./contrato";
import { dentro, type Intervalo } from "./periodo";
import { diaLocal, passaNoFiltro, type Filtro } from "./seletores";

/** Grupos com tabela própria, na ordem da tela Equipe. */
export const GRUPOS_TABELA: Grupo[] = ["dev", "qa", "estagiario_dev", "estagiario_qa"];
/** Grupos fora das tabelas por pessoa (contam só nos totais). */
export const GRUPOS_FORA: Grupo[] = ["gestao", "outros"];

export const ROTULO_GRUPO: Record<Grupo, string> = {
  dev: "DEV",
  qa: "QA",
  estagiario_dev: "Estagiários DEV",
  estagiario_qa: "Estagiários QA",
  gestao: "Gestão",
  outros: "Outros",
};

/** Colunas que aparecem na carga, na ordem do fluxo. */
export const PAPEIS_CARGA: Papel[] = ["a_iniciar", "andamento", "qa", "correcao"];

export function ehQa(p: Pessoa): boolean {
  return p.grupos.includes("qa") || p.grupos.includes("estagiario_qa");
}

/** Grupo que "manda" na composição: estagiário vence o papel. */
export function grupoPrincipal(p: Pessoa | undefined): Grupo {
  if (!p) return "outros";
  for (const g of ["estagiario_dev", "estagiario_qa", "dev", "qa", "gestao"] as Grupo[]) {
    if (p.grupos.includes(g)) return g;
  }
  return "outros";
}

export function indicePessoas(d: Dashboard): Map<number, Pessoa> {
  return new Map((d.equipe?.pessoas ?? []).map((p) => [p.user_id, p]));
}

export function nomeDe(pessoas: Map<number, Pessoa>, uid: number | null): string {
  if (uid === null) return "Não identificado";
  if (uid === 0) return "Sem responsável";
  return pessoas.get(uid)?.nome ?? `Usuário ${uid}`;
}

// --------------------------------------------------------------------------
// Contagem
// --------------------------------------------------------------------------

export interface Resumo {
  entregues: number;
  aprovados: number;
  /** Eventos de reprovação (um card reprovado 3 vezes conta 3). */
  reprovacoes: number;
  /** Cards distintos reprovados ao menos uma vez. */
  cardsReprovados: number;
  /** Cards distintos julgados (aprovados ou reprovados) no período. */
  cardsJulgados: number;
  devolvidos: number;
  concluidosSemQa: number;
  criados: number;
  testouAprovado: number;
  testouReprovado: number;
  testouDevolvido: number;
  cardsTestados: number;
  cardsTestadosReprovados: number;
  saidasNaoQa: number;
}

export function resumoVazio(): Resumo {
  return {
    entregues: 0, aprovados: 0, reprovacoes: 0, cardsReprovados: 0, cardsJulgados: 0,
    devolvidos: 0, concluidosSemQa: 0, criados: 0, testouAprovado: 0, testouReprovado: 0,
    testouDevolvido: 0, cardsTestados: 0, cardsTestadosReprovados: 0, saidasNaoQa: 0,
  };
}

/** Concluídos = aprovados em QA + concluídos sem QA. */
export const concluidos = (r: Resumo) => r.aprovados + r.concluidosSemQa;
export const testados = (r: Resumo) => r.testouAprovado + r.testouReprovado;

/** % de cards julgados que foram reprovados ao menos uma vez (por card, não por evento). */
export function taxaReprovacao(r: Resumo): number | null {
  return r.cardsJulgados ? Math.round((1000 * r.cardsReprovados) / r.cardsJulgados) / 10 : null;
}

export function taxaReprovacaoQa(r: Resumo): number | null {
  return r.cardsTestados ? Math.round((1000 * r.cardsTestadosReprovados) / r.cardsTestados) / 10 : null;
}

const CAMPO: Partial<Record<Metrica, keyof Resumo>> = {
  entregue_qa: "entregues",
  aprovado: "aprovados",
  reprovado: "reprovacoes",
  devolvido: "devolvidos",
  concluido_sem_qa: "concluidosSemQa",
  criado: "criados",
  testou_aprovado: "testouAprovado",
  testou_reprovado: "testouReprovado",
  testou_devolvido: "testouDevolvido",
  saida_qa_nao_qa: "saidasNaoQa",
};

/** Filtra as atribuições por período e projeto. */
export function atribuicoesDe(d: Dashboard, periodo: Intervalo, filtro: Filtro): Atribuicao[] {
  const passa = passaNoFiltro(d, filtro);
  return (d.atribuicoes ?? []).filter((a) => dentro(a.dia, periodo) && passa(a.project_id));
}

/**
 * Resumo por user_id. A chave null junta as saídas de QA sem autor
 * (só `saidasSemAutor` do retorno).
 */
export function resumirPorPessoa(atribs: Atribuicao[]): { porPessoa: Map<number, Resumo>; saidasSemAutor: number } {
  const porPessoa = new Map<number, Resumo>();
  const julgados = new Map<number, Set<number>>();
  const reprovados = new Map<number, Set<number>>();
  const testados = new Map<number, Set<number>>();
  const testReprov = new Map<number, Set<number>>();
  const add = (m: Map<number, Set<number>>, uid: number, task: number) => {
    const s = m.get(uid) ?? new Set<number>();
    s.add(task);
    m.set(uid, s);
  };
  let saidasSemAutor = 0;

  for (const a of atribs) {
    if (a.user_id === null) {
      if (a.metrica === "saida_qa_sem_autor") saidasSemAutor++;
      continue;
    }
    const r = porPessoa.get(a.user_id) ?? resumoVazio();
    porPessoa.set(a.user_id, r);
    const campo = CAMPO[a.metrica];
    if (campo) r[campo]++;
    if (a.metrica === "aprovado" || a.metrica === "reprovado") add(julgados, a.user_id, a.task_id);
    if (a.metrica === "reprovado") add(reprovados, a.user_id, a.task_id);
    if (a.metrica === "testou_aprovado" || a.metrica === "testou_reprovado") add(testados, a.user_id, a.task_id);
    if (a.metrica === "testou_reprovado") add(testReprov, a.user_id, a.task_id);
  }
  for (const [uid, r] of porPessoa) {
    r.cardsJulgados = julgados.get(uid)?.size ?? 0;
    r.cardsReprovados = reprovados.get(uid)?.size ?? 0;
    r.cardsTestados = testados.get(uid)?.size ?? 0;
    r.cardsTestadosReprovados = testReprov.get(uid)?.size ?? 0;
  }
  return { porPessoa, saidasSemAutor };
}

// --------------------------------------------------------------------------
// Semanas (sparkline e gráfico da ficha)
// --------------------------------------------------------------------------

/** Segunda-feira da semana de `dia`. */
export function inicioDaSemana(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  const data = new Date(a, m - 1, d);
  data.setDate(data.getDate() - ((data.getDay() + 6) % 7));
  return diaLocal(data);
}

/** As `n` segundas-feiras que terminam na semana de `ate`, da mais velha à mais nova. */
export function semanas(ate: string, n: number): string[] {
  const ultima = inicioDaSemana(ate);
  const [a, m, d] = ultima.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => diaLocal(new Date(a, m - 1, d - 7 * (n - 1 - i))));
}

/** A semana que contém `fim` ainda não acabou (o domingo dela é depois de `fim`). */
export function semanaIncompleta(fim: string): boolean {
  const [a, m, d] = inicioDaSemana(fim).split("-").map(Number);
  return diaLocal(new Date(a, m - 1, d + 6)) > fim;
}

/** Contagem semanal de algumas métricas de uma pessoa (atribuições já filtradas por projeto). */
export function porSemana(
  atribs: Atribuicao[], uid: number, metricas: Metrica[], inicios: string[],
): number[] {
  const indice = new Map(inicios.map((s, i) => [s, i]));
  const contagem = inicios.map(() => 0);
  const alvo = new Set(metricas);
  for (const a of atribs) {
    if (a.user_id !== uid || !alvo.has(a.metrica)) continue;
    const i = indice.get(inicioDaSemana(a.dia));
    if (i !== undefined) contagem[i]++;
  }
  return contagem;
}

// --------------------------------------------------------------------------
// Carga (foto de agora)
// --------------------------------------------------------------------------

export type Carga = Record<Papel, number>;

export function cargaVazia(): Carga {
  return { backlog: 0, a_iniciar: 0, andamento: 0, interrompida: 0, correcao: 0, qa: 0, concluida: 0, outra: 0 };
}

export function cargaPorPessoa(d: Dashboard, filtro: Filtro): Map<number, Carga> {
  const passa = passaNoFiltro(d, filtro);
  const m = new Map<number, Carga>();
  for (const c of d.carga ?? []) {
    if (!passa(c.project_id)) continue;
    const carga = m.get(c.user_id) ?? cargaVazia();
    carga[c.papel]++;
    m.set(c.user_id, carga);
  }
  return m;
}

export function cardsAbertos(d: Dashboard, uid: number, filtro: Filtro): CargaCard[] {
  const passa = passaNoFiltro(d, filtro);
  const ordem = new Map(PAPEIS_CARGA.map((p, i) => [p, i]));
  return (d.carga ?? [])
    .filter((c) => c.user_id === uid && passa(c.project_id))
    .sort((a, b) => (ordem.get(a.papel) ?? 9) - (ordem.get(b.papel) ?? 9) || (a.desde ?? 0) - (b.desde ?? 0));
}

// --------------------------------------------------------------------------
// Pessoas por grupo
// --------------------------------------------------------------------------

export function pessoasDoGrupo(d: Dashboard, grupo: Grupo, incluirInativos: boolean): Pessoa[] {
  return (d.equipe?.pessoas ?? [])
    .filter((p) => p.grupos.includes(grupo) && (incluirInativos || p.ativo !== false))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Gestão + outros (quem não tem tabela), só os que aparecem no período. */
export function pessoasFora(d: Dashboard, comAtividade: Set<number>): Pessoa[] {
  return (d.equipe?.pessoas ?? [])
    .filter((p) => !p.grupos.some((g) => GRUPOS_TABELA.includes(g)) && comAtividade.has(p.user_id))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Pessoas ativas com tabela (sem estagiário duplicado): quem aparece na carga da tela Agora. */
export function pessoasDaCarga(d: Dashboard): Pessoa[] {
  return (d.equipe?.pessoas ?? [])
    .filter((p) => p.ativo !== false && p.grupos.some((g) => GRUPOS_TABELA.includes(g)))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

// --------------------------------------------------------------------------
// Ficha da pessoa
// --------------------------------------------------------------------------

export interface CardContado {
  task_id: number;
  project_id: number;
  vezes: number;
  ultimo: number;
  por: number | null;
}

/** Cards de uma métrica da pessoa no período, com quantas vezes cada um. */
export function cardsDaMetrica(atribs: Atribuicao[], uid: number, metrica: Metrica): CardContado[] {
  const m = new Map<number, CardContado>();
  for (const a of atribs) {
    if (a.user_id !== uid || a.metrica !== metrica) continue;
    const c = m.get(a.task_id) ?? { task_id: a.task_id, project_id: a.project_id, vezes: 0, ultimo: 0, por: a.por };
    c.vezes++;
    if (a.momento > c.ultimo) {
      c.ultimo = a.momento;
      c.por = a.por;
    }
    m.set(a.task_id, c);
  }
  return [...m.values()].sort((a, b) => b.vezes - a.vezes || b.ultimo - a.ultimo);
}

/** Projetos em que um QA mais testou no período. */
export function projetosTestados(atribs: Atribuicao[], uid: number): { project_id: number; testes: number }[] {
  const m = new Map<number, number>();
  for (const a of atribs) {
    if (a.user_id === uid && (a.metrica === "testou_aprovado" || a.metrica === "testou_reprovado")) {
      m.set(a.project_id, (m.get(a.project_id) ?? 0) + 1);
    }
  }
  return [...m.entries()].map(([project_id, testes]) => ({ project_id, testes })).sort((a, b) => b.testes - a.testes);
}

// --------------------------------------------------------------------------
// Mensal: composição por grupo e criados pela gestão
// --------------------------------------------------------------------------

export interface ComposicaoMes {
  ano_mes: string;
  /** Entregues para QA, pelo grupo principal do responsável. */
  entregues: Record<Grupo, number>;
  criadosGestao: number;
}

export function composicaoPorMes(d: Dashboard, filtro: Filtro): ComposicaoMes[] {
  const passa = passaNoFiltro(d, filtro);
  const pessoas = indicePessoas(d);
  const meses = new Map<string, ComposicaoMes>();
  const zero = (): Record<Grupo, number> => ({ dev: 0, qa: 0, estagiario_dev: 0, estagiario_qa: 0, gestao: 0, outros: 0 });
  for (const a of d.atribuicoes ?? []) {
    if (!passa(a.project_id)) continue;
    if (a.metrica !== "entregue_qa" && a.metrica !== "criado") continue;
    const m = meses.get(a.ano_mes) ?? { ano_mes: a.ano_mes, entregues: zero(), criadosGestao: 0 };
    meses.set(a.ano_mes, m);
    const p = a.user_id ? pessoas.get(a.user_id) : undefined;
    if (a.metrica === "entregue_qa") m.entregues[grupoPrincipal(p)]++;
    else if (p?.grupos.includes("gestao")) m.criadosGestao++;
  }
  return [...meses.values()].sort((a, b) => a.ano_mes.localeCompare(b.ano_mes));
}

// --------------------------------------------------------------------------
// Feed da tela Agora
// --------------------------------------------------------------------------

const EVENTOS_FEED = new Set<Evento["evento"]>([
  "entrou_qa", "qa_para_concluida", "qa_para_correcao", "qa_para_outra", "concluida", "criada",
]);

export function feedRecente(d: Dashboard, filtro: Filtro, limite = 30): Evento[] {
  const passa = passaNoFiltro(d, filtro);
  const saida: Evento[] = [];
  for (let i = d.eventos.length - 1; i >= 0 && saida.length < limite; i--) {
    const e = d.eventos[i];
    if (EVENTOS_FEED.has(e.evento) && e.origem !== "atividade" && passa(e.project_id)) saida.push(e);
  }
  return saida.sort((a, b) => b.momento - a.momento);
}

// --------------------------------------------------------------------------
// Mensal: % de cards reprovados, a mesma conta da Equipe e da Pessoa
// --------------------------------------------------------------------------

export interface TaxaMes {
  ano_mes: string;
  cardsJulgados: number;
  cardsReprovados: number;
  taxa: number | null;
}

/**
 * Por mês: dos cards julgados (aprovados ou reprovados), quantos foram
 * reprovados ao menos uma vez. Vem das atribuições do responsável, que têm
 * exatamente um fato por saída de QA, então somar a equipe não duplica card.
 */
export function taxaCardsPorMes(d: Dashboard, filtro: Filtro): Map<string, TaxaMes> {
  const passa = passaNoFiltro(d, filtro);
  const julgados = new Map<string, Set<number>>();
  const reprovados = new Map<string, Set<number>>();
  const add = (m: Map<string, Set<number>>, mes: string, task: number) => {
    const s = m.get(mes) ?? new Set<number>();
    s.add(task);
    m.set(mes, s);
  };
  for (const a of d.atribuicoes ?? []) {
    if (!passa(a.project_id)) continue;
    if (a.metrica === "aprovado" || a.metrica === "reprovado") add(julgados, a.ano_mes, a.task_id);
    if (a.metrica === "reprovado") add(reprovados, a.ano_mes, a.task_id);
  }
  const saida = new Map<string, TaxaMes>();
  for (const [mes, cards] of julgados) {
    const rep = reprovados.get(mes)?.size ?? 0;
    saida.set(mes, {
      ano_mes: mes,
      cardsJulgados: cards.size,
      cardsReprovados: rep,
      taxa: cards.size ? Math.round((1000 * rep) / cards.size) / 10 : null,
    });
  }
  return saida;
}
