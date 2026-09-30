// Cálculos do site sobre o dashboard.json. Funções puras, sem React, para
// poderem ser testadas sem navegador (seletores.test.ts).
//
// Regra da casa: métrica que já existe na planilha vem pronta do JSON. Aqui
// só entra o que depende do "agora" do navegador (o que é "hoje", há quanto
// tempo o dado foi coletado) ou de somar projetos por filtro.

import type { Dashboard, Evento, Lacuna, Prefixo, ResumoMensal } from "./contrato";

export interface Filtro {
  prefixo?: Prefixo;
  projeto?: number;
}

/** "AAAA-MM-DD" no fuso do navegador (o mesmo do PC que coleta). */
export function diaLocal(data: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}

export function mesLocal(data: Date): string {
  return diaLocal(data).slice(0, 7);
}

function ehDiaUtil(data: Date): boolean {
  const d = data.getDay();
  return d !== 0 && d !== 6;
}

/** Dia útil anterior a `data`: na segunda-feira, a sexta. Sem feriados. */
export function ultimoDiaUtil(data: Date): Date {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  do {
    d.setDate(d.getDate() - 1);
  } while (!ehDiaUtil(d));
  return d;
}

/** Predicado de projeto a partir do filtro. Sem filtro, tudo passa. */
export function passaNoFiltro(d: Dashboard, filtro: Filtro): (projectId: number | null) => boolean {
  if (filtro.projeto !== undefined) {
    return (pid) => pid === filtro.projeto;
  }
  if (filtro.prefixo) {
    const ids = new Set(d.projetos.filter((p) => p.prefixo === filtro.prefixo).map((p) => p.id));
    return (pid) => pid !== null && ids.has(pid);
  }
  return () => true;
}

export interface ContagemDia {
  entraram: number;
  aprovados: number;
  reprovados: number;
  /** Foram para Concluídas vindos de outra coluna, sem passar por Teste/QA (evento 'concluida'). */
  concluidosSemQa: number;
}

export function contarDia(eventos: Evento[], dia: string, passa: (pid: number) => boolean): ContagemDia {
  const c: ContagemDia = { entraram: 0, aprovados: 0, reprovados: 0, concluidosSemQa: 0 };
  for (const e of eventos) {
    if (e.dia !== dia || !passa(e.project_id)) continue;
    if (e.evento === "entrou_qa") c.entraram++;
    else if (e.evento === "qa_para_concluida") c.aprovados++;
    else if (e.evento === "qa_para_correcao") c.reprovados++;
    else if (e.evento === "concluida") c.concluidosSemQa++;
  }
  return c;
}

/**
 * Soma as linhas de resumo por mês, refazendo taxa e tempo médio a partir
 * dos numeradores (média de médias daria errado ao juntar projetos).
 * Sem filtro, usa a versão geral que já vem pronta da planilha.
 */
export function resumoPorMes(d: Dashboard, filtro: Filtro): ResumoMensal[] {
  const desde = d.regras.qa_confiavel_desde;
  if (filtro.prefixo === undefined && filtro.projeto === undefined) {
    return d.resumo_mensal_geral.filter((r) => r.ano_mes >= desde);
  }
  const passa = passaNoFiltro(d, filtro);
  const porMes = new Map<string, ResumoMensal>();
  for (const r of d.resumo_mensal) {
    if (r.ano_mes < desde || !passa(r.project_id)) continue;
    const acc = porMes.get(r.ano_mes) ?? {
      ...r,
      projeto: "(filtro)",
      project_id: null,
      entradas: 0, cards_distintos: 0, reprovados: 0, aprovados: 0,
      outras_saidas: 0, saldo_qa: 0, horas_qa_soma: 0, pares_qa: 0,
    };
    acc.entradas += r.entradas;
    // Soma de distintos por projeto: um card não muda de projeto no mês,
    // então não há dupla contagem na prática.
    acc.cards_distintos += r.cards_distintos;
    acc.reprovados += r.reprovados;
    acc.aprovados += r.aprovados;
    acc.outras_saidas += r.outras_saidas;
    acc.saldo_qa += r.saldo_qa;
    acc.horas_qa_soma += r.horas_qa_soma;
    acc.pares_qa += r.pares_qa;
    porMes.set(r.ano_mes, acc);
  }
  return [...porMes.values()]
    .sort((a, b) => a.ano_mes.localeCompare(b.ano_mes))
    .map((r) => {
      const julgados = r.aprovados + r.reprovados;
      return {
        ...r,
        taxa_aprovacao: julgados ? Math.round((1000 * r.aprovados) / julgados) / 10 : null,
        tempo_medio_qa_h: r.pares_qa ? Math.round((10 * r.horas_qa_soma) / r.pares_qa) / 10 : null,
      };
    });
}

export interface KpisHoje {
  emQaAgora: number;
  hoje: ContagemDia;
  comparacao: ContagemDia;
  diaComparacao: string;
  taxaAprovacaoMes: number | null;
}

