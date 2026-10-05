// Números do modo reunião. Nada é calculado de novo: tudo sai das mesmas
// funções das telas Mensal, Equipe e Pessoa, recortado para um mês.

import type { CargaCard, Dashboard, Lacuna } from "./contrato";
import { dentro, type Intervalo } from "./periodo";
import {
  atribuicoesDe, cardsAbertos, cardsDaMetrica, resumirPorPessoa, taxaCardsPorMes, type CardContado,
} from "./pessoas";
import { resumoPorMes, semReprovacao, type Filtro } from "./seletores";

export interface NumerosMes {
  mes: string;
  entradas: number;
  aprovados: number;
  reprovados: number;
  taxa: number | null;
  cardsReprovados: number;
  cardsJulgados: number;
  tempoMedioH: number | null;
  completude: string;
}

function mesAnterior(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(a, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** O mês pedido e o anterior, já com a % de cards reprovados por card. */
export function numerosDoMes(d: Dashboard, filtro: Filtro, mes: string): { atual: NumerosMes | null; anterior: NumerosMes | null } {
  const linhas = resumoPorMes(d, filtro);
  const taxas = taxaCardsPorMes(d, filtro);
  const de = (m: string): NumerosMes | null => {
    const l = linhas.find((x) => x.ano_mes === m);
    if (!l) return null;
    const t = taxas.get(m);
    return {
      mes: m,
      entradas: l.entradas,
      aprovados: l.aprovados,
      reprovados: l.reprovados,
      taxa: t?.taxa ?? null,
      cardsReprovados: t?.cardsReprovados ?? 0,
      cardsJulgados: t?.cardsJulgados ?? 0,
      tempoMedioH: l.tempo_medio_qa_h,
      completude: l.completude,
    };
  };
  return { atual: de(mes), anterior: de(mesAnterior(mes)) };
}

export interface CardsParaConversar {
  reprovadosVariasVezes: CardContado[];
  semQa: CardContado[];
  abertosMaisAntigos: CargaCard[];
  /** Totais antes do corte: a lâmina diz "e mais N" em vez de esconder. */
  totais: { reprovados: number; semQa: number; abertos: number };
}

/**
 * O mês foi medido só em parte (reconstruído antes da coleta contínua)? Como
 * base de comparação ele não vale como mês cheio.
 */
export function mesParcial(d: Dashboard, mes: string): boolean {
  return d.resumo_mensal_geral.some((l) => l.ano_mes === mes && l.completude.startsWith("parcial"));
}

/**
 * O que vale conversar no 1:1: cards reprovados mais de uma vez (ou, para QA,
 * que a pessoa reprovou mais de uma vez), concluídos sem QA e os abertos
 * parados há mais tempo. Só cards da própria pessoa.
 */
export function cardsParaConversar(
  d: Dashboard, uid: number, periodo: Intervalo, filtro: Filtro, qa: boolean, limite = 6,
): CardsParaConversar {
  const atribs = atribuicoesDe(d, periodo, filtro);
  const reprovados = cardsDaMetrica(atribs, uid, qa ? "testou_reprovado" : "reprovado").filter((c) => c.vezes > 1);
  const semQa = cardsDaMetrica(atribs, uid, "concluido_sem_qa");
  // Para quem desenvolve, card parado em Teste/QA é espera do QA, não dele: fica fora.
  const abertos = cardsAbertos(d, uid, filtro)
    .filter((c) => c.papel !== "backlog" && c.desde && (qa || c.papel !== "qa"))
    .sort((a, b) => (a.desde ?? 0) - (b.desde ?? 0));
  return {
    reprovadosVariasVezes: reprovados.slice(0, limite),
    semQa: semQa.slice(0, limite),
    abertosMaisAntigos: abertos.slice(0, limite),
    totais: { reprovados: reprovados.length, semQa: semQa.length, abertos: abertos.length },
  };
}

export interface Observacoes {
  semAutor: number;
  naoQa: { user_id: number; saidas: number }[];
  lacunas: Lacuna[];
}

/** O que não foi medido (ou foi feito fora do papel) no mês. */
export function observacoesDoMes(d: Dashboard, periodo: Intervalo, filtro: Filtro): Observacoes {
  const { porPessoa, saidasSemAutor } = resumirPorPessoa(atribuicoesDe(d, periodo, filtro), semReprovacao(d));
  const naoQa = [...porPessoa.entries()]
    .filter(([, r]) => r.saidasNaoQa > 0)
    .map(([user_id, r]) => ({ user_id, saidas: r.saidasNaoQa }))
    .sort((a, b) => b.saidas - a.saidas);
  const diaDe = (ts: number) => {
    const x = new Date(ts * 1000);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  };
  const lacunas = d.lacunas.filter((l) => dentro(diaDe(l.inicio), periodo) || dentro(diaDe(l.fim), periodo));
  return { semAutor: saidasSemAutor, naoQa, lacunas };
}

/** Divide as linhas de uma tabela em lâminas que cabem na altura da tela. */
export function dividirEmLaminas<T>(itens: T[], porLamina: number): T[][] {
  const n = Math.max(1, porLamina);
  if (itens.length <= n) return [itens];
  // Divide por igual (14 em 2 lâminas = 7 + 7, não 12 + 2).
  const laminas = Math.ceil(itens.length / n);
  const tamanho = Math.ceil(itens.length / laminas);
  return Array.from({ length: laminas }, (_, i) => itens.slice(i * tamanho, (i + 1) * tamanho));
}
