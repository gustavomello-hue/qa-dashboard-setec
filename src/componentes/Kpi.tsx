import type { ReactNode } from "react";
import { numero } from "../data/formato";

export type Tom = "neutro" | "entrada" | "aprovado" | "reprovado" | "sem-qa" | "devolvido";

interface Props {
  rotulo: string;
  valor: number | string;
  tom?: Tom;
  /** Valor do período de comparação. Sem ele, mostra `sub`. */
  anterior?: number | string;
  rotuloAnterior?: string;
  /** Texto do tooltip sobre a comparação, antes do valor ("Ontem" -> "Ontem: 16"). */
  dicaAnterior?: string;
  sub?: ReactNode;
  dica?: string;
}

/** Número grande com a comparação embaixo. A cor diz o que o número É, não se é bom ou ruim. */
export function Kpi({ rotulo, valor, tom = "neutro", anterior, rotuloAnterior, dicaAnterior, sub, dica }: Props) {
  return (
    <div className={`kpi kpi--${tom}`} title={dica}>
      <dt className="kpi__rotulo">{rotulo}</dt>
      <dd className="kpi__valor">{typeof valor === "number" ? numero(valor) : valor}</dd>
      <dd
        className="kpi__sub"
        title={anterior !== undefined && dicaAnterior ? `${dicaAnterior}: ${typeof anterior === "number" ? numero(anterior) : anterior}` : undefined}
      >
        {anterior !== undefined ? (
          <>
            {rotuloAnterior}: <span className="kpi__anterior">{typeof anterior === "number" ? numero(anterior) : anterior}</span>
          </>
        ) : (
          sub
        )}
      </dd>
    </div>
  );
}
