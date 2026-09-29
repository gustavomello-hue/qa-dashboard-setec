import type { Dashboard } from "../data/contrato";
import { dataHora, nomeCurto, placar, separarEtiquetas } from "../data/formato";
import { inicioDaUltimaColeta, paginar, passaNoFiltro, type Filtro } from "../data/seletores";
import { Icone } from "./Icone";

export const POR_PAGINA = 10;
/** Na TV ninguém rola: a página inteira precisa caber numa tela 1080p. */
export const POR_PAGINA_TV = 6;

export function filaFiltrada(dados: Dashboard, filtro: Filtro) {
  const passa = passaNoFiltro(dados, filtro);
  return dados.fila_qa.filter((c) => passa(c.project_id));
}

interface Props {
  dados: Dashboard;
  filtro: Filtro;
  pagina: number;
  porPagina?: number;
  mudarPagina?: (p: number) => void;
  abrirCard: (id: number) => void;
}

/** A fila de QA do card mais parado ao mais recente, em páginas de tela cheia. */
export function Fila({ dados, filtro, pagina, porPagina = POR_PAGINA, mudarPagina, abrirCard }: Props) {
  const fila = filaFiltrada(dados, filtro);
  const { itens, total } = paginar(fila, porPagina, pagina);
  const atual = Math.min(pagina, total - 1);
  const desde = inicioDaUltimaColeta(dados);

  return (
    <section className="moldura painel fila" aria-labelledby="t-fila">
      <header className="painel__cabeca">
        <h2 id="t-fila" className="hud painel__titulo">
          FILA DE QA <span className="num" style={{ color: "var(--ciano)" }}>{placar(fila.length)}</span>
        </h2>
        <div className="paginas hud" aria-label="Páginas da fila">
          {mudarPagina && (
            <button className="botao-icone" disabled={atual === 0} onClick={() => mudarPagina(atual - 1)} aria-label="Página anterior">
              <Icone nome="anterior" />
            </button>
          )}
          <span>PÁG {atual + 1}/{total}</span>
          {mudarPagina && (
            <button className="botao-icone" disabled={atual >= total - 1} onClick={() => mudarPagina(atual + 1)} aria-label="Próxima página">
              <Icone nome="proximo" />
            </button>
          )}
        </div>
      </header>

      {fila.length === 0 ? (
        <p className="painel__vazio hud">NENHUM CARD EM QA</p>
      ) : (
        <table className="tabela">
          <thead className="hud">
            <tr>
              <th scope="col">CARD</th>
              <th scope="col">TÍTULO</th>
              <th scope="col" className="so-largo">DESIGNADO</th>
              <th scope="col" className="direita">DIAS</th>
              <th scope="col" className="direita so-largo">RETORNOS</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((c) => {
              const novo = desde !== null && (c.entrou_em ?? 0) > desde;
              const { etiquetas, resto } = separarEtiquetas(c.titulo);
              return (
                <tr key={c.task_id}>
                  <td className="tabela__card">
                    <button className="link-card num" onClick={() => abrirCard(c.task_id)} title="Ver a linha do tempo do card">
                      #{c.task_id}
                    </button>
                    {novo && (
                      <span className="novo" style={{ color: "var(--dourado)" }}>
                        <Icone nome="novo" titulo="Novo desde a última coleta" />
                      </span>
                    )}
                  </td>
                  <td className="tabela__titulo">
                    <a href={c.link} target="_blank" rel="noreferrer" className="titulo-card" title={c.titulo}>
                      {resto}
                    </a>
                    <span className="tabela__meta hud">
                      {etiquetas && <span>{etiquetas}</span>}
                      <span>{nomeCurto(c.projeto)}</span>
                      {c.retornos > 0 && <span className="tabela__retornos">{c.retornos} retorno{c.retornos > 1 ? "s" : ""}</span>}
                    </span>
                  </td>
                  <td className="so-largo tabela__pessoa">{c.designado}</td>
                  <td className="direita num tabela__dias" title={c.entrou_em ? `Entrou em QA em ${dataHora(c.entrou_em)}` : undefined}>
                    {c.dias_em_qa ?? "—"}
                  </td>
                  <td className="direita num so-largo">{c.retornos}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
