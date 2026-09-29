import type { Dashboard, Evento } from "../data/contrato";
import { NOME_EVENTO, dataHora, nomeCurto, placar } from "../data/formato";
import { historicoDoCard } from "../data/seletores";
import { Icone } from "../componentes/Icone";

const COR_EVENTO: Partial<Record<Evento["evento"], string>> = {
  entrou_qa: "var(--ciano)",
  qa_para_concluida: "var(--verde)",
  qa_para_correcao: "var(--vermelho)",
  movimentacao_perdida: "var(--aco)",
};

export function Card({ dados, card, abrir }: { dados: Dashboard; card?: number; abrir: (id?: number) => void }) {
  const historico = card ? historicoDoCard(dados, card) : [];
  const metricas = card ? dados.cards.find((c) => c.task_id === card) : undefined;
  const naFila = card ? dados.fila_qa.find((c) => c.task_id === card) : undefined;
  const titulo = metricas?.titulo || naFila?.titulo || historico.findLast((e) => e.titulo)?.titulo;
  const link = metricas?.link || naFila?.link || historico.findLast((e) => e.link)?.link;

  return (
    <div className="card-tela">
      <form
        className="moldura painel busca"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const id = Number(new FormData(e.currentTarget).get("card"));
          abrir(Number.isInteger(id) && id > 0 ? id : undefined);
        }}
      >
        <label className="hud busca__rotulo" htmlFor="campo-card">CARD #</label>
        <input
          id="campo-card"
          name="card"
          className="busca__campo num"
          inputMode="numeric"
          autoComplete="off"
          placeholder="11635"
          defaultValue={card ?? ""}
          key={card ?? "vazio"}
        />
        <button type="submit" className="botao hud">
          <Icone nome="busca" /> BUSCAR
        </button>
      </form>

      {card === undefined ? (
        <p className="painel__vazio hud">DIGITE O NÚMERO DE UM CARD PARA VER A LINHA DO TEMPO</p>
      ) : historico.length === 0 && !metricas ? (
        <p className="painel__vazio hud">NENHUMA MOVIMENTAÇÃO REGISTRADA PARA #{card}</p>
      ) : (
        <section className="moldura painel" aria-labelledby="t-card">
          <header className="card-tela__cabeca">
            <h2 id="t-card" className="card-tela__titulo">
              <span className="num" style={{ color: "var(--ciano)" }}>#{card}</span> {titulo}
            </h2>
            {link && (
              <a className="hud link-externo" href={link} target="_blank" rel="noreferrer">
                ABRIR NO KANBOARD <Icone nome="externo" />
              </a>
            )}
          </header>
          {metricas && (
            <dl className="ficha">
              <div><dt className="hud">ENTRADAS EM QA</dt><dd className="num" style={{ color: "var(--ciano)" }}>{placar(metricas.entradas_qa, 2)}</dd></div>
              <div><dt className="hud">RETORNOS P/ CORREÇÃO</dt><dd className="num" style={{ color: "var(--vermelho)" }}>{placar(metricas.retornos, 2)}</dd></div>
              <div><dt className="hud">TEMPO TOTAL EM QA</dt><dd className="num">{metricas.horas_qa === null ? "—" : `${metricas.horas_qa.toLocaleString("pt-BR")} H`}</dd></div>
              <div><dt className="hud">PROJETO</dt><dd>{nomeCurto(metricas.projeto)}</dd></div>
              <div><dt className="hud">CRIADOR</dt><dd>{metricas.criador || "—"}</dd></div>
              <div><dt className="hud">CONCLUÍDO POR</dt><dd>{metricas.concluido_por || "—"}</dd></div>
            </dl>
          )}
          <ol className="linha-tempo">
            {historico.map((e, i) => (
              <li key={i} className="linha-tempo__item">
                <span className="hud linha-tempo__quando">{dataHora(e.momento)}</span>
                <span className="linha-tempo__marca" style={{ color: COR_EVENTO[e.evento] ?? "var(--texto-3)" }} aria-hidden="true" />
                <span className="linha-tempo__corpo">
                  <span className="hud" style={{ color: COR_EVENTO[e.evento] ?? "var(--texto-2)" }}>
                    {NOME_EVENTO[e.evento] ?? e.evento.toUpperCase()}
                  </span>
                  <span className="linha-tempo__de-para">
                    {e.de_coluna ?? "?"} <Icone nome="seta" tamanho={10} /> {e.para_coluna ?? "?"}
                    {e.movido_por && <span className="linha-tempo__quem"> · por {e.movido_por}</span>}
                    {e.origem === "atividade" && <span className="linha-tempo__quem"> · amostra do Kanboard</span>}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
