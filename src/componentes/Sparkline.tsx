/** Mini-tendência em barras (SVG puro): uma barra por semana, a última destacada. */
export function Sparkline({ valores, rotulo }: { valores: number[]; rotulo: string }) {
  const max = Math.max(1, ...valores);
  const largura = valores.length * 6;
  return (
    <svg className="sparkline" width={largura} height={20} viewBox={`0 0 ${largura} 20`} role="img" aria-label={rotulo}>
      <title>{rotulo}</title>
      {valores.map((v, i) => {
        const h = v === 0 ? 1 : Math.max(2, (18 * v) / max);
        return (
          <rect
            key={i}
            x={i * 6}
            y={20 - h}
            width={4}
            height={h}
            rx={1}
            className={i === valores.length - 1 ? "sparkline__atual" : v === 0 ? "sparkline__zero" : "sparkline__barra"}
          />
        );
      })}
    </svg>
  );
}
