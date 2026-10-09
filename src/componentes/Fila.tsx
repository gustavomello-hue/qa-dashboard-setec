import { useState } from "react";
import type { CardNaFila, Dashboard } from "../data/contrato";
import { TEXTO_SEM_TITULO, dataHora, nomeCurto, responsavelLegivel, separarEtiquetas, tituloConhecido } from "../data/formato";
import { Icone } from "./Icone";
import { indiceTitulos, inicioDaUltimaColeta, passaNoFiltro, type Filtro } from "../data/seletores";
import { indicePessoas } from "../data/pessoas";
import { DEFINICAO } from "../data/glossario";

export function filaFiltrada(dados: Dashboard, filtro: Filtro, soForaDoPainel = false) {
  const passa = passaNoFiltro(dados, filtro);
  return dados.fila_qa.filter((c) => passa(c.project_id) && (!soForaDoPainel || c.no_painel === false));
}

interface Props {
  dados: Dashboard;
  filtro: Filtro;
  hrefCard: (id: number) => string;
  /** Mostra só os cards que o painel do Kanboard não exibe. */
  soForaDoPainel?: boolean;
  alternarForaDoPainel?: () => void;
}

const LIMITE_CELULAR = 10;

function principais_tamanho(dados: Dashboard, filtro: Filtro, soFora: boolean): number {
  const fila = filaFiltrada(dados, filtro, soFora);
  return soFora ? fila.length : fila.filter((c) => c.no_painel !== false).length;
}

/** A fila de QA, do card mais parado ao mais recente. Rola dentro do bloco. */
export function Fila({ dados, filtro, hrefCard, soForaDoPainel = false, alternarForaDoPainel }: Props) {
  const fila = filaFiltrada(dados, filtro, soForaDoPainel);
  const foraDoPainel = filaFiltrada(dados, filtro).filter((c) => c.no_painel === false).length;
  const desde = inicioDaUltimaColeta(dados);
  // A fila traz o nome completo do Kanboard; a tela usa o nome curto da equipe.
  const curto = new Map([...indicePessoas(dados).values()].map((p) => [p.nome_kanboard, p.nome]));
  // Cards que o painel do Kanboard não mostra (muitas vezes sem título nem responsável)
  // não ocupam o topo da fila: vão para um grupo recolhido no fim (crítica 08/10/2026).
  const [verFora, setVerFora] = useState(false);
  // No celular a fila não rola por dentro: mostra os 10 primeiros e um "ver todos".
  const [verTodos, setVerTodos] = useState(false);
  const recolhida = !verTodos && principais_tamanho(dados, filtro, soForaDoPainel) > LIMITE_CELULAR;
  // Título pelo índice: o coletor às vezes não o tem, mas os detalhes do card têm.
  const titulos = indiceTitulos(dados);
  const principais = soForaDoPainel ? fila : fila.filter((c) => c.no_painel !== false);
  const fora = soForaDoPainel ? [] : fila.filter((c) => c.no_painel === false);

  const linha = (c: CardNaFila) => {
    const novo = desde !== null && (c.entrou_em ?? 0) > desde;
    const { etiquetas, resto } = separarEtiquetas(titulos.get(c.task_id) ?? tituloConhecido(c.titulo));
    const pessoa = responsavelLegivel(curto.get(c.designado) ?? c.designado);
    return (
      <tr key={c.task_id}>
        <td className="celula-card">
          <a className="link-card" href={hrefCard(c.task_id)} title="Ver a linha do tempo do card">
            #{c.task_id}
          </a>
        </td>
        <td className="celula-titulo">
          <a href={c.link} target="_blank" rel="noreferrer" title={`${resto || TEXTO_SEM_TITULO} (abre no Kanboard)`}>
            {resto || <span className="meta">{TEXTO_SEM_TITULO}</span>}
            <span className="sr"> (abre no Kanboard, em nova aba)</span>
          </a>
          {/* Designado e "novo" vão na linha de apoio: a coluna do título fica com a largura. */}
          <span className="meta">
            {novo && <span className="marca-novo" title="Novo desde a coleta anterior">novo</span>}
            <span className="meta__pessoa" title={pessoa}>{pessoa}</span>
            {c.no_painel === false && <span className="marca-fora" title="Não aparece no painel Teste de QA do Kanboard">fora do painel</span>}
            {etiquetas && <span>{etiquetas}</span>}
            <span>{nomeCurto(c.projeto)}</span>
            {/* No celular, dias e retornos descem para cá: o título fica com a largura. */}
            {/* Mono só no número (Regra da Impressão); a palavra fica na face de leitura. */}
            <span className="so-estreito"><span className="num">{c.dias_em_qa ?? "—"}</span> d em QA</span>
            {c.retornos > 0 && <span className="so-estreito"><span className="num">{c.retornos}</span> retorno{c.retornos > 1 ? "s" : ""}</span>}
          </span>
        </td>
        <td className="num so-largo" title={c.entrou_em ? `Entrou em QA em ${dataHora(c.entrou_em)}` : undefined}>
          {c.dias_em_qa ?? "—"}
        </td>
        <td className={`num so-largo${c.retornos === 0 ? " zero" : ""}`}>{c.retornos}</td>
      </tr>
    );
  };

  return (
    <section className={`bloco fila${recolhida ? " fila--recolhida" : ""}`} id="fila" tabIndex={-1} aria-labelledby="t-fila">
      <header className="bloco__cabeca">
        <h2 id="t-fila" className="bloco__titulo">
          Fila de QA <span className="contagem">{fila.length}</span>
        </h2>
        {(foraDoPainel > 0 || soForaDoPainel) && (
          <button
            className="chip"
            aria-pressed={soForaDoPainel}
            onClick={alternarForaDoPainel}
            disabled={!alternarForaDoPainel}
            title="Cards em Teste/QA que o painel do Kanboard não mostra (projeto fora da lista do painel)"
          >
            {/* Filtro (vai para a URL); o grupo no fim da fila só recolhe e expande. */}
            {soForaDoPainel ? "Mostrar todos" : `Só fora do painel (${foraDoPainel})`}
          </button>
        )}
      </header>

      {fila.length === 0 ? (
        <p className="vazio">{soForaDoPainel ? "Nenhum card fora do painel." : "Nenhum card em QA."}</p>
      ) : (
        <div className="rolavel">
          <table className="tabela tabela--compacta">
            <thead>
              <tr>
                <th scope="col">Card</th>
                <th scope="col">Título</th>
                <th scope="col" className="num so-largo" title={DEFINICAO.diasEmQa}>Dias em QA</th>
                <th scope="col" className="num so-largo" title={DEFINICAO.retornos}>Retornos</th>
              </tr>
            </thead>
            <tbody>{principais.map(linha)}</tbody>
            {fora.length > 0 && (
              <tbody className="fila__fora">
                <tr className="fila__grupo">
                  <th scope="rowgroup" colSpan={4}>
                    <button type="button" className="fila__alternar" aria-expanded={verFora} onClick={() => setVerFora(!verFora)}>
                      <Icone nome={verFora ? "cima" : "baixo"} tamanho={12} />
                      {fora.length} fora do painel do Kanboard
                    </button>
                  </th>
                </tr>
                {verFora && fora.map(linha)}
              </tbody>
            )}
          </table>
          {recolhida && (
            <button type="button" className="ver-todos" onClick={() => setVerTodos(true)}>
              Ver todos os {principais.length} cards
            </button>
          )}
        </div>
      )}
    </section>
  );
}
