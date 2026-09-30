import { useEffect, useState } from "react";
import type { Prefixo } from "./contrato";
import type { Filtro } from "./seletores";
import { escreverPeriodo, lerPeriodo, type Periodo } from "./periodo";

// Tela e filtros moram no hash da URL (#/equipe?prefixo=DEV&periodo=2026-09)
// para qualquer visão poder ser compartilhada por link. Hash, e não caminho,
// porque o GitHub Pages não sabe redirecionar /equipe para o index.html.

export type Tela = "agora" | "equipe" | "pessoa" | "mensal" | "card";
/** Telas do menu. "pessoa" abre clicando num nome. */
export const TELAS: Tela[] = ["agora", "equipe", "mensal", "card"];
const TODAS: Tela[] = [...TELAS, "pessoa"];

export interface Rota {
  tela: Tela;
  filtro: Filtro;
  /** Ausente = mês corrente. */
  periodo?: Periodo;
  /** Card aberto na tela Card. */
  card?: number;
  /** user_id aberto na tela Pessoa. */
  pessoa?: number;
  /** Modo TV: percorre as telas sozinho. */
  tv?: boolean;
  /** Fila só com os cards que o painel do Kanboard não mostra. */
  fora?: boolean;
  /** Tela Equipe com quem já saiu da equipe. */
  inativos?: boolean;
}

const PREFIXOS: Prefixo[] = ["DEV", "WEB", "MOB", "Demandas", "Outros"];
const FLAGS = ["tv", "fora", "inativos"] as const;

function inteiro(texto: string | null): number | undefined {
  const n = Number(texto);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function lerRota(hash: string): Rota {
  const [caminho, busca = ""] = hash.replace(/^#\/?/, "").split("?");
  // "hoje" era o nome da tela inicial antes da v2: links antigos continuam valendo.
  const tela = (TODAS as string[]).includes(caminho) ? (caminho as Tela) : "agora";
  const p = new URLSearchParams(busca);
  const filtro: Filtro = {};
  const prefixo = p.get("prefixo");
  if (prefixo && (PREFIXOS as string[]).includes(prefixo)) filtro.prefixo = prefixo as Prefixo;
  const projeto = inteiro(p.get("projeto"));
  if (projeto !== undefined) filtro.projeto = projeto;
  const periodo = lerPeriodo(p.get("periodo"));
  const card = inteiro(p.get("card"));
  const pessoa = inteiro(p.get("pessoa"));
  const rota: Rota = { tela, filtro };
  if (periodo) rota.periodo = periodo;
  if (card !== undefined) rota.card = card;
  if (pessoa !== undefined) rota.pessoa = pessoa;
  for (const f of FLAGS) if (p.has(f)) rota[f] = true;
  return rota;
}

export function escreverRota(r: Rota): string {
  const p = new URLSearchParams();
  if (r.filtro.prefixo) p.set("prefixo", r.filtro.prefixo);
  if (r.filtro.projeto !== undefined) p.set("projeto", String(r.filtro.projeto));
  if (r.periodo) p.set("periodo", escreverPeriodo(r.periodo));
  if (r.card !== undefined) p.set("card", String(r.card));
  if (r.pessoa !== undefined) p.set("pessoa", String(r.pessoa));
  for (const f of FLAGS) if (r[f]) p.set(f, "");
  // Flags sem valor ficam "?tv", não "?tv=".
  const busca = p.toString().replace(/\b(tv|fora|inativos)=(&|$)/g, "$1$2");
  return `#/${r.tela}${busca ? `?${busca}` : ""}`;
}

export function useRota(): [Rota, (r: Rota) => void] {
  const [rota, setRota] = useState(() => lerRota(window.location.hash));
  useEffect(() => {
    const aoMudar = () => setRota(lerRota(window.location.hash));
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);
  return [rota, (r) => { window.location.hash = escreverRota(r); }];
}
