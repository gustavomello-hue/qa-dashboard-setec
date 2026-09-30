import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ComposeOption } from "echarts/core";
import type { BarSeriesOption, LineSeriesOption } from "echarts/charts";
import type { GridComponentOption, LegendComponentOption, TooltipComponentOption } from "echarts/components";

// Só o que o painel usa: barras, linha, grade, legenda e tooltip. Importar o
// ECharts inteiro triplicava o tamanho do site.
echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

export type OpcoesGrafico = ComposeOption<
  BarSeriesOption | LineSeriesOption | GridComponentOption | LegendComponentOption | TooltipComponentOption
>;

/** Lê os tokens de cor do CSS (mudam com o tema claro/escuro). */
export function cor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "#888";
}

/** Muda quando o sistema troca de tema: os gráficos em canvas precisam redesenhar. */
export function useTema(): string {
  const consulta = "(prefers-color-scheme: dark)";
  const [tema, setTema] = useState(() => (matchMedia(consulta).matches ? "escuro" : "claro"));
  useEffect(() => {
    const m = matchMedia(consulta);
    const aoMudar = () => setTema(m.matches ? "escuro" : "claro");
    m.addEventListener("change", aoMudar);
    return () => m.removeEventListener("change", aoMudar);
  }, []);
  return tema;
}

/** Eixos, grade e tooltip no estilo do painel. */
export function base(): OpcoesGrafico {
  const texto = cor("--texto-2");
  const linha = cor("--linha");
  return {
    animation: false,
    textStyle: { fontFamily: getComputedStyle(document.body).fontFamily },
    grid: { left: 8, right: 8, top: 36, bottom: 4, containLabel: true },
    legend: { top: 0, left: 0, icon: "roundRect", itemWidth: 10, itemHeight: 10, textStyle: { color: texto } },
    tooltip: {
      trigger: "axis",
      backgroundColor: cor("--superficie"),
      borderColor: linha,
      textStyle: { color: cor("--texto") },
      axisPointer: { type: "shadow", shadowStyle: { color: cor("--sombra-eixo") } },
    },
    xAxis: {
      type: "category",
      axisLine: { lineStyle: { color: linha } },
      axisTick: { show: false },
      axisLabel: { color: texto },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: linha } },
      axisLabel: { color: texto },
      minInterval: 1,
    },
  };
}

/** Invólucro mínimo: cria uma vez, troca as opções, acompanha o tamanho. */
export function Grafico({ opcoes, altura = 280, rotulo }: { opcoes: OpcoesGrafico; altura?: number; rotulo: string }) {
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
