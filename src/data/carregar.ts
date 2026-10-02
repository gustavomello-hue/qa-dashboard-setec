import { useCallback, useEffect, useRef, useState } from "react";
import { VERSAO_CONTRATO, type Dashboard } from "./contrato";
import { intervaloBusca, recarregarPorContrato } from "./atualizacao";
import { ErroSenha, decifrar, derivarChave, ehEnvelope, exportarChave, importarChave, type Envelope } from "./cifra";

// De onde vem o JSON:
// - publicado: branch `dados` do repo, servido pelo raw do GitHub (o site não
//   precisa ser recompilado a cada coleta), cifrado com a senha do painel;
// - desenvolvimento: public/dados-local.json (npm run dados:local), em claro.
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

async function buscarBruto(url: string): Promise<unknown> {
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
  try {
    return await resposta.json();
  } catch {
    throw new ErroDeDados("O arquivo de dados chegou incompleto ou corrompido. Tente de novo; se persistir, a publicação precisa ser refeita.");
  }
}

function validar(bruto: unknown): Dashboard {
  const dados = bruto as Dashboard;
  if (dados.versao !== VERSAO_CONTRATO) {
    throw new ErroDeContrato(
      `Os dados estão no formato v${dados.versao} e este site entende v${VERSAO_CONTRATO}. ` +
        "Recarregue a página (Ctrl+F5) para buscar a versão nova do site.");
  }
  return dados;
}

// --- A chave do painel ----------------------------------------------------
// Fica na memória da aba e, com "lembrar neste dispositivo", no localStorage.
// O que se guarda é a CHAVE derivada, nunca a senha. Trocar a senha muda a
// chave: a guardada deixa de abrir os dados e o painel volta a pedir.
const CHAVE_LEMBRADA = "qa:chave";
let chaveDaSessao: CryptoKey | null = null;

async function chaveConhecida(): Promise<CryptoKey | null> {
  if (chaveDaSessao) return chaveDaSessao;
  try {
    const texto = localStorage.getItem(CHAVE_LEMBRADA);
    if (texto) chaveDaSessao = await importarChave(texto);
  } catch {
    // Sem localStorage (aba anônima, bloqueio) ou chave corrompida: pede a senha.
  }
  return chaveDaSessao;
}

function esquecerChave() {
  chaveDaSessao = null;
  try {
    localStorage.removeItem(CHAVE_LEMBRADA);
  } catch {
    // nada a esquecer
  }
}

/** A chave que este dispositivo tinha não abre mais: a senha foi trocada. */
class ErroSenhaTrocada extends ErroSenha {}

/** Esquece a senha neste dispositivo (e nesta aba). */
export function sairDoPainel() {
  esquecerChave();
  window.location.reload();
}

async function abrir(bruto: unknown): Promise<Dashboard> {
  if (!ehEnvelope(bruto)) return validar(bruto);
  const chave = await chaveConhecida();
  if (!chave) throw new ErroSenha("Este painel é protegido por senha.");
  try {
    return validar(await decifrar(bruto, chave));
  } catch (e) {
    if (e instanceof ErroSenha) {
      esquecerChave();
      throw new ErroSenhaTrocada("A senha do painel mudou. Digite a nova.");
    }
    throw e;
  }
}

export async function buscarDashboard(url = URL_DADOS): Promise<Dashboard> {
  return abrir(await buscarBruto(url));
}

export interface EstadoDados {
  dados: Dashboard | null;
  erro: string | null;
  carregando: boolean;
  /** Momento (ms) da última busca bem-sucedida. */
  buscadoEm: number | null;
  recarregar: () => void;
  /** Não-nulo quando o painel precisa da senha: o motivo para mostrar na tela. */
  pedeSenha: string | null;
  /** Tenta a senha. Devolve a mensagem de erro, ou null se abriu. */
  entrar: (senha: string, lembrar: boolean) => Promise<string | null>;
  /** Os dados chegaram cifrados (o painel tem senha e faz sentido "sair"). */
  protegido: boolean;
}

export function useDashboard(): EstadoDados {
  const [dados, setDados] = useState<Dashboard | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [buscadoEm, setBuscadoEm] = useState<number | null>(null);
  const [pedeSenha, setPedeSenha] = useState<string | null>(null);
  const [protegido, setProtegido] = useState(false);
  const ultimaBusca = useRef(0);
  const ultimoEnvelope = useRef<Envelope | null>(null);

  const aplicar = useCallback((d: Dashboard) => {
    // Sem coleta nova (o caso comum da busca de 1 min): mesmo objeto, nada redesenha.
    setDados((atual) => (atual && atual.gerado_em === d.gerado_em ? atual : d));
    setErro(null);
    setPedeSenha(null);
    setBuscadoEm(Date.now());
  }, []);

  const recarregar = useCallback(() => {
    ultimaBusca.current = Date.now();
    setCarregando(true);
    buscarBruto(URL_DADOS)
      .then((bruto) => {
        if (ehEnvelope(bruto)) ultimoEnvelope.current = bruto;
        setProtegido(ehEnvelope(bruto));
        return abrir(bruto);
      })
      .then(aplicar)
      .catch((e: unknown) => {
        if (e instanceof ErroSenha) {
          // "A senha mudou" vale até alguém entrar: a busca seguinte (já sem
          // chave) diria só "protegido por senha" e apagaria o motivo.
          const motivo = e.message;
          setPedeSenha((atual) => (e instanceof ErroSenhaTrocada ? motivo : atual ?? motivo));
          return;
        }
        // Contrato novo: recarrega para buscar o site que o entende (com trava contra laço).
        if (e instanceof ErroDeContrato && recarregarPorContrato()) return;
        // Falha na atualização mantém o último dado bom na tela.
        setErro(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setCarregando(false));
  }, [aplicar]);

  const entrar = useCallback(async (senha: string, lembrar: boolean): Promise<string | null> => {
    const envelope = ultimoEnvelope.current;
    if (!envelope) return "Os dados ainda não chegaram. Tente de novo em instantes.";
    let chave: CryptoKey;
    let aberto: Dashboard;
    try {
      chave = await derivarChave(senha, envelope.kdf);
      aberto = validar(await decifrar(envelope, chave));
    } catch (e) {
      if (e instanceof ErroSenha) return "Senha incorreta.";
      if (e instanceof ErroDeContrato && recarregarPorContrato()) return null;
      return e instanceof Error ? e.message : String(e);
    }
    chaveDaSessao = chave;
    if (lembrar) {
      try {
        localStorage.setItem(CHAVE_LEMBRADA, await exportarChave(chave));
      } catch {
        // Sem localStorage: vale só para esta aba.
      }
    }
    aplicar(aberto);
    return null;
  }, [aplicar]);

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

  return { dados, erro, carregando, buscadoEm, recarregar, pedeSenha, entrar, protegido };
}
