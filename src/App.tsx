import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboard } from "./data/carregar";
import { TELAS, escreverRota, useRota, type Rota, type Tela } from "./data/rota";
import type { Dashboard, Prefixo } from "./data/contrato";
import type { Filtro } from "./data/seletores";
import { inicioDeMes, mesesDisponiveis, periodoPadrao, escreverPeriodo, lerPeriodo, rotuloPeriodo } from "./data/periodo";
import { SEGUNDOS_POR_QUADRO, sequenciaAtracao } from "./data/atracao";
import { haQuanto, nomeCurto } from "./data/formato";
import { estadoAtualizacao } from "./data/seletores";
import { AvisoColeta, SeloColeta } from "./componentes/Sinal";
import { filaFiltrada } from "./componentes/Fila";
import { Icone } from "./componentes/Icone";
import { Agora } from "./telas/Agora";
import { Equipe } from "./telas/Equipe";
import { Pessoa } from "./telas/Pessoa";
import { Mensal } from "./telas/Mensal";
import { Card } from "./telas/Card";
import { Reuniao } from "./telas/Reuniao";

const NOMES: Record<Tela, string> = { agora: "Agora", equipe: "Equipe", pessoa: "Pessoa", mensal: "Mensal", card: "Card", reuniao: "Reunião" };
const PREFIXOS: Prefixo[] = ["DEV", "WEB", "MOB", "Demandas"];

export function App() {
  const { dados, erro, carregando, recarregar } = useDashboard();
  if (!dados) {
    if (erro && !carregando) return <FalhaInicial erro={erro} recarregar={recarregar} />;
    return <Esqueleto />;
  }
  return <Painel dados={dados} erro={erro} recarregar={recarregar} />;
}

/** Primeira carga: o contorno do quadro já no lugar, sem piscar nem girar. */
function Esqueleto() {
  return (
    <div className="app app--cheia" aria-busy="true">
      <header className="topo">
        <div className="topo__linha">
          <p className="marca"><span className="marca__qa">QA</span> SETEC</p>
        </div>
      </header>
      <main className="tela">
        <p className="sr" role="status">Carregando os dados do painel…</p>
        <div className="esqueleto" aria-hidden="true">
          <div className="esqueleto__kpis" />
          <div className="esqueleto__baia" />
          <div className="esqueleto__baia" />
          <div className="esqueleto__baia" />
        </div>
      </main>
    </div>
  );
}

/** Nenhum dado chegou: diz o que houve e oferece tentar de novo. */
function FalhaInicial({ erro, recarregar }: { erro: string; recarregar: () => void }) {
  return (
    <main className="tela-inicial">
      <div className="falha" role="alert">
        <h1 className="falha__titulo">Não foi possível carregar o painel</h1>
        <p>{erro}</p>
        <button className="botao" onClick={recarregar}>Tentar de novo</button>
      </div>
    </main>
  );
}

/** Relógio do painel: "há X min" e o aviso de coleta parada andam sozinhos. */
function useRelogio(ms = 30 * 1000): Date {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return agora;
}

