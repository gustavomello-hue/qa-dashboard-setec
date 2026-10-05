import type { Dashboard } from "../data/contrato";
import { frasesQa, type Filtro } from "../data/seletores";

/**
 * Notas de fidelidade da frente de QA (etapa 4): o que a taxa de reprovação
 * não mede e quais projetos entraram no meio do período mostrado.
 */
export function NotasQa({ dados, filtro, meses }: { dados: Dashboard; filtro: Filtro; meses: string[] }) {
  const frases = frasesQa(dados, filtro, meses);
  if (!frases.length) return null;
  return (
    <div className="nota notas-qa">
      {frases.map((f) => <p key={f}>{f}</p>)}
    </div>
  );
}
