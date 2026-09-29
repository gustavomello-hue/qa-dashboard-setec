import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "./data/carregar";
import { TELAS, useRota, type Tela } from "./data/rota";
import type { Dashboard, Prefixo } from "./data/contrato";
import type { Filtro } from "./data/seletores";
import { SEGUNDOS_POR_QUADRO, sequenciaAtracao } from "./data/atracao";
import { nomeCurto } from "./data/formato";
import { Placar } from "./componentes/Placar";
import { SeloColeta } from "./componentes/Sinal";
import { POR_PAGINA_TV, filaFiltrada } from "./componentes/Fila";
import { Icone } from "./componentes/Icone";
import { Hoje } from "./telas/Hoje";
import { Mensal } from "./telas/Mensal";
import { Card } from "./telas/Card";

const NOMES: Record<Tela, string> = { hoje: "HOJE", mensal: "MENSAL", card: "CARD" };
const PREFIXOS: Prefixo[] = ["DEV", "WEB", "MOB", "Demandas"];

function lerCrt(): boolean {
  try {
    return localStorage.getItem("qa-crt") !== "off";
  } catch {
    return true;
  }
}

export function App() {
  const { dados, erro, carregando } = useDashboard();
  const [crt, setCrt] = useState(lerCrt);

  useEffect(() => {
    try {
      localStorage.setItem("qa-crt", crt ? "on" : "off");
    } catch {
      /* navegador sem armazenamento: vale só nesta sessão */
    }
  }, [crt]);

  if (!dados) {
    return (
      <div className={`tela-inicial${crt ? " crt" : ""}`}>
        <p className="hud brilha tela-inicial__texto" role="status">
          {erro ? "SEM SINAL" : carregando ? "CARREGANDO…" : "SEM DADOS"}
        </p>
        {erro && <p className="tela-inicial__erro">{erro}</p>}
      </div>
    );
  }
  return <Painel dados={dados} erro={erro} crt={crt} alternarCrt={() => setCrt((c) => !c)} />;
}

interface PainelProps {
  dados: Dashboard;
  erro: string | null;
  crt: boolean;
  alternarCrt: () => void;
}

