import { useEffect, useState } from "react";

// Atualização sozinha do painel (PLANO-BASE-DADOS.md, Q1–Q8):
// - dados: busca curta no expediente da coleta, longa fora dele;
// - site: um deploy novo chega às abas abertas sem ninguém dar F5.

/** Expediente da coleta no Agendador: a cada 10 min das 7h às 19h. */
const COLETA_INICIO_H = 7;
const COLETA_FIM_H = 19;

/**
 * Intervalo entre buscas do JSON. No expediente, 1 min: o atraso fica no cache
 * do raw (~5 min), não na espera. Fora dele não há coleta nova para buscar.
 */
export function intervaloBusca(agora: Date): number {
  const h = agora.getHours();
  return h >= COLETA_INICIO_H && h < COLETA_FIM_H ? 60 * 1000 : 10 * 60 * 1000;
}

/** Sem mouse nem teclado por este tempo, a recarga não atrapalha ninguém. */
export const OCIOSO_MS = 2 * 60 * 1000;

export type Recarga = "agora" | "avisar" | "esperar";

/**
 * O que fazer quando há versão nova do site. A apresentação da Reunião nunca
 * recarrega sozinha: o slide voltaria ao primeiro no meio da conversa.
 */
export function decidirRecarga(o: { oculta: boolean; ociosoMs: number; apresentando: boolean }): Recarga {
  if (o.oculta) return "agora";
  if (o.apresentando) return "esperar";
  return o.ociosoMs >= OCIOSO_MS ? "agora" : "avisar";
}

/** Trava contra laço de recarga quando o contrato muda e o site novo ainda não chegou ao CDN. */
export const TRAVA_RECARGA_MS = 10 * 60 * 1000;
const CHAVE_TRAVA = "qa:recarga-contrato";

export function podeRecarregarPorContrato(ultima: number | null, agora: number): boolean {
  return ultima === null || agora - ultima >= TRAVA_RECARGA_MS;
}

/**
 * Recarrega a página para buscar o site que entende o contrato novo.
 * Devolve false se já recarregou há pouco (aí o erro aparece na tela).
 */
export function recarregarPorContrato(): boolean {
  let ultima: number | null = null;
  try {
    const v = sessionStorage.getItem(CHAVE_TRAVA);
    ultima = v ? Number(v) : null;
  } catch {
    // Sem sessionStorage não há trava: melhor mostrar o erro que recarregar em laço.
    return false;
  }
  const agora = Date.now();
  if (!podeRecarregarPorContrato(ultima, agora)) return false;
  try {
    sessionStorage.setItem(CHAVE_TRAVA, String(agora));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

// --- Versão do site -------------------------------------------------------

/** SHA do commit do build (o `versao.json` publicado tem o mesmo valor). */
export const VERSAO_SITE: string = __VERSAO_SITE__;

const URL_VERSAO = `${import.meta.env.BASE_URL}versao.json`;
const INTERVALO_VERSAO_MS = 5 * 60 * 1000;

async function versaoPublicada(): Promise<string | null> {
  try {
    const r = await fetch(URL_VERSAO, { cache: "no-cache", signal: AbortSignal.timeout(20 * 1000) });
    if (!r.ok) return null;
    const v = (await r.json()) as { versao?: unknown };
    return typeof v.versao === "string" ? v.versao : null;
  } catch {
    // Rede ruim não é versão nova: tenta de novo na próxima volta.
    return null;
  }
}

/**
 * Descobre deploy novo e aplica a regra de `decidirRecarga`.
 * Devolve true enquanto houver versão nova esperando (para mostrar o aviso).
 */
export function useVersaoNova(apresentando: boolean): boolean {
  const [nova, setNova] = useState(false);

  // Procura a cada 5 min, também com a aba oculta (aba oculta recarrega na hora,
  // então volta já atualizada). Em desenvolvimento não há versão.
  useEffect(() => {
    if (VERSAO_SITE === "dev" || nova) return;
    let ultima = 0;
    const checar = () => {
      if (Date.now() - ultima < INTERVALO_VERSAO_MS) return;
      ultima = Date.now();
      versaoPublicada().then((v) => {
        if (v && v !== VERSAO_SITE) setNova(true);
      });
    };
    checar();
    const id = window.setInterval(checar, 60 * 1000);
    return () => window.clearInterval(id);
  }, [nova]);

  // Aplica: recarrega quando ninguém está olhando ou mexendo.
  useEffect(() => {
    if (!nova) return;
    let ultimoUso = Date.now();
    const usou = () => {
      ultimoUso = Date.now();
    };
    const eventos = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"] as const;
    eventos.forEach((e) => window.addEventListener(e, usou, { passive: true }));
    const avaliar = () => {
      const r = decidirRecarga({
        oculta: document.visibilityState === "hidden",
        ociosoMs: Date.now() - ultimoUso,
        apresentando,
      });
      if (r === "agora") window.location.reload();
    };
    const id = window.setInterval(avaliar, 15 * 1000);
    document.addEventListener("visibilitychange", avaliar);
    return () => {
      eventos.forEach((e) => window.removeEventListener(e, usou));
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", avaliar);
    };
  }, [nova, apresentando]);

  return nova;
}
