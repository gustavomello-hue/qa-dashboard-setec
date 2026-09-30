/**
 * Mini-tendência em barras (SVG puro): uma barra por semana, a última destacada.
 * `parcial`: a última semana ainda não acabou; a barra sai vazada, para não
 * parecer uma queda.
 */
export function Sparkline({ valores, rotulo, parcial = false }: { valores: number[]; rotulo: string; parcial?: boolean }) {
  const max = Math.max(1, ...valores);
  const largura = valores.length * 6;
  return (
    <svg className="sparkline" width={largura} height={20} viewBox={`0 0 ${largura} 20`} role="img" aria-label={rotulo}>
      <title>{parcial ? `${rotulo} (semana atual incompleta)` : rotulo}</title>
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
            className={
              i === valores.length - 1
                ? parcial ? "sparkline__parcial" : "sparkline__atual"
                : v === 0 ? "sparkline__zero" : "sparkline__barra"
            }
          />
        );
      })}
    </svg>
  );
}