function Painel({ dados, erro, crt, alternarCrt }: PainelProps) {
  const [rota, irPara] = useRota();
  const [pagina, setPagina] = useState(0);

  // --- Modo atração -------------------------------------------------------
  const sequencia = useMemo(
    () => sequenciaAtracao((f) => Math.ceil(filaFiltrada(dados, f).length / POR_PAGINA_TV)),
    [dados],
  );
  const [quadro, setQuadro] = useState(0);
  useEffect(() => {
    if (!rota.tv) return;
    const id = window.setInterval(() => setQuadro((q) => (q + 1) % sequencia.length), SEGUNDOS_POR_QUADRO * 1000);
    return () => window.clearInterval(id);
  }, [rota.tv, sequencia.length]);

  const atual = rota.tv ? sequencia[quadro % sequencia.length] : null;
  const tela: Tela = atual ? atual.tela : rota.tela;
  const filtro: Filtro = atual ? atual.filtro : rota.filtro;
  const paginaVisivel = atual ? atual.pagina : pagina;

  useEffect(() => setPagina(0), [rota.filtro.prefixo, rota.filtro.projeto]);

  const mudarFiltro = (f: Filtro) => irPara({ ...rota, filtro: f });
  const abrirCard = (card?: number) => irPara({ tela: "card", filtro: {}, card });
  const projetos = dados.projetos
    .filter((p) => !filtro.prefixo || p.prefixo === filtro.prefixo)
    .sort((a, b) => nomeCurto(a.nome).localeCompare(nomeCurto(b.nome)));

  const chaveTela = `${tela}|${filtro.prefixo ?? ""}|${filtro.projeto ?? ""}|${paginaVisivel}|${rota.card ?? ""}|${rota.fora ? "fora" : ""}`;

  return (
    <div className={`app${crt ? " crt" : ""}${rota.tv ? " app--tv" : ""}`}>
      <header className="topo">
        <div className="topo__linha">
          <p className="marca hud brilha">
            QA<span className="marca__ponto">·</span>SETEC
          </p>
          <SeloColeta dados={dados} erro={erro} />
        </div>
        <Placar dados={dados} filtro={filtro} />
        <nav className="fases" aria-label="Telas">
          <ul className="fases__lista hud">
            {TELAS.map((t) => (
              <li key={t}>
                <button
                  className="fase"
                  aria-current={tela === t ? "page" : undefined}
                  onClick={() => irPara({ ...rota, tela: t, tv: false })}
                >
                  <span className="fase__cursor"><Icone nome="cursor" tamanho={12} /></span>
                  {NOMES[t]}
                </button>
              </li>
            ))}
          </ul>

          {tela !== "card" && (
            <div className="jogador" role="group" aria-label="Filtro">
              <div className="jogador__prefixos hud" role="radiogroup" aria-label="Prefixo">
                {[undefined, ...PREFIXOS].map((p, i) => {
                  const ativo = filtro.prefixo === p && filtro.projeto === undefined;
                  return (
                    <button
                      key={p ?? "todos"}
                      role="radio"
                      aria-checked={ativo}
                      className="jogador__botao"
                      onClick={() => mudarFiltro(p ? { prefixo: p } : {})}
                      disabled={rota.tv}
                    >
                      {i > 0 && <span className="jogador__num">{i}P</span>}
                      {p ? p.toUpperCase() : "TODOS"}
                    </button>
                  );
                })}
              </div>
              <label className="sr" htmlFor="projeto">Projeto</label>
              <select
                id="projeto"
                className="jogador__projeto"
                value={filtro.projeto ?? ""}
                disabled={rota.tv}
                onChange={(e) =>
                  mudarFiltro({ ...(filtro.prefixo ? { prefixo: filtro.prefixo } : {}), ...(e.target.value ? { projeto: Number(e.target.value) } : {}) })
                }
              >
                <option value="">Todos os projetos{filtro.prefixo ? ` ${filtro.prefixo}` : ""}</option>
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>{nomeCurto(p.nome)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="controles hud">
            <button className="controle controle--mesa" aria-pressed={crt} onClick={alternarCrt} title="Linhas de varredura e brilho">
              CRT {crt ? "ON" : "OFF"}
            </button>
            <button
              className="controle"
              aria-pressed={!!rota.tv}
              onClick={() => irPara({ ...rota, tv: !rota.tv })}
              title="Modo atração: percorre as telas sozinho (para a TV da sala)"
            >
              <Icone nome="tv" tamanho={12} /> {rota.tv ? "SAIR DA TV" : "MODO TV"}
            </button>
          </div>
        </nav>
      </header>

      <main className="tela" key={chaveTela}>
        {tela === "hoje" && (
          <Hoje
            dados={dados}
            filtro={filtro}
            pagina={paginaVisivel}
            porPagina={rota.tv ? POR_PAGINA_TV : undefined}
            mudarPagina={rota.tv ? undefined : setPagina}
            abrirCard={abrirCard}
            soForaDoPainel={!rota.tv && !!rota.fora}
            alternarForaDoPainel={rota.tv ? undefined : () => { setPagina(0); irPara({ ...rota, fora: !rota.fora }); }}
          />
        )}
        {tela === "mensal" && <Mensal dados={dados} filtro={filtro} />}
        {tela === "card" && <Card dados={dados} card={rota.card} abrir={abrirCard} />}
      </main>

      {rota.tv && atual && (
        <footer className="atracao hud" aria-live="off">
          <span>
            MODO ATRAÇÃO · {NOMES[atual.tela]}
            {atual.filtro.prefixo ? ` · ${atual.filtro.prefixo.toUpperCase()}` : ""}
            {atual.tela === "hoje" ? ` · PÁG ${atual.pagina + 1}` : ""}
          </span>
          <span className="atracao__tempo" key={quadro} style={{ animationDuration: `${SEGUNDOS_POR_QUADRO}s` }} />
          <span>{(quadro % sequencia.length) + 1}/{sequencia.length}</span>
        </footer>
      )}
    </div>
  );
}
