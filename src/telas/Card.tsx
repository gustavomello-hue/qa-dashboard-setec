import { useLayoutEffect, useRef, useState } from "react";
import type { Dashboard, DetalheCard, Evento } from "../data/contrato";
import { NOME_EVENTO, TEXTO_SEM_TITULO, dataCurta, dataHora, duracao, nomeCurto, numero, tituloConhecido } from "../data/formato";
import { historicoDoCard, permanencias } from "../data/seletores";
import { indicePessoas, nomeDe } from "../data/pessoas";
import { descricaoHtml } from "../data/markdown";
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
  const detalhe = card ? dados.detalhes_cards?.[String(card)] : undefined;
  const titulo =
    tituloConhecido(metricas?.titulo) || tituloConhecido(naFila?.titulo) || tituloConhecido(historico.findLast((e) => e.titulo)?.titulo) || tituloConhecido(detalhe?.titulo) || TEXTO_SEM_TITULO;
  const link = metricas?.link || naFila?.link || historico.findLast((e) => e.link)?.link || detalhe?.link || undefined;
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
      ) : historico.length === 0 && !metricas && !detalhe ? (
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
          <div className={`card-corpo${metricas || detalhe ? " card-corpo--com-ficha" : ""}`}>
          {(metricas || detalhe) && (
            <dl className="ficha">
              {detalhe && <CamposKanboard detalhe={detalhe} responsavel={nomeDe(indicePessoas(dados), detalhe.responsavel_id)} />}
              {metricas && (
                <>
              <div><dt>Entradas em QA</dt><dd className="num">{numero(metricas.entradas_qa)}</dd></div>
              <div><dt title={DEFINICAO.retornos}>Retornos para correção</dt><dd className="num">{numero(metricas.retornos)}</dd></div>
              <div>
                <dt>Tempo total em QA</dt>
                <dd className="num">{metricas.horas_qa === null ? "—" : duracao(metricas.horas_qa * 3600)}</dd>
              </div>
              <div><dt>Projeto</dt><dd>{nomeCurto(metricas.projeto)}</dd></div>
              <div><dt>Criador</dt><dd>{nome(metricas.criador) || "—"}</dd></div>
              <div><dt>Concluído por</dt><dd>{metricas.concluido_em ? nome(metricas.concluido_por) || "—" : "ainda aberto"}</dd></div>
                </>
              )}
              {naFila && naFila.no_painel !== undefined && naFila.no_painel !== null && (
                <div>
                  <dt>Painel do Kanboard</dt>
                  <dd>{naFila.no_painel ? "Aparece no painel" : <span className="marca-fora">fora do painel</span>}</dd>
                </div>
              )}
            </dl>
          )}
          <div className="card-principal">
          <section className="card-secao" aria-labelledby="t-linha-tempo">
          <h3 id="t-linha-tempo" className="card-secao__titulo">Linha do tempo</h3>
          {historico.length === 0 ? (
            <p className="nota card-secao__nota">Nenhuma movimentação registrada desde ago/26.</p>
          ) : (
          <ol className="linha-tempo">
            {historico.map((e, i) => (
              <li key={i} className={`linha-tempo__item faixa--${TOM_EVENTO[e.evento] ?? "neutro"}`}>
                <span className="linha-tempo__quando num">{dataHora(e.momento)}</span>
                <span className={`etiqueta etiqueta--${TOM_EVENTO[e.evento] ?? "neutro"}`}>
                  {NOME_EVENTO[e.evento] ?? e.evento}
                </span>
                <span className="linha-tempo__de-para">
                  {/* Entrada derivada de card criado direto em Teste/QA: não veio de coluna nenhuma, nasceu ali. */}
                  {e.de_coluna ?? (e.evento === "entrou_qa" ? "criado" : "?")} <Icone nome="seta" tamanho={12} /> {e.para_coluna ?? "?"}
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
          )}
          </section>
          {/* A descrição vem depois: a linha do tempo é o que o Kanboard não guarda. */}
          <Descricao detalhe={detalhe} link={link} />
          </div>
          </div>
        </section>
      )}
    </div>
  );
}

/** Nomes das cores do Kanboard: só escritas, nunca pintadas (a cor do quadro é só estado). */
const COR_KANBOARD: Record<string, string> = {
  yellow: "amarelo", blue: "azul", green: "verde", purple: "roxo", red: "vermelho", orange: "laranja",
  grey: "cinza", brown: "marrom", deep_orange: "laranja escuro", dark_grey: "cinza escuro", pink: "rosa",
  teal: "verde-azulado", cyan: "ciano", lime: "lima", light_green: "verde claro", amber: "âmbar",
};

