import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { PictorialBarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ComposeOption } from "echarts/core";
import type { PictorialBarSeriesOption } from "echarts/charts";
import type { GridComponentOption, TooltipComponentOption } from "echarts/components";

// Só o que o painel usa: barras de blocos (pictorialBar), grade e tooltip.
// Importar o ECharts inteiro triplicava o tamanho do site.
echarts.use([PictorialBarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export type OpcoesGrafico = ComposeOption<PictorialBarSeriesOption | GridComponentOption | TooltipComponentOption>;

/** Invólucro mínimo: cria uma vez, troca as opções, acompanha o tamanho. */
export function Grafico({ opcoes, altura = 320, rotulo }: { opcoes: OpcoesGrafico; altura?: number; rotulo: string }) {
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
  }, [opcoes]);

  return <div ref={elemento} role="img" aria-label={rotulo} style={{ width: "100%", height: altura }} />;
}
