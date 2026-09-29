import { useEffect, useState } from "react";
import type { Prefixo } from "./contrato";
import type { Filtro } from "./seletores";

// Aba e filtros moram no hash da URL (#/mensal?prefixo=DEV) para qualquer
// visão poder ser compartilhada por link. Hash, e não caminho, porque o
// GitHub Pages não sabe redirecionar /mensal para o index.html.

export type Tela = "hoje" | "mensal" | "card";
export const TELAS: Tela[] = ["hoje", "mensal", "card"];

export interface Rota {
  tela: Tela;
  filtro: Filtro;
  /** Card aberto na tela Card. */
  card?: number;
  /** Modo atração (TV da sala): percorre as telas sozinho. */
  tv?: boolean;
  /** Fila só com os cards que o painel do Kanboard não mostra. */
  fora?: boolean;
}

const PREFIXOS: Prefixo[] = ["DEV", "WEB", "MOB", "Demandas", "Outros"];

export function lerRota(hash: string): Rota {
  const [caminho, busca = ""] = hash.replace(/^#\/?/, "").split("?");
  const tela = (TELAS as string[]).includes(caminho) ? (caminho as Tela) : "hoje";
  const p = new URLSearchParams(busca);
  const filtro: Filtro = {};
  const prefixo = p.get("prefixo");
  if (prefixo && (PREFIXOS as string[]).includes(prefixo)) filtro.prefixo = prefixo as Prefixo;
  const projeto = Number(p.get("projeto"));
  if (Number.isInteger(projeto) && projeto > 0) filtro.projeto = projeto;
  const card = Number(p.get("card"));
  return {
    tela,
    filtro,
    ...(Number.isInteger(card) && card > 0 ? { card } : {}),
    ...(p.has("tv") ? { tv: true } : {}),
    ...(p.has("fora") ? { fora: true } : {}),
  };
}

export function escreverRota(r: Rota): string {
  const p = new URLSearchParams();
  if (r.filtro.prefixo) p.set("prefixo", r.filtro.prefixo);
  if (r.filtro.projeto !== undefined) p.set("projeto", String(r.filtro.projeto));
  if (r.card !== undefined) p.set("card", String(r.card));
  if (r.tv) p.set("tv", "");
  if (r.fora) p.set("fora", "");
  // Flags sem valor ficam "?tv" e "?fora", não "?tv=".
  const busca = p.toString().replace(/\b(tv|fora)=(&|$)/g, "$1$2");
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
