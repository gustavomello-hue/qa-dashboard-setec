import { Suspense, lazy } from "react";
import type { OpcoesGrafico } from "./grafico-tema";

export { base, cor, useTema, type OpcoesGrafico } from "./grafico-tema";

// O ECharts (~1/3 do site) só vem quando um gráfico aparece: Pessoa, Mensal,
// Projetos e Reunião. A Agora, tela inicial e do modo TV, abre sem ele.
const GraficoCanvas = lazy(() => import("./GraficoCanvas").then((m) => ({ default: m.GraficoCanvas })));

/** Enquanto o motor carrega, o espaço do gráfico já fica reservado: nada pula. */
export function Grafico(props: { opcoes: OpcoesGrafico; altura?: number; rotulo: string }) {
  const altura = props.altura ?? 280;
  return (
    <Suspense fallback={<div role="img" aria-label={props.rotulo} aria-busy="true" style={{ width: "100%", height: altura }} />}>
      <GraficoCanvas {...props} />
    </Suspense>
  );
}
