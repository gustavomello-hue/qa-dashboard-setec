import { useCallback, useEffect, useRef, useState } from "react";
import { VERSAO_CONTRATO, type Dashboard } from "./contrato";
import { intervaloBusca, recarregarPorContrato } from "./atualizacao";

// De onde vem o JSON:
// - publicado: branch `dados` do repo, servido pelo raw do GitHub (o site não
//   precisa ser recompilado a cada coleta);
// - desenvolvimento: public/dados-local.json (npm run dados:local).
// VITE_DADOS_URL sobrescreve os dois.
const URL_PADRAO = import.meta.env.DEV
  ? `${import.meta.env.BASE_URL}dados-local.json`
  : "https://raw.githubusercontent.com/gustavomello-hue/qa-dashboard-setec/dados/dashboard.json";

export const URL_DADOS: string = import.meta.env.VITE_DADOS_URL || URL_PADRAO;

export class ErroDeDados extends Error {}

/** O JSON está num contrato que este build não entende: o site precisa ser recarregado. */
export class ErroDeContrato extends ErroDeDados {}

/** Desiste de uma busca travada: sem isso, uma rede ruim deixa o painel em "Carregando…" para sempre. */
const TEMPO_LIMITE_MS = 20 * 1000;

export async function buscarDashboard(url = URL_DADOS): Promise<Dashboard> {
  // "no-cache" revalida com o ETag: sem coleta nova, a resposta é um 304 de
  // poucos bytes. Um "?t=" não adiantaria: o CDN do raw ignora a query e
  // segura o arquivo por até 5 min de qualquer jeito.
  let resposta: Response;
  try {
    resposta = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(TEMPO_LIMITE_MS) });
  } catch (e) {
    const tempo = e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError");
    throw new ErroDeDados(
      tempo
        ? "O GitHub demorou mais de 20 s para responder. A rede pode estar lenta."
        : "Sem conexão com o GitHub, de onde vêm os dados. Verifique a internet ou a VPN.",
    );
  }
  if (resposta.status === 404) {
    throw new ErroDeDados("O arquivo de dados não foi encontrado no GitHub (branch `dados`). A publicação pode não ter rodado ainda.");
  }
  if (!resposta.ok) {
    throw new ErroDeDados(`O GitHub respondeu com erro (HTTP ${resposta.status}). Tente de novo em alguns minutos.`);
  }
  let dados: Dashboard;
  try {
    dados = (await resposta.json()) as Dashboard;
  } catch {
    throw new ErroDeDados("O arquivo de dados chegou incompleto ou corrompido. Tente de novo; se persistir, a publicação precisa ser refeita.");
  }
  if (dados.versao !== VERSAO_CONTRATO) {
    throw new ErroDeContrato(
      `Os dados estão no formato v${dados.versao} e este site entende v${VERSAO_CONTRATO}. ` +
        "Recarregue a página (Ctrl+F5) para buscar a versão nova do site.");
  }
  return dados;
}

export interface EstadoDados {
  dados: Dashboard | null;
  erro: string | null;
  carregando: boolean;
  /** Momento (ms) da última busca bem-sucedida. */
  buscadoEm: number | null;
  recarregar: () => void;
}

export function useDashboard(): EstadoDados {
  const [dados, setDados] = useState<Dashboard | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [buscadoEm, setBuscadoEm] = useState<number | null>(null);
  const ultimaBusca = useRef(0);

  const recarregar = useCallback(() => {
    ultimaBusca.current = Date.now();
    setCarregando(true);
    buscarDashboard()
      .then((d) => {
        // Sem coleta nova (o caso comum da busca de 1 min): mesmo objeto, nada redesenha.
        setDados((atual) => (atual && atual.gerado_em === d.gerado_em ? atual : d));
        setErro(null);
        setBuscadoEm(Date.now());
      })
      .catch((e: unknown) => {
        // Contrato novo: recarrega para buscar o site que o entende (com trava contra laço).
        if (e instanceof ErroDeContrato && recarregarPorContrato()) return;
        // Falha na atualização mantém o último dado bom na tela.
        setErro(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    recarregar();
    const tick = () => {
      if (document.visibilityState === "visible" && Date.now() - ultimaBusca.current >= intervaloBusca(new Date())) {
        recarregar();
      }
    };
    // Volta curta: o intervalo de 1 min não pode virar 2 por causa do arredondamento.
    const id = window.setInterval(tick, 15 * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [recarregar]);

  return { dados, erro, carregando, buscadoEm, recarregar };
}
