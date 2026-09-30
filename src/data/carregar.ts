import { useCallback, useEffect, useRef, useState } from "react";
import { VERSAO_CONTRATO, type Dashboard } from "./contrato";

// De onde vem o JSON:
// - publicado: branch `dados` do repo, servido pelo raw do GitHub (o site não
//   precisa ser recompilado a cada coleta);
// - desenvolvimento: public/dados-local.json (npm run dados:local).
// VITE_DADOS_URL sobrescreve os dois.
const URL_PADRAO = import.meta.env.DEV
  ? `${import.meta.env.BASE_URL}dados-local.json`
  : "https://raw.githubusercontent.com/gustavomello-hue/qa-dashboard-setec/dados/dashboard.json";

export const URL_DADOS: string = import.meta.env.VITE_DADOS_URL || URL_PADRAO;

/** Recarrega a cada 10 min (o intervalo da coleta), e só com a aba visível. */
export const INTERVALO_MS = 10 * 60 * 1000;

export class ErroDeDados extends Error {}

export async function buscarDashboard(url = URL_DADOS): Promise<Dashboard> {
  // O parâmetro fura o cache do navegador; o do raw (~5 min) é aceitável.
  const resposta = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
  if (!resposta.ok) {
    throw new ErroDeDados(`Não foi possível baixar os dados (HTTP ${resposta.status}).`);
  }
  const dados = (await resposta.json()) as Dashboard;
  if (dados.versao !== VERSAO_CONTRATO) {
    throw new ErroDeDados(
      `Formato de dados v${dados.versao}, mas este site entende v${VERSAO_CONTRATO}. ` +
        "Atualize o site ou o exportador.",
    );
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
        setDados(d);
        setErro(null);
        setBuscadoEm(Date.now());
      })
      // Falha na atualização mantém o último dado bom na tela.
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : String(e)))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    recarregar();
    const tick = () => {
      if (document.visibilityState === "visible" && Date.now() - ultimaBusca.current >= INTERVALO_MS) {
        recarregar();
      }
    };
    const id = window.setInterval(tick, 60 * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [recarregar]);

  return { dados, erro, carregando, buscadoEm, recarregar };
}
