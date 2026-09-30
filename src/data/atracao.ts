// Modo TV: com ?tv na URL o painel percorre sozinho as telas. Função pura
// para ser testada.

import type { Prefixo } from "./contrato";
import type { Filtro } from "./seletores";

export interface Quadro {
  tela: "agora" | "equipe" | "mensal";
  filtro: Filtro;
}

export const SEGUNDOS_POR_QUADRO = 20;
export const PREFIXOS_ATRACAO: Prefixo[] = ["DEV", "WEB", "MOB", "Demandas"];

/**
 * Sequência: Agora, Equipe, Mensal, e depois Agora de cada prefixo que tenha
 * card em QA. `cardsEmQa` diz quantos cards a fila tem para um filtro.
 */
export function sequenciaAtracao(cardsEmQa: (filtro: Filtro) => number): Quadro[] {
  const quadros: Quadro[] = [
    { tela: "agora", filtro: {} },
    { tela: "equipe", filtro: {} },
    { tela: "mensal", filtro: {} },
  ];
  for (const prefixo of PREFIXOS_ATRACAO) {
    if (cardsEmQa({ prefixo }) > 0) quadros.push({ tela: "agora", filtro: { prefixo } });
  }
  return quadros;
}