function CamposKanboard({ detalhe, responsavel }: { detalhe: DetalheCard; responsavel: string }) {
  return (
    <>
      <div>
        <dt>Coluna atual</dt>
        <dd>
          {detalhe.coluna}
          {!detalhe.aberto && <span className="marca-fora ficha__marca">fechado no Kanboard</span>}
        </dd>
      </div>
      <div><dt>Responsável</dt><dd>{responsavel}</dd></div>
      {detalhe.prioridade > 0 && <div><dt>Prioridade</dt><dd className="num">{detalhe.prioridade}</dd></div>}
      {detalhe.criado_em && <div><dt>Criado em</dt><dd className="num">{dataCurta(detalhe.criado_em)}</dd></div>}
      {detalhe.inicio && <div><dt>Início</dt><dd className="num">{dataCurta(detalhe.inicio)}</dd></div>}
      {detalhe.prazo && <div><dt>Prazo</dt><dd className="num">{dataCurta(detalhe.prazo)}</dd></div>}
      {detalhe.tempo_estimado && <div><dt>Tempo estimado</dt><dd className="num">{numero(detalhe.tempo_estimado)} h</dd></div>}
      {detalhe.tempo_gasto && <div><dt>Tempo gasto</dt><dd className="num">{numero(detalhe.tempo_gasto)} h</dd></div>}
      {detalhe.categoria && <div><dt>Categoria</dt><dd>{detalhe.categoria}</dd></div>}
      {detalhe.cor && <div><dt>Cor no Kanboard</dt><dd>{COR_KANBOARD[detalhe.cor] ?? detalhe.cor}</dd></div>}
      {detalhe.referencia && <div><dt>Referência</dt><dd>{detalhe.referencia}</dd></div>}
    </>
  );
}

function Descricao({ detalhe, link }: { detalhe?: DetalheCard; link?: string }) {
  return (
    <section className="card-secao descricao" aria-labelledby="t-descricao">
      <h3 id="t-descricao" className="card-secao__titulo">Descrição</h3>
      {!detalhe ? (
        <p className="nota card-secao__nota">
          Descrição não coletada
          {link ? (
            <>
              {" "}— veja no{" "}
              <a className="link-externo" href={link} target="_blank" rel="noreferrer">Kanboard</a>.
            </>
          ) : "."}
        </p>
      ) : detalhe.descricao ? (
        <div className="descricao__corpo">
          {/* HTML de descricaoHtml: Markdown sem imagens, HTML cru escapado, links só http/https/mailto (markdown.test.ts). */}
          <TextoRecolhivel html={descricaoHtml(detalhe.descricao)} />
          {detalhe.descricao_cortada && (
            <p className="nota descricao__corte">
              … continua
              {link ? (
                <>
                  {" "}no{" "}
                  <a className="link-externo" href={link} target="_blank" rel="noreferrer">Kanboard</a>.
                </>
              ) : " no Kanboard."}
            </p>
          )}
        </div>
      ) : (
        <p className="nota card-secao__nota">Sem descrição no Kanboard.</p>
      )}
    </section>
  );
}

/** Descrição em ~8 linhas; o botão só aparece quando o texto passa disso. */
function TextoRecolhivel({ html }: { html: string }) {
  const texto = useRef<HTMLDivElement>(null);
  const [aberto, setAberto] = useState(false);
  const [longo, setLongo] = useState(false);
  useLayoutEffect(() => {
    const el = texto.current;
    if (el && !aberto) setLongo(el.scrollHeight > el.clientHeight + 4);
  }, [html, aberto]);
  return (
    <>
      <div
        id="descricao-texto"
        ref={texto}
        className={`descricao__texto${aberto ? "" : " descricao__texto--recolhida"}`}
        // HTML de descricaoHtml: Markdown sem imagens, HTML cru escapado, links só http/https/mailto (markdown.test.ts).
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {(longo || aberto) && (
        <button type="button" className="descricao__alternar" aria-expanded={aberto} aria-controls="descricao-texto" onClick={() => setAberto(!aberto)}>
          <Icone nome={aberto ? "cima" : "baixo"} tamanho={14} /> {aberto ? "Recolher a descrição" : "Mostrar a descrição inteira"}
        </button>
      )}
    </>
  );
}
