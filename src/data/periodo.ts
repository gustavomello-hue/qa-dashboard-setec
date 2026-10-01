// Período das métricas por pessoa: um mês fechado (ou o corrente) ou os
// últimos 7 dias. Sempre comparado com o período imediatamente anterior de
// mesmo tamanho. Intervalos são de dias "AAAA-MM-DD", inclusivos, no fuso do
// navegador (o mesmo do PC que coleta).

import { diaLocal, mesLocal } from "./seletores";
import { mesCurto } from "./formato";

export type Periodo = { tipo: "mes"; mes: string } | { tipo: "7d" };

export interface Intervalo {
  de: string;
  ate: string;
}

function somarDias(dia: string, n: number): string {
  const [a, m, d] = dia.split("-").map(Number);
  return diaLocal(new Date(a, m - 1, d + n));
}

export function mesAnterior(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  return mesLocal(new Date(a, m - 2, 1));
}

function doMes(mes: string): Intervalo {
  // "-31" funciona como teto para qualquer mês na comparação de texto.
  return { de: `${mes}-01`, ate: `${mes}-31` };
}

export function intervalo(p: Periodo, agora: Date): Intervalo {
  if (p.tipo === "mes") return doMes(p.mes);
  const hoje = diaLocal(agora);
  return { de: somarDias(hoje, -6), ate: hoje };
}

/** O mês escolhido é o corrente, ainda sem fim. */
export function emAndamento(p: Periodo, agora: Date): boolean {
  return p.tipo === "mes" && p.mes === mesLocal(agora);
}

/**
 * Período de comparação. Mês fechado compara com o mês anterior inteiro; o
 * mês corrente compara com o MESMO trecho do anterior (1 a 3 de outubro contra
 * 1 a 3 de setembro): três dias contra um mês inteiro pareceria uma queda.
 */
export function intervaloAnterior(p: Periodo, agora: Date): Intervalo {
  if (p.tipo === "mes") {
    const anterior = doMes(mesAnterior(p.mes));
    if (!emAndamento(p, agora)) return anterior;
    const [a, m] = mesAnterior(p.mes).split("-").map(Number);
    const dia = Math.min(agora.getDate(), new Date(a, m, 0).getDate());
    return { de: anterior.de, ate: `${mesAnterior(p.mes)}-${String(dia).padStart(2, "0")}` };
  }
  const atual = intervalo(p, agora);
  return { de: somarDias(atual.de, -7), ate: somarDias(atual.de, -1) };
}

export function dentro(dia: string, i: Intervalo): boolean {
  return dia >= i.de && dia <= i.ate;
}

/**
 * Período que a tela abre sem escolha. Nos 5 primeiros dias o mês corrente
 * ainda é quase vazio (um mar de zeros parece equipe parada): abre o último
 * mês fechado, e a tela diz isso.
 */
export function periodoPadrao(agora: Date): Periodo {
  if (inicioDeMes(agora)) return { tipo: "mes", mes: mesAnterior(mesLocal(agora)) };
  return { tipo: "mes", mes: mesLocal(agora) };
}

export function inicioDeMes(agora: Date): boolean {
  return agora.getDate() <= 5;
}

/** Meses selecionáveis: de `desde` até o mês corrente, do mais novo ao mais velho. */
export function mesesDisponiveis(desde: string, agora: Date): string[] {
  const meses: string[] = [];
  for (let m = mesLocal(agora); m >= desde; m = mesAnterior(m)) meses.push(m);
  return meses;
}

export function rotuloPeriodo(p: Periodo): string {
  return p.tipo === "7d" ? "Últimos 7 dias" : mesCurto(p.mes);
}

/** "out/26 · em andamento, até dia 3" para o mês corrente; senão o rótulo curto. */
export function rotuloPeriodoLongo(p: Periodo, agora: Date): string {
  return p.tipo === "mes" && emAndamento(p, agora)
    ? `${mesCurto(p.mes)} · em andamento, até dia ${agora.getDate()}`
    : rotuloPeriodo(p);
}

export function rotuloAnterior(p: Periodo, agora: Date): string {
  if (p.tipo === "7d") return "7 dias anteriores";
  const mes = mesCurto(mesAnterior(p.mes));
  return emAndamento(p, agora) ? `${mes} até dia ${intervaloAnterior(p, agora).ate.slice(8).replace(/^0/, "")}` : mes;
}

/** "2026-09" | "7d" na URL. */
export function lerPeriodo(texto: string | null): Periodo | undefined {
  if (texto === "7d") return { tipo: "7d" };
  if (texto && /^\d{4}-\d{2}$/.test(texto)) return { tipo: "mes", mes: texto };
  return undefined;
}

export function escreverPeriodo(p: Periodo): string {
  return p.tipo === "7d" ? "7d" : p.mes;
}

/** Último dia de verdade do intervalo: o "-31" vira o último dia do mês, e nunca passa de hoje. */
export function ultimoDia(i: Intervalo, agora: Date): string {
  const [a, m, d] = i.ate.split("-").map(Number);
  const diasNoMes = new Date(a, m, 0).getDate();
  const fim = diaLocal(new Date(a, m - 1, Math.min(d, diasNoMes)));
  const hoje = diaLocal(agora);
  return fim < hoje ? fim : hoje;
}
