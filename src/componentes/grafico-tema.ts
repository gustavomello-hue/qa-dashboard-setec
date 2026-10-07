import { useEffect, useState } from "react";
import type { ComposeOption } from "echarts/core";
import type { BarSeriesOption, LineSeriesOption } from "echarts/charts";
import type { GridComponentOption, LegendComponentOption, TooltipComponentOption } from "echarts/components";

// Tema dos gráficos, sem o ECharts: as telas montam as opções com isto, e o
// motor (GraficoCanvas) só é baixado quando um gráfico aparece na tela.

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
  const texto = cor("--tinta-3");
  const linha = cor("--filete");
  const dado = getComputedStyle(document.documentElement).getPropertyValue("--face-dado").trim();
  return {
    animation: false,
    textStyle: { fontFamily: getComputedStyle(document.body).fontFamily },
    grid: { left: 8, right: 8, top: 36, bottom: 4, containLabel: true },
    legend: { top: 0, left: 0, icon: "rect", itemWidth: 10, itemHeight: 10, textStyle: { color: cor("--tinta-2") } },
    tooltip: {
      trigger: "axis",
      backgroundColor: cor("--faixa"),
      borderColor: linha,
      borderRadius: 2,
      textStyle: { color: cor("--tinta-1") },
      axisPointer: { type: "shadow", shadowStyle: { color: cor("--sombra-eixo") } },
    },
    xAxis: {
      type: "category",
      axisLine: { lineStyle: { color: linha } },
      axisTick: { show: false },
      axisLabel: { color: texto, fontFamily: dado, fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: linha } },
      axisLabel: { color: texto, fontFamily: dado, fontSize: 11 },
      minInterval: 1,
    },
  };
}
