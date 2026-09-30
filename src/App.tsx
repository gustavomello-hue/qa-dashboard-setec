import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "./data/carregar";
import { TELAS, useRota, type Rota, type Tela } from "./data/rota";
import type { Dashboard, Prefixo } from "./data/contrato";
import type { Filtro } from "./data/seletores";
import { mesesDisponiveis, periodoPadrao, escreverPeriodo, lerPeriodo, rotuloPeriodo } from "./data/periodo";
import { SEGUNDOS_POR_QUADRO, sequenciaAtracao } from "./data/atracao";
import { nomeCurto } from "./data/formato";
import { SeloColeta } from "./componentes/Sinal";
import { filaFiltrada } from "./componentes/Fila";
import { Icone } from "./componentes/Icone";
import { Agora } from "./telas/Agora";
import { Equipe } from "./telas/Equipe";
import { Pessoa } from "./telas/Pessoa";
import { Mensal } from "./telas/Mensal";
import { Card } from "./telas/Card";

const NOMES: Record<Tela, string> = { agora: "Agora", equipe: "Equipe", pessoa: "Pessoa", mensal: "Mensal", card: "Card" };
const PREFIXOS: Prefixo[] = ["DEV", "WEB", "MOB", "Demandas"];

export function App() {
  const { dados, erro, carregando } = useDashboard();
  if (!dados) {
    return (
      <div className="tela-inicial" role="status">
        <p>{erro ? "Não foi possível carregar os dados." : carregando ? "Carregando…" : "Sem dados."}</p>
        {erro && <p className="nota">{erro}</p>}
      </div>
    );
  }
  return <Painel dados={dados} erro={erro} />;
}

function Painel({ dados, erro }: { dados: Dashboard; erro: string | null }) {
  const [rota, irPara] = useRota();

  // --- Modo TV ------------------------------------------------------------
  const sequencia = useMemo(() => sequenciaAtracao((f) => filaFiltrada(dados, f).length), [dados]);
  const [quadro, setQuadro] = useState(0);
  useEffect(() => {
    if (!rota.tv) return;
    const id = window.setInterval(() => setQuadro((q) => (q + 1) % sequencia.length), SEGUNDOS_POR_QUADRO * 1000);
    return () => window.clearInterval(id);
  }, [rota.tv, sequencia.length]);

  const atual = rota.tv ? sequencia[quadro % sequencia.length] : null;
  const tela: Tela = atual ? atual.tela : rota.tela;
  const filtro: Filtro = atual ? atual.filtro : rota.filtro;
  const periodo = rota.periodo ?? periodoPadrao(new Date());
  const ir = (r: Partial<Rota>) => irPara({ ...rota, ...r });

  const mudarFiltro = (f: Filtro) => ir({ filtro: f });
  const abrirCard = (card?: number) => irPara({ tela: "card", filtro: {}, card });
  const abrirPessoa = (pessoa: number) => ir({ tela: "pessoa", pessoa, tv: false });
  const projetos = dados.projetos
    .filter((p) => !filtro.prefixo || p.prefixo === filtro.prefixo)
    .sort((a, b) => nomeCurto(a.nome).localeCompare(nomeCurto(b.nome)));
  const usaPeriodo = tela === "equipe" || tela === "pessoa";
  const usaFiltro = tela !== "card";
  const meses = mesesDisponiveis(dados.equipe?.desde ?? dados.regras.qa_confiavel_desde, new Date());

  return (
    <div className={`app${rota.tv ? " app--tv" : ""}${tela === "agora" ? " app--cheia" : ""}`}>
      <header className="topo">
        <div className="topo__linha">
          <p className="marca">QA <span className="marca__sep">·</span> SETEC</p>
          <nav aria-label="Telas">
            <ul className="abas">
              {TELAS.map((t) => (
                <li key={t}>
                  <button
                    className="aba"
                    aria-current={tela === t || (t === "equipe" && tela === "pessoa") ? "page" : undefined}
                    onClick={() => ir({ tela: t, tv: false })}
                  >
                    {NOMES[t]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <SeloColeta dados={dados} erro={erro} />
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
                    {p ?? "Todos"}
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

      <main className="tela" key={`${tela}|${rota.pessoa ?? ""}|${rota.card ?? ""}`}>
        {tela === "agora" && (
          <Agora
            dados={dados}
            filtro={filtro}
            abrirCard={abrirCard}
            abrirPessoa={abrirPessoa}
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
            alternarInativos={() => ir({ inativos: !rota.inativos })}
            abrirPessoa={abrirPessoa}
          />
        )}
        {tela === "pessoa" && (
          <Pessoa
            dados={dados}
            filtro={filtro}
            periodo={periodo}
            uid={rota.pessoa}
            abrirCard={abrirCard}
            voltar={() => ir({ tela: "equipe", pessoa: undefined })}
          />
        )}
        {tela === "mensal" && <Mensal dados={dados} filtro={filtro} />}
        {tela === "card" && <Card dados={dados} card={rota.card} abrir={abrirCard} />}
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
