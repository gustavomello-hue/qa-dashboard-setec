import { useEffect, useMemo, useState } from "react";
import type { Dashboard } from "../data/contrato";
import { mesCurto, placar } from "../data/formato";
import { Porcento } from "../componentes/Porcento";
import { resumoPorMes, type Filtro } from "../data/seletores";
import { Grafico, type OpcoesGrafico } from "../componentes/Grafico";

const MEDICAO: Record<string, string> = {
  completo: "COMPLETO",
  "em andamento": "EM ANDAMENTO",
  "parcial (reconstruído)": "PARCIAL",
};

function serie(nome: string, cor: string, dados: number[]) {
  return {
    name: nome,
    type: "pictorialBar" as const,
    symbol: "rect",
    symbolRepeat: true,
    // Largura do bloco = largura da barra: com poucos meses as colunas
    // ficam largas como placar, com muitos elas estreitam sozinhas.
    symbolSize: ["100%", 8],
    symbolMargin: 3,
    barGap: "18%",
    barCategoryGap: "34%",
    itemStyle: { color: cor },
    data: dados,
  };
}

export function Mensal({ dados, filtro }: { dados: Dashboard; filtro: Filtro }) {
  const linhas = resumoPorMes(dados, filtro);
  // O canvas só enxerga a fonte pixelada depois que ela carregou.
  const [fontes, setFontes] = useState(false);
  useEffect(() => {
    document.fonts.ready.then(() => setFontes(true));
  }, []);

  const opcoes = useMemo<OpcoesGrafico>(() => {
    const eixo = { color: "#b3b6df", fontFamily: "Silkscreen", fontSize: 12 };
    return {
      // Sem crescimento suave: no resto do painel o movimento é em degraus,
      // e a entrada da tela já tem a varredura.
      animation: false,
      grid: { left: 48, right: 16, top: 16, bottom: 32 },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0c0e24",
        borderColor: "#3149ff",
        borderWidth: 2,
        textStyle: { color: "#f2f1ff", fontFamily: "Jersey 15", fontSize: 18 },
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(116,70,255,0.12)" } },
      },
      xAxis: {
        type: "category",
        data: linhas.map((l) => mesCurto(l.ano_mes)),
        axisLine: { lineStyle: { color: "#3149ff", width: 2 } },
        axisTick: { show: false },
        axisLabel: eixo,
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#14173a", width: 2 } },
        axisLabel: eixo,
      },
      series: [
        serie("Entraram", "#3fe3ff", linhas.map((l) => l.entradas)),
        serie("Aprovados", "#45e07a", linhas.map((l) => l.aprovados)),
        serie("Reprovados", "#ff5361", linhas.map((l) => l.reprovados)),
      ],
    };
    // `fontes` redesenha o canvas quando a Silkscreen chega.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linhas.map((l) => l.ano_mes + l.entradas + l.aprovados + l.reprovados).join(), fontes]);

  return (
    <div className="mensal">
      <section className="moldura painel" aria-labelledby="t-mensal">
        <header className="painel__cabeca">
          <h2 id="t-mensal" className="hud painel__titulo">MÊS A MÊS</h2>
          <ul className="legenda hud" aria-label="Legenda">
            <li style={{ color: "var(--ciano)" }}><span className="legenda__bloco" />ENTRARAM</li>
            <li style={{ color: "var(--verde)" }}><span className="legenda__bloco" />APROVADOS</li>
            <li style={{ color: "var(--vermelho)" }}><span className="legenda__bloco" />REPROVADOS</li>
          </ul>
        </header>
        <Grafico
          opcoes={opcoes}
          altura={340}
          rotulo={`Entradas, aprovados e reprovados por mês desde ${mesCurto(dados.regras.qa_confiavel_desde)}`}
        />
        <p className="hud painel__nota">
          ANTES DE {mesCurto(dados.regras.qa_confiavel_desde)} SÓ HÁ AMOSTRA INCOMPLETA: FICA FORA DO GRÁFICO
        </p>
      </section>

      <section className="moldura painel" aria-labelledby="t-tabela-mes">
        <h2 id="t-tabela-mes" className="hud painel__titulo">RESUMO</h2>
        <div className="rolavel">
        <table className="tabela tabela--mes">
          <thead className="hud">
            <tr>
              <th scope="col">MÊS</th>
              <th scope="col" className="direita">ENTRARAM</th>
              <th scope="col" className="direita">APROV</th>
              <th scope="col" className="direita">REPROV</th>
              <th scope="col" className="direita">APROVAÇÃO</th>
              <th scope="col" className="direita so-largo">TEMPO MÉDIO EM QA</th>
              <th scope="col">MEDIÇÃO</th>
            </tr>
          </thead>
          <tbody className="num">
            {linhas.slice().reverse().map((l) => (
              <tr key={l.ano_mes}>
                <th scope="row" className="hud">{mesCurto(l.ano_mes)}</th>
                <td className="direita" style={{ color: "var(--ciano)" }}>{placar(l.entradas)}</td>
                <td className="direita" style={{ color: "var(--verde)" }}>{placar(l.aprovados)}</td>
                <td className="direita" style={{ color: "var(--vermelho)" }}>{placar(l.reprovados)}</td>
                <td className="direita"><Porcento valor={l.taxa_aprovacao} /></td>
                <td className="direita so-largo">
                  {l.tempo_medio_qa_h === null ? "—" : `${l.tempo_medio_qa_h.toLocaleString("pt-BR")} H`}
                </td>
                <td>
                  <span className={`medicao hud${l.completude.startsWith("parcial") ? " medicao--parcial" : ""}`}>
                    {MEDICAO[l.completude] ?? l.completude.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}
