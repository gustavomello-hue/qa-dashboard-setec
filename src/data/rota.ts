import { useEffect, useState } from "react";
import type { Prefixo } from "./contrato";
import type { Filtro } from "./seletores";
import { escreverPeriodo, lerPeriodo, type Periodo } from "./periodo";
import { METRICAS_LISTA, lerPeriodoLista, type MetricaLista } from "./listas";

// Tela e filtros moram no hash da URL (#/equipe?prefixo=DEV&periodo=2026-09)
// para qualquer visão poder ser compartilhada por link. Hash, e não caminho,
// porque o GitHub Pages não sabe redirecionar /equipe para o index.html.

export type Tela = "agora" | "equipe" | "pessoa" | "mensal" | "card" | "reuniao" | "projetos" | "cards";
/** Telas do menu. "pessoa" abre clicando num nome. */
export const TELAS: Tela[] = ["agora", "equipe", "mensal", "card", "reuniao", "projetos"];

/** Modo reunião: mensal da equipe ou conversa individual. */
export type TipoReuniao = "mensal" | "individual";
/** "pessoa" e "cards" abrem por clique, fora do menu. */
const TODAS: Tela[] = [...TELAS, "pessoa", "cards"];

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
  /** Reunião: qual apresentação. */
  reuniao?: TipoReuniao;
  /** Reunião: lâmina aberta (1, 2, ...). Ausente = tela de preparo. */
  slide?: number;
  /** Projetos: project_id aberto no detalhe. */
  detalhe?: number;
  /** Lista de cards: qual número foi aberto. */
  metrica?: MetricaLista;
  /** Lista de cards: período de um dia (AAAA-MM-DD). Só nesta tela. */
  dia?: string;
  /** Lista de cards: a URL trazia um período que não se lê (link editado à mão). */
  periodoInvalido?: boolean;
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
  const reuniao = p.get("reuniao");
  const slide = inteiro(p.get("slide"));
  const rota: Rota = { tela, filtro };
  if (periodo) rota.periodo = periodo;
  if (tela === "cards") {
    const bruto = p.get("periodo");
    const lido = lerPeriodoLista(bruto);
    if (lido?.tipo === "dia") rota.dia = lido.dia;
    if (bruto !== null && !lido) {
      rota.periodoInvalido = true;
      delete rota.periodo;
    }
    const metrica = p.get("metrica");
    if (metrica && (METRICAS_LISTA as readonly string[]).includes(metrica)) rota.metrica = metrica as MetricaLista;
  }
  if (card !== undefined) rota.card = card;
  if (pessoa !== undefined) rota.pessoa = pessoa;
  if (reuniao === "mensal" || reuniao === "individual") rota.reuniao = reuniao;
  if (slide !== undefined) rota.slide = slide;
  const detalhe = inteiro(p.get("detalhe"));
  if (detalhe !== undefined) rota.detalhe = detalhe;
  for (const f of FLAGS) if (p.has(f)) rota[f] = true;
  return rota;
}

export function escreverRota(r: Rota): string {
  const p = new URLSearchParams();
  if (r.filtro.prefixo) p.set("prefixo", r.filtro.prefixo);
  if (r.filtro.projeto !== undefined) p.set("projeto", String(r.filtro.projeto));
  if (r.dia) p.set("periodo", r.dia);
  else if (r.periodo) p.set("periodo", escreverPeriodo(r.periodo));
  if (r.card !== undefined) p.set("card", String(r.card));
  if (r.pessoa !== undefined) p.set("pessoa", String(r.pessoa));
  if (r.reuniao) p.set("reuniao", r.reuniao);
  if (r.slide !== undefined) p.set("slide", String(r.slide));
  if (r.detalhe !== undefined) p.set("detalhe", String(r.detalhe));
  if (r.metrica) p.set("metrica", r.metrica);
  for (const f of FLAGS) if (r[f]) p.set(f, "");
  // Flags sem valor ficam "?tv", não "?tv=".
  const busca = p.toString().replace(/\b(tv|fora|inativos)=(&|$)/g, "$1$2");
  return `#/${r.tela}${busca ? `?${busca}` : ""}`;
}

/** Rota ao trocar de aba: a tela nova começa limpa (sem pessoa, card de outra tela ou detalhe de projeto). */
export function rotaDaTela(r: Rota, tela: Tela): Rota {
  return { ...r, tela, tv: false, pessoa: undefined, card: tela === "card" ? r.card : undefined, detalhe: undefined, metrica: undefined, dia: undefined, periodoInvalido: undefined };
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
