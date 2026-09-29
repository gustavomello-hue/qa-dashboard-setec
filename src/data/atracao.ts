// Modo atração: com ?tv na URL o painel percorre sozinho as telas, como o
// fliperama parado roda a demonstração. Função pura para ser testada.

import type { Prefixo } from "./contrato";
import type { Filtro } from "./seletores";

export interface Quadro {
  tela: "hoje" | "mensal";
  filtro: Filtro;
  pagina: number;
}

export const SEGUNDOS_POR_QUADRO = 12;
export const PREFIXOS_ATRACAO: Prefixo[] = ["DEV", "WEB", "MOB", "Demandas"];

/**
 * Sequência: Hoje (todas as páginas da fila), Mensal, e depois Hoje de cada
 * prefixo que tenha card em QA. `paginas` diz quantas páginas a fila tem
 * para um filtro.
 */
export function sequenciaAtracao(paginas: (filtro: Filtro) => number): Quadro[] {
  const quadros: Quadro[] = [];
  const hoje = (filtro: Filtro) => {
    const n = paginas(filtro);
    for (let p = 0; p < Math.max(1, n); p++) quadros.push({ tela: "hoje", filtro, pagina: p });
  };
  hoje({});
  quadros.push({ tela: "mensal", filtro: {}, pagina: 0 });
  for (const prefixo of PREFIXOS_ATRACAO) {
    if (paginas({ prefixo }) > 0) hoje({ prefixo });
  }
  return quadros;
}
