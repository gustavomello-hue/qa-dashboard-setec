import type { Dashboard, Evento } from "../data/contrato";
import { NOME_EVENTO, dataHora, duracao, nomeCurto, numero } from "../data/formato";
import { historicoDoCard, permanencias } from "../data/seletores";
import { indicePessoas } from "../data/pessoas";
import { DEFINICAO } from "../data/glossario";
import { Icone } from "../componentes/Icone";
import type { Tom } from "../componentes/Kpi";

const TOM_EVENTO: Partial<Record<Evento["evento"], Tom>> = {
  entrou_qa: "entrada",
  qa_para_concluida: "aprovado",
  qa_para_correcao: "reprovado",
  qa_para_outra: "devolvido",
  concluida: "sem-qa",
};

export function Card({ dados, card, abrir }: { dados: Dashboard; card?: number; abrir: (id?: number) => void }) {
  const historico = card ? historicoDoCard(dados, card) : [];
  const metricas = card ? dados.cards.find((c) => c.task_id === card) : undefined;
  const naFila = card ? dados.fila_qa.find((c) => c.task_id === card) : undefined;
  const titulo = metricas?.titulo || naFila?.titulo || historico.findLast((e) => e.titulo)?.titulo;
  const link = metricas?.link || naFila?.link || historico.findLast((e) => e.link)?.link;
  // Quanto tempo o card ficou em cada coluna: o que o Kanboard não guarda.
  const estadias = permanencias(historico, dados.coleta.momento);
  // O histórico traz o nome completo do Kanboard; a tela usa o nome curto da equipe.
  const curto = new Map([...indicePessoas(dados).values()].map((p) => [p.nome_kanboard, p.nome]));
  const nome = (n: string | null | undefined) => (n ? curto.get(n) ?? n : "");

  return (
    <div className="card-tela">
      <form
        className="busca"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const id = Number(new FormData(e.currentTarget).get("card"));
          abrir(Number.isInteger(id) && id > 0 ? id : undefined);
        }}
      >
        <label className="busca__rotulo" htmlFor="campo-card">Card #</label>
        <span className="busca__atalho" aria-hidden="true">atalho <kbd className="tecla">/</kbd></span>
        <input
          id="campo-card"
          name="card"
          className="campo num"
          inputMode="numeric"
          autoComplete="off"
          placeholder="11635"
          defaultValue={card ?? ""}
          key={card ?? "vazio"}
        />
        <button type="submit" className="botao">
          <Icone nome="busca" /> Buscar
        </button>
      </form>

      {card === undefined ? (
        <p className="vazio">Digite o número de um card para ver a linha do tempo.</p>
      ) : historico.length === 0 && !metricas ? (
        <p className="vazio">Nenhuma movimentação registrada para #{card}.</p>
      ) : (
        <section className="bloco" aria-labelledby="t-card">
          <header className="bloco__cabeca">
            <h2 id="t-card" className="card-tela__titulo">
              <span className="num">#{card}</span> {titulo}
            </h2>
            {link && (
              <a className="link-externo" href={link} target="_blank" rel="noreferrer">
                Abrir no Kanboard <Icone nome="externo" tamanho={14} />
              </a>
            )}
          </header>
          {/* Em tela larga a ficha vira painel lateral e a linha do tempo ganha a largura toda. */}
          <div className={`card-corpo${metricas ? " card-corpo--com-ficha" : ""}`}>
          {metricas && (
            <dl className="ficha">
              <div><dt>Entradas em QA</dt><dd className="num">{numero(metricas.entradas_qa)}</dd></div>
              <div><dt title={DEFINICAO.retornos}>Retornos para correção</dt><dd className="num">{numero(metricas.retornos)}</dd></div>
              <div>
                <dt>Tempo total em QA</dt>
                <dd className="num">{metricas.horas_qa === null ? "—" : duracao(metricas.horas_qa * 3600)}</dd>
              </div>
              <div><dt>Projeto</dt><dd>{nomeCurto(metricas.projeto)}</dd></div>
              <div><dt>Criador</dt><dd>{nome(metricas.criador) || "—"}</dd></div>
              <div><dt>Concluído por</dt><dd>{metricas.concluido_em ? nome(metricas.concluido_por) || "—" : "ainda aberto"}</dd></div>
              {naFila && naFila.no_painel !== undefined && naFila.no_painel !== null && (
                <div>
                  <dt>Painel do Kanboard</dt>
                  <dd>{naFila.no_painel ? "Aparece no painel" : <span className="marca-fora">fora do painel</span>}</dd>
                </div>
              )}
            </dl>
          )}
          <ol className="linha-tempo">
            {historico.map((e, i) => (
              <li key={i} className={`linha-tempo__item faixa--${TOM_EVENTO[e.evento] ?? "neutro"}`}>
                <span className="linha-tempo__quando num">{dataHora(e.momento)}</span>
                <span className={`etiqueta etiqueta--${TOM_EVENTO[e.evento] ?? "neutro"}`}>
                  {NOME_EVENTO[e.evento] ?? e.evento}
                </span>
                <span className="linha-tempo__de-para">
                  {e.de_coluna ?? "?"} <Icone nome="seta" tamanho={12} /> {e.para_coluna ?? "?"}
                  {e.movido_por && <span className="meta"> · por {nome(e.movido_por)}</span>}
                  {e.origem === "atividade" && <span className="meta"> · amostra do Kanboard</span>}
                </span>
                <span className={`linha-tempo__estadia${estadias[i]?.emQa ? " linha-tempo__estadia--qa" : ""}`}>
                  {estadias[i] &&
                    (estadias[i]!.atual
                      ? `há ${duracao(estadias[i]!.segundos)} em ${estadias[i]!.coluna}`
                      : `${duracao(estadias[i]!.segundos)} em ${estadias[i]!.coluna}`)}
                </span>
              </li>
            ))}
          </ol>
          </div>
        </section>
      )}
    </div>
  );
}
