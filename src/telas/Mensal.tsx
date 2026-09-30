import { useMemo } from "react";
import type { Dashboard, Grupo } from "../data/contrato";
import { mesCurto, numero, porcento } from "../data/formato";
import { resumoPorMes, type Filtro } from "../data/seletores";
import { ROTULO_GRUPO, composicaoPorMes } from "../data/pessoas";
import { Grafico, base, cor, useTema, type OpcoesGrafico } from "../componentes/Grafico";

const MEDICAO: Record<string, string> = {
  completo: "Completo",
  "em andamento": "Em andamento",
  "parcial (reconstruído)": "Parcial",
};

/** % dos julgamentos (aprovado + reprovado) que foram reprovação. */
function reprovacao(taxaAprovacao: number | null): number | null {
  return taxaAprovacao === null ? null : Math.round(10 * (100 - taxaAprovacao)) / 10;
}

const GRUPOS_COMPOSICAO: Grupo[] = ["dev", "estagiario_dev", "qa", "estagiario_qa", "gestao", "outros"];
const COR_GRUPO: Record<Grupo, string> = {
  dev: "--grupo-dev",
  estagiario_dev: "--grupo-est-dev",
  qa: "--grupo-qa",
  estagiario_qa: "--grupo-est-qa",
  gestao: "--grupo-gestao",
  outros: "--grupo-outros",
};

