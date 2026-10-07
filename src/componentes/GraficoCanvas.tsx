import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { OpcoesGrafico } from "./grafico-tema";

// Só o que o painel usa: barras, linha, grade, legenda e tooltip. Importar o
// ECharts inteiro triplicava o tamanho do site. Este arquivo é carregado sob
// demanda (Grafico.tsx): a tela Agora e o modo TV não o baixam.
echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

/** Invólucro mínimo: cria uma vez, troca as opções, acompanha o tamanho. */
export function GraficoCanvas({ opcoes, altura = 280, rotulo }: { opcoes: OpcoesGrafico; altura?: number; rotulo: string }) {
  const elemento = useRef<HTMLDivElement>(null);
  const grafico = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!elemento.current) return;
    const g = echarts.init(elemento.current, undefined, { renderer: "canvas" });
    grafico.current = g;
    const observador = new ResizeObserver(() => g.resize());
    observador.observe(elemento.current);
    return () => {
      observador.disconnect();
      g.dispose();
      grafico.current = null;
    };
  }, []);

  useEffect(() => {
    grafico.current?.setOption(opcoes, { notMerge: true });
    // O canvas só desenha na fonte do quadro depois que ela carregou.
    document.fonts?.ready.then(() => grafico.current?.setOption(opcoes, { notMerge: true }));
  }, [opcoes]);

  return <div ref={elemento} role="img" aria-label={rotulo} style={{ width: "100%", height: altura }} />;
}