export function kpisHoje(d: Dashboard, agora: Date, filtro: Filtro): KpisHoje {
  const passa = passaNoFiltro(d, filtro);
  const anterior = ultimoDiaUtil(agora);
  const mes = mesLocal(agora);
  return {
    emQaAgora: d.fila_qa.filter((c) => passa(c.project_id)).length,
    hoje: contarDia(d.eventos, diaLocal(agora), passa),
    comparacao: contarDia(d.eventos, diaLocal(anterior), passa),
    diaComparacao: diaLocal(anterior),
    taxaAprovacaoMes: resumoPorMes(d, filtro).find((r) => r.ano_mes === mes)?.taxa_aprovacao ?? null,
  };
}

export interface EstadoAtualizacao {
  /** Minutos desde a última coleta, ou null se o JSON não souber. */
  minutos: number | null;
  /** Mais de `lacuna_horas` sem coleta, dentro do expediente de dia útil. */
  atrasado: boolean;
  /** A última coleta é de outro dia: "hoje" ainda não foi medido. */
  outroDia: boolean;
  momento: number | null;
}

export function estadoAtualizacao(d: Dashboard, agora: Date): EstadoAtualizacao {
  const momento = d.coleta.momento;
  if (!momento) return { minutos: null, atrasado: true, outroDia: false, momento: null };
  const minutos = Math.floor((agora.getTime() / 1000 - momento) / 60);
  const [abre, fecha] = d.regras.expediente;
  const hora = agora.getHours() + agora.getMinutes() / 60;
  const noExpediente = ehDiaUtil(agora) && hora >= abre && hora < fecha;
  return {
    minutos,
    atrasado: noExpediente && minutos > d.regras.lacuna_horas * 60,
    outroDia: diaLocal(new Date(momento * 1000)) !== diaLocal(agora),
    momento,
  };
}

/**
 * O "dia" que os contadores do dia podem afirmar: hoje, se a última coleta é
 * de hoje; senão, o dia da última coleta. Contar "hoje" sobre dado de ontem
 * mostraria zeros que não foram medidos.
 */
export function diaDeReferencia(d: Dashboard, agora: Date): Date {
  const e = estadoAtualizacao(d, agora);
  return e.outroDia && e.momento ? new Date(e.momento * 1000) : agora;
}

export function lacunasRecentes(d: Dashboard, agora: Date, dias = 7): Lacuna[] {
  const limite = agora.getTime() / 1000 - dias * 86400;
  return d.lacunas.filter((l) => l.fim >= limite);
}

export function historicoDoCard(d: Dashboard, taskId: number): Evento[] {
  return d.eventos.filter((e) => e.task_id === taskId).sort((a, b) => a.momento - b.momento);
}

/**
 * Momento da coleta anterior à atual: o que entrou em QA depois dele é
 * "novo desde a última coleta" (a única coisa que o dourado marca).
 */
export function inicioDaUltimaColeta(d: Dashboard): number | null {
  const atual = d.coleta.momento;
  const anteriores = d.execucoes.filter((m) => atual === null || m < atual - 60);
  return anteriores.length ? anteriores[anteriores.length - 1] : null;
}

export function paginar<T>(itens: T[], porPagina: number, pagina: number): { itens: T[]; total: number } {
  const total = Math.max(1, Math.ceil(itens.length / porPagina));
  const p = Math.min(Math.max(0, pagina), total - 1);
  return { itens: itens.slice(p * porPagina, (p + 1) * porPagina), total };
}

/** {task_id: título} juntando cards, fila, carga e eventos (o mais recente vence). */
export function indiceTitulos(d: Dashboard): Map<number, string> {
  const m = new Map<number, string>();
  for (const e of d.eventos) if (e.titulo) m.set(e.task_id, e.titulo);
  for (const c of d.carga ?? []) if (c.titulo) m.set(c.task_id, c.titulo);
  for (const c of d.cards) if (c.titulo) m.set(c.task_id, c.titulo);
  for (const c of d.fila_qa) if (c.titulo) m.set(c.task_id, c.titulo);
  return m;
}

/** {project_id: nome} */
export function indiceProjetos(d: Dashboard): Map<number, string> {
  return new Map(d.projetos.map((p) => [p.id, p.nome]));
}

export interface Permanencia {
  /** Segundos na coluna de destino do evento. */
  segundos: number;
  coluna: string;
  emQa: boolean;
  /** O card continua nessa coluna agora (conta até o momento da coleta). */
  atual: boolean;
}

/**
 * Quanto tempo o card ficou na coluna para onde cada evento o levou. Só
 * afirma quando a sequência fecha (o próximo evento sai da mesma coluna em
 * que este entrou): um movimento perdido entre os dois deixaria o tempo falso.
 */
export function permanencias(historico: Evento[], ateMomento: number | null): (Permanencia | null)[] {
  const FIM: Evento["evento"][] = ["sumiu", "fechada"];
  return historico.map((e, i) => {
    const prox = historico[i + 1];
    const coluna = e.para_coluna ?? "";
    if (!coluna) return null;
    const emQa = e.para_papel === "qa";
    if (prox) {
      if (prox.de_coluna !== coluna || prox.momento < e.momento) return null;
      return { segundos: prox.momento - e.momento, coluna, emQa, atual: false };
    }
    if (!ateMomento || e.para_papel === "concluida" || FIM.includes(e.evento) || ateMomento < e.momento) return null;
    return { segundos: ateMomento - e.momento, coluna, emQa, atual: true };
  });
}