export function Mensal({ dados, filtro }: { dados: Dashboard; filtro: Filtro }) {
  const tema = useTema();
  const linhas = resumoPorMes(dados, filtro);
  const composicao = composicaoPorMes(dados, filtro);
  const meses = linhas.map((l) => mesCurto(l.ano_mes));
  const chave = linhas.map((l) => `${l.ano_mes}${l.entradas}${l.aprovados}${l.reprovados}${l.tempo_medio_qa_h}`).join() + tema;

  const volume = useMemo<OpcoesGrafico>(() => {
    const b = base();
    return {
      ...b,
      xAxis: { ...(b.xAxis as object), data: meses },
      series: [
        { name: "Entraram", type: "bar", barMaxWidth: 28, data: linhas.map((l) => l.entradas), itemStyle: { color: cor("--entrada") } },
        { name: "Aprovados", type: "bar", barMaxWidth: 28, data: linhas.map((l) => l.aprovados), itemStyle: { color: cor("--aprovado") } },
        { name: "Reprovados", type: "bar", barMaxWidth: 28, data: linhas.map((l) => l.reprovados), itemStyle: { color: cor("--reprovado") } },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const qualidade = useMemo<OpcoesGrafico>(() => {
    const b = base();
    return {
      ...b,
      xAxis: { ...(b.xAxis as object), data: meses },
      yAxis: { ...(b.yAxis as object), max: 100, axisLabel: { color: cor("--tinta-3"), formatter: "{value}%" } },
      series: [
        {
          name: "% reprovação",
          type: "line",
          data: linhas.map((l) => reprovacao(l.taxa_aprovacao)),
          itemStyle: { color: cor("--reprovado") },
          lineStyle: { width: 2 },
          symbolSize: 6,
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const tempo = useMemo<OpcoesGrafico>(() => {
    const b = base();
    return {
      ...b,
      xAxis: { ...(b.xAxis as object), data: meses },
      series: [
        {
          name: "Tempo médio em QA (h)",
          type: "line",
          data: linhas.map((l) => l.tempo_medio_qa_h),
          itemStyle: { color: cor("--entrada") },
          lineStyle: { width: 2 },
          symbolSize: 6,
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const chaveComp = composicao.map((c) => c.ano_mes + JSON.stringify(c.entregues)).join() + tema;
  const grupos = useMemo<OpcoesGrafico>(() => {
    const b = base();
    const presentes = GRUPOS_COMPOSICAO.filter((g) => composicao.some((c) => c.entregues[g] > 0));
    return {
      ...b,
      xAxis: { ...(b.xAxis as object), data: composicao.map((c) => mesCurto(c.ano_mes)) },
      series: presentes.map((g) => ({
        name: ROTULO_GRUPO[g],
        type: "bar" as const, barMaxWidth: 28,
        stack: "total",
        data: composicao.map((c) => c.entregues[g]),
        itemStyle: { color: cor(COR_GRUPO[g]) },
      })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveComp]);

  const desde = mesCurto(dados.regras.qa_confiavel_desde);

  return (
    <div className="mensal">
      <section className="bloco mensal__largo" aria-labelledby="t-tabela-mes">
        <h2 id="t-tabela-mes" className="bloco__titulo">Resumo</h2>
        <div className="rolavel-x">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">Mês</th>
                <th scope="col" className="num"><span className="coluna-tom etiqueta--entrada">Entraram</span></th>
                <th scope="col" className="num"><span className="coluna-tom etiqueta--aprovado">Aprovados</span></th>
                <th scope="col" className="num"><span className="coluna-tom etiqueta--reprovado">Reprovados</span></th>
                <th scope="col" className="num">% reprov.</th>
                <th scope="col" className="num">Tempo médio em QA</th>
                <th scope="col" className="num" title="Cards criados por quem está no grupo Gestão do equipe.json">Criados pela gestão</th>
                <th scope="col">Medição</th>
              </tr>
            </thead>
            <tbody>
              {linhas.slice().reverse().map((l) => (
                <tr key={l.ano_mes}>
                  <th scope="row">{mesCurto(l.ano_mes)}</th>
                  <td className="num">{numero(l.entradas)}</td>
                  <td className="num">{numero(l.aprovados)}</td>
                  <td className="num">{numero(l.reprovados)}</td>
                  <td className="num">{porcento(reprovacao(l.taxa_aprovacao))}</td>
                  <td className="num">{l.tempo_medio_qa_h === null ? "—" : `${l.tempo_medio_qa_h.toLocaleString("pt-BR")} h`}</td>
                  <td className="num">{numero(composicao.find((c) => c.ano_mes === l.ano_mes)?.criadosGestao ?? 0)}</td>
                  <td><span className="meta">{MEDICAO[l.completude] ?? l.completude}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bloco mensal__largo" aria-labelledby="t-volume">
        <header className="bloco__cabeca">
          <h2 id="t-volume" className="bloco__titulo">Volume de QA por mês</h2>
          <p className="nota">Desde {desde}: antes disso só há amostra incompleta.</p>
        </header>
        <Grafico opcoes={volume} altura={220} rotulo={`Entradas, aprovados e reprovados por mês desde ${desde}`} />
      </section>

      <section className="bloco" aria-labelledby="t-reprov">
        <header className="bloco__cabeca">
          <h2 id="t-reprov" className="bloco__titulo">% de reprovação</h2>
          <p className="nota">Reprovações ÷ (aprovações + reprovações)</p>
        </header>
        <Grafico opcoes={qualidade} altura={200} rotulo="Percentual de reprovação por mês" />
      </section>

      <section className="bloco" aria-labelledby="t-tempo">
        <header className="bloco__cabeca">
          <h2 id="t-tempo" className="bloco__titulo">Tempo médio em QA</h2>
          <p className="nota">Horas corridas da entrada à saída de QA</p>
        </header>
        <Grafico opcoes={tempo} altura={200} rotulo="Tempo médio em QA por mês, em horas" />
      </section>

      <section className="bloco mensal__largo" aria-labelledby="t-grupos">
        <header className="bloco__cabeca">
          <h2 id="t-grupos" className="bloco__titulo">Entregas para QA por grupo</h2>
          <p className="nota">Pelo responsável do card no momento da entrega</p>
        </header>
        {composicao.length === 0 ? (
          <p className="vazio">Sem métricas por pessoa neste dashboard.json.</p>
        ) : (
          <Grafico opcoes={grupos} altura={200} rotulo="Entregas para QA por mês, empilhadas por grupo" />
        )}
      </section>

    </div>
  );
}