function Painel({ dados, erro, recarregar }: { dados: Dashboard; erro: string | null; recarregar: () => void }) {
  const [rota, irPara] = useRota();
  const agora = useRelogio();
  const principal = useRef<HTMLElement>(null);

  // --- Modo TV ------------------------------------------------------------
  const sequencia = useMemo(() => sequenciaAtracao((f) => filaFiltrada(dados, f).length), [dados]);
  const [quadro, setQuadro] = useState(0);
  useEffect(() => {
    if (!rota.tv) return;
    const id = window.setInterval(() => setQuadro((q) => (q + 1) % sequencia.length), SEGUNDOS_POR_QUADRO * 1000);
    return () => window.clearInterval(id);
  }, [rota.tv, sequencia.length]);

  // Teclado: 1 a 5 trocam de tela; "#" ou "/" vai direto para a busca de card.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Na apresentação as teclas são da lâmina: um "2" sem querer numa conversa
      // individual não pode projetar a tela Equipe com os colegas.
      if (rota.tela === "reuniao" && rota.slide) return;
      const alvo = e.target as HTMLElement | null;
      if (alvo && (alvo.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(alvo.tagName))) return;
      const i = ["1", "2", "3", "4", "5"].indexOf(e.key);
      if (i >= 0) {
        e.preventDefault();
        irPara({ ...rota, tela: TELAS[i], tv: false });
      } else if (e.key === "#" || e.key === "/") {
        e.preventDefault();
        irPara({ ...rota, tela: "card", tv: false });
        window.setTimeout(() => document.getElementById("campo-card")?.focus(), 0);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [rota, irPara]);

  const atual = rota.tv ? sequencia[quadro % sequencia.length] : null;
  const tela: Tela = atual ? atual.tela : rota.tela;
  const filtro: Filtro = atual ? atual.filtro : rota.filtro;
  const periodo = rota.periodo ?? periodoPadrao(new Date());
  const ir = (r: Partial<Rota>) => irPara({ ...rota, ...r });

  const mudarFiltro = (f: Filtro) => ir({ filtro: f });
  const abrirCard = (card?: number) => irPara({ tela: "card", filtro: {}, card });
  // Links de verdade: cada visão abre em nova aba (Ctrl+clique) e cabe num link.
  const hrefCard = (card: number) => escreverRota({ tela: "card", filtro: {}, card });
  const hrefPessoa = (pessoa: number) => escreverRota({ ...rota, tela: "pessoa", pessoa, tv: false });
  const hrefTela = (t: Tela) =>
    escreverRota({ ...rota, tela: t, tv: false, pessoa: undefined, card: t === "card" ? rota.card : undefined });

  // Título da aba: a tela e, se a coleta parou, há quanto tempo.
  const estado = estadoAtualizacao(dados, agora);
  useEffect(() => {
    const atraso = estado.atrasado && estado.minutos !== null ? `Coleta parada ${haQuanto(estado.minutos)} · ` : "";
    document.title = `${atraso}${NOMES[tela]} · QA SETEC`;
  }, [tela, estado.atrasado, estado.minutos]);

  // Troca de tela leva o foco ao conteúdo: o leitor de tela anuncia a tela nova.
  const primeira = useRef(true);
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    // Tela nova começa do topo (a rolagem da anterior não vem junto).
    window.scrollTo(0, 0);
    if (!rota.tv) principal.current?.focus({ preventScroll: true });
  }, [tela, rota.pessoa, rota.card, rota.tv]);
  const projetos = dados.projetos
    .filter((p) => !filtro.prefixo || p.prefixo === filtro.prefixo)
    .sort((a, b) => nomeCurto(a.nome).localeCompare(nomeCurto(b.nome)));
  const usaPeriodo = tela === "equipe" || tela === "pessoa";
  const usaFiltro = tela !== "card" && tela !== "reuniao";
  const meses = mesesDisponiveis(dados.equipe?.desde ?? dados.regras.qa_confiavel_desde, new Date());

  // Apresentação da reunião: a tela inteira é da lâmina, sem barra nem filtros.
  if (tela === "reuniao" && rota.slide) {
    return <Reuniao dados={dados} rota={rota} ir={ir} aviso={<AvisoColeta dados={dados} agora={agora} />} />;
  }

  return (
    <div className={`app${rota.tv ? " app--tv" : ""}${tela === "agora" ? " app--cheia" : ""}`}>
      <button className="pular" onClick={() => principal.current?.focus()}>Pular para o conteúdo</button>
      <header className="topo">
        <div className="topo__linha">
          <p className="marca"><span className="marca__qa">QA</span> SETEC</p>
          <nav aria-label="Telas">
            <ul className="abas">
              {TELAS.map((t, i) => (
                <li key={t}>
                  <a
                    className="aba"
                    href={hrefTela(t)}
                    aria-current={tela === t || (t === "equipe" && tela === "pessoa") ? "page" : undefined}
                    aria-keyshortcuts={String(i + 1)}
                  >
                    <kbd className="tecla" aria-hidden="true">{i + 1}</kbd>
                    {NOMES[t]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <SeloColeta dados={dados} erro={erro} agora={agora} recarregar={recarregar} />
        </div>

        {usaFiltro && (
          <div className="filtros" role="group" aria-label="Filtros">
            <div className="segmentado" role="radiogroup" aria-label="Frente">
              {[undefined, ...PREFIXOS].map((p) => {
                const ativo = filtro.prefixo === p && filtro.projeto === undefined;
                return (
                  <button
                    key={p ?? "todos"}
                    role="radio"
                    aria-checked={ativo}
                    className="segmentado__opcao"
                    onClick={() => mudarFiltro(p ? { prefixo: p } : {})}
                    disabled={rota.tv}
                  >
                    {p ?? "Todas"}
                  </button>
                );
              })}
            </div>
            <label className="sr" htmlFor="projeto">Projeto</label>
            <select
              id="projeto"
              className="campo"
              value={filtro.projeto ?? ""}
              disabled={rota.tv}
              onChange={(e) =>
                mudarFiltro({
                  ...(filtro.prefixo ? { prefixo: filtro.prefixo } : {}),
                  ...(e.target.value ? { projeto: Number(e.target.value) } : {}),
                })
              }
            >
              <option value="">Todos os projetos{filtro.prefixo ? ` ${filtro.prefixo}` : ""}</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>{nomeCurto(p.nome)}</option>
              ))}
            </select>

            {usaPeriodo && (
              <>
                <label className="sr" htmlFor="periodo">Período</label>
                <select
                  id="periodo"
                  className="campo"
                  value={escreverPeriodo(periodo)}
                  onChange={(e) => ir({ periodo: lerPeriodo(e.target.value) })}
                >
                  <option value="7d">Últimos 7 dias</option>
                  {meses.map((m) => (
                    <option key={m} value={m}>{rotuloPeriodo({ tipo: "mes", mes: m })}</option>
                  ))}
                </select>
              </>
            )}

            <button
              className="botao botao--leve filtros__tv"
              aria-pressed={!!rota.tv}
              onClick={() => ir({ tv: !rota.tv })}
              title="Modo TV: percorre as telas sozinho"
            >
              <Icone nome="tv" tamanho={14} /> {rota.tv ? "Sair do modo TV" : "Modo TV"}
            </button>
          </div>
        )}
      </header>

      <AvisoColeta dados={dados} agora={agora} />

      <main className="tela" key={`${tela}|${rota.pessoa ?? ""}|${rota.card ?? ""}`} ref={principal} tabIndex={-1}>
        {tela !== "pessoa" && <h1 className="sr">{NOMES[tela]}</h1>}
        {tela === "agora" && (
          <Agora
            dados={dados}
            filtro={filtro}
            agora={agora}
            hrefCard={hrefCard}
            hrefPessoa={hrefPessoa}
            soForaDoPainel={!rota.tv && !!rota.fora}
            alternarForaDoPainel={rota.tv ? undefined : () => ir({ fora: !rota.fora })}
          />
        )}
        {tela === "equipe" && (
          <Equipe
            dados={dados}
            filtro={filtro}
            periodo={periodo}
            inativos={!!rota.inativos}
            periodoAutomatico={!rota.periodo && inicioDeMes(agora)}
            alternarInativos={() => ir({ inativos: !rota.inativos })}
            hrefPessoa={hrefPessoa}
          />
        )}
        {tela === "pessoa" && (
          <Pessoa
            dados={dados}
            filtro={filtro}
            periodo={periodo}
            uid={rota.pessoa}
            hrefCard={hrefCard}
            hrefVoltar={escreverRota({ ...rota, tela: "equipe", pessoa: undefined })}
          />
        )}
        {tela === "mensal" && <Mensal dados={dados} filtro={filtro} />}
        {tela === "card" && <Card dados={dados} card={rota.card} abrir={abrirCard} />}
        {tela === "reuniao" && <Reuniao dados={dados} rota={rota} ir={ir} aviso={null} />}
      </main>

      {rota.tv && atual && (
        <footer className="rodape-tv" aria-live="off">
          Modo TV · {NOMES[atual.tela]}
          {atual.filtro.prefixo ? ` · ${atual.filtro.prefixo}` : ""} · {(quadro % sequencia.length) + 1}/{sequencia.length}
        </footer>
      )}
    </div>
  );
}
