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
  /** Linha secundária abaixo do número (ex.: a taxa, rebaixada de número a contexto). */
  extra?: ReactNode;
  /** Contador de apoio: numeral menor, para não competir com o fluxo principal. */
  menor?: boolean;
  /** Abre a lista de cards por trás do número. */
  href?: string;
}

/** Número grande com a comparação embaixo. A cor diz o que o número É, não se é bom ou ruim. */
export function Kpi({ rotulo, valor, tom = "neutro", anterior, rotuloAnterior, dicaAnterior, sub, dica, extra, menor, href }: Props) {
  const texto = typeof valor === "number" ? numero(valor) : valor;
  return (
    <div className={`kpi kpi--${tom}${menor ? " kpi--menor" : ""}`} title={dica}>
      <dt className="kpi__rotulo">{rotulo}</dt>
      <dd className="kpi__valor">{href && valor !== 0 ? <a className="kpi__link" href={href} aria-label={`${texto} ${rotulo}: ver os cards`}>{texto}</a> : texto}</dd>
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
      {extra && <dd className="kpi__extra">{extra}</dd>}
    </div>
  );
}
