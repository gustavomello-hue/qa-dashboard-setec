import { porcento } from "../data/formato";
import { Icone } from "./Icone";

/**
 * Número em Silkscreen e o "%" desenhado em bitmap: o glifo da Silkscreen lê
 * como Z e o da Jersey, pequeno, como ×.
 */
export function Porcento({ valor }: { valor: number | null }) {
  if (valor === null) return <>—</>;
  const texto = porcento(valor);
  return (
    <>
      {texto.slice(0, -1)}
      <span className="placar__pct">
        <Icone nome="porcento" tamanho="0.62em" titulo="por cento" />
      </span>
    </>
  );
}
