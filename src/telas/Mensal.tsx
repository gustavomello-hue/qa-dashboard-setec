import { useMemo } from "react";
import type { Dashboard, Grupo } from "../data/contrato";
import { mesCurto, numero, porcento } from "../data/formato";
import { mesLocal, resumoPorMes, type Filtro } from "../data/seletores";
import { ROTULO_GRUPO, composicaoPorMes, taxaCardsPorMes } from "../data/pessoas";
import { DEFINICAO } from "../data/glossario";
import { Glossario } from "../componentes/Glossario";
import { Grafico, base, cor, useTema, type OpcoesGrafico } from "../componentes/Grafico";

const MEDICAO: Record<string, string> = {
  completo: "Completo",
  "em andamento": "Em andamento",
  "parcial (reconstruído)": "Parcial",
};

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
  // % de cards reprovados: a mesma conta da Equipe e da Pessoa (por card, não por evento).
  const taxas = taxaCardsPorMes(dados, filtro);
  const taxaDe = (mes: string) => taxas.get(mes)?.taxa ?? null;
  // O mês corrente leva "*": está em andamento e não se compara de igual para igual.
  const mesAtual = mesLocal(new Date());
  const rotuloMes = (m: string) => (m === mesAtual ? `${mesCurto(m)} *` : mesCurto(m));
  const meses = linhas.map((l) => rotuloMes(l.ano_mes));
  // Linha com 2 pontos não mostra tendência: até 4 meses, % e tempo ficam como
  // mini-barras no Resumo; os gráficos de linha entram a partir do 4º mês.
  const comTendencia = linhas.length >= 4;
  const maxTempo = Math.max(1, ...linhas.map((l) => l.tempo_medio_qa_h ?? 0));
  const chave =
    linhas.map((l) => `${l.ano_mes}${l.entradas}${l.aprovados}${l.reprovados}${l.tempo_medio_qa_h}${taxaDe(l.ano_mes)}`).join() + tema;

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
      yAxis: { ...(b.yAxis as object), min: 0, axisLabel: { color: cor("--tinta-3"), formatter: "{value}%" } },
      series: [
        {
          name: "% cards reprovados",
          type: "line",
          data: linhas.map((l) => taxaDe(l.ano_mes)),
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
      xAxis: { ...(b.xAxis as object), data: composicao.map((c) => rotuloMes(c.ano_mes)) },
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
        <header className="bloco__cabeca">
          <h2 id="t-tabela-mes" className="bloco__titulo">Resumo</h2>
          {!comTendencia && <p className="nota">Com menos de 4 meses, % e tempo médio aparecem como barras aqui; os gráficos de tendência entram a partir do 4º mês.</p>}
          <Glossario />
        </header>
        <div className="rolavel-x">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">Mês</th>
                <th scope="col" className="num"><span className="coluna-tom etiqueta--entrada">Entraram</span></th>
                <th scope="col" className="num"><span className="coluna-tom etiqueta--aprovado">Aprovados</span></th>
                <th scope="col" className="num"><span className="coluna-tom etiqueta--reprovado">Reprovados</span></th>
                <th scope="col" className="num" title={DEFINICAO.cardsReprovados}>% cards reprov.</th>
                <th scope="col" className="num" title={DEFINICAO.tempoEmQa}>Tempo médio em QA</th>
                <th scope="col" className="num" title="Cards criados por quem está no grupo Gestão do equipe.json">Criados pela gestão</th>
                <th scope="col">Medição</th>
              </tr>
            </thead>
            <tbody>
              {linhas.slice().reverse().map((l) => (
                <tr key={l.ano_mes}>
                  <th scope="row">{rotuloMes(l.ano_mes)}</th>
                  <td className="num">{numero(l.entradas)}</td>
                  <td className="num">{numero(l.aprovados)}</td>
                  <td className="num">{numero(l.reprovados)}</td>
                  <td className="num">
                    {porcento(taxaDe(l.ano_mes))}
                    {!comTendencia && taxaDe(l.ano_mes) !== null && (
                      <span className="minibarra" aria-hidden="true"><span style={{ width: `${taxaDe(l.ano_mes)}%` }} /></span>
                    )}
                    {taxas.get(l.ano_mes) && (
                      <span className="meta celula-denominador">
                        {taxas.get(l.ano_mes)!.cardsReprovados} de {taxas.get(l.ano_mes)!.cardsJulgados}
                      </span>
                    )}
                  </td>
                  <td className="num">
                    {l.tempo_medio_qa_h === null ? "—" : `${l.tempo_medio_qa_h.toLocaleString("pt-BR")} h`}
                    {!comTendencia && l.tempo_medio_qa_h !== null && (
                      <span className="minibarra" aria-hidden="true"><span style={{ width: `${(100 * l.tempo_medio_qa_h) / maxTempo}%` }} /></span>
                    )}
                  </td>
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
          <p className="nota">Desde {desde}: antes disso só há amostra incompleta. * mês em andamento.</p>
        </header>
        <Grafico opcoes={volume} altura={220} rotulo={`Entradas, aprovados e reprovados por mês desde ${desde}`} />
      </section>

      {comTendencia && (
        <>
      <section className="bloco" aria-labelledby="t-reprov">
        <header className="bloco__cabeca">
          <h2 id="t-reprov" className="bloco__titulo">% de cards reprovados</h2>
          <p className="nota">Cards reprovados ao menos uma vez ÷ cards julgados no mês</p>
        </header>
        <Grafico opcoes={qualidade} altura={200} rotulo="Percentual de cards reprovados por mês" />
      </section>

      <section className="bloco" aria-labelledby="t-tempo">
        <header className="bloco__cabeca">
          <h2 id="t-tempo" className="bloco__titulo">Tempo médio em QA</h2>
          <p className="nota">Horas corridas da entrada à saída de QA</p>
        </header>
        <Grafico opcoes={tempo} altura={200} rotulo="Tempo médio em QA por mês, em horas" />
      </section>
        </>
      )}

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
