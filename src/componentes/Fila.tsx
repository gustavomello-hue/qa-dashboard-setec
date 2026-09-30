import type { Dashboard } from "../data/contrato";
import { dataHora, nomeCurto, separarEtiquetas } from "../data/formato";
import { inicioDaUltimaColeta, passaNoFiltro, type Filtro } from "../data/seletores";
import { indicePessoas } from "../data/pessoas";

export function filaFiltrada(dados: Dashboard, filtro: Filtro, soForaDoPainel = false) {
  const passa = passaNoFiltro(dados, filtro);
  return dados.fila_qa.filter((c) => passa(c.project_id) && (!soForaDoPainel || c.no_painel === false));
}

interface Props {
  dados: Dashboard;
  filtro: Filtro;
  abrirCard: (id: number) => void;
  /** Mostra só os cards que o painel do Kanboard não exibe. */
  soForaDoPainel?: boolean;
  alternarForaDoPainel?: () => void;
}

/** A fila de QA, do card mais parado ao mais recente. Rola dentro do bloco. */
export function Fila({ dados, filtro, abrirCard, soForaDoPainel = false, alternarForaDoPainel }: Props) {
  const fila = filaFiltrada(dados, filtro, soForaDoPainel);
  const foraDoPainel = filaFiltrada(dados, filtro).filter((c) => c.no_painel === false).length;
  const desde = inicioDaUltimaColeta(dados);
  // A fila traz o nome completo do Kanboard; a tela usa o nome curto da equipe.
  const curto = new Map([...indicePessoas(dados).values()].map((p) => [p.nome_kanboard, p.nome]));

  return (
    <section className="bloco fila" aria-labelledby="t-fila">
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
            {soForaDoPainel ? "Mostrar todos" : `${foraDoPainel} fora do painel`}
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
                <th scope="col" className="so-largo">Designado</th>
                <th scope="col" className="num">Dias</th>
                <th scope="col" className="num" title="Retornos para correção">Ret.</th>
              </tr>
            </thead>
            <tbody>
              {fila.map((c) => {
                const novo = desde !== null && (c.entrou_em ?? 0) > desde;
                const { etiquetas, resto } = separarEtiquetas(c.titulo);
                return (
                  <tr key={c.task_id}>
                    <td className="celula-card">
                      <button className="link-card" onClick={() => abrirCard(c.task_id)} title="Ver a linha do tempo do card">
                        #{c.task_id}
                      </button>
                      {novo && <span className="marca-novo" title="Novo desde a coleta anterior">novo</span>}
                    </td>
                    <td className="celula-titulo">
                      <a href={c.link} target="_blank" rel="noreferrer" title={c.titulo}>{resto}</a>
                      <span className="meta">
                        {c.no_painel === false && <span className="marca-fora" title="Não aparece no painel Teste de QA do Kanboard">fora do painel</span>}
                        {etiquetas && <span>{etiquetas}</span>}
                        <span>{nomeCurto(c.projeto)}</span>
                      </span>
                    </td>
                    <td className="so-largo celula-pessoa" title={c.designado}>{curto.get(c.designado) ?? c.designado}</td>
                    <td className="num" title={c.entrou_em ? `Entrou em QA em ${dataHora(c.entrou_em)}` : undefined}>
                      {c.dias_em_qa ?? "—"}
                    </td>
                    <td className={`num${c.retornos === 0 ? " zero" : ""}`}>{c.retornos}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
