import { NOME_PAPEL } from "../data/formato";
import { PAPEIS_CARGA, type Carga } from "../data/pessoas";

/** Barra empilhada dos cards abertos de uma pessoa, por coluna. `max` fixa a escala entre linhas. */
export function BarraCarga({ carga, max }: { carga: Carga; max: number }) {
  const total = PAPEIS_CARGA.reduce((s, p) => s + carga[p], 0);
  const resumo = PAPEIS_CARGA.filter((p) => carga[p] > 0).map((p) => `${carga[p]} ${NOME_PAPEL[p].toLowerCase()}`).join(", ");
  return (
    <div className="carga" role="img" aria-label={total ? `${total} cards: ${resumo}` : "Nenhum card aberto"} title={resumo || "Nenhum card aberto"}>
      <div className="carga__trilho" style={{ width: `${max ? (100 * total) / max : 0}%` }}>
        {PAPEIS_CARGA.map((p) =>
          carga[p] > 0 ? <span key={p} className={`carga__seg carga__seg--${p}`} style={{ flexGrow: carga[p] }} /> : null,
        )}
      </div>
    </div>
  );
}

export function LegendaCarga() {
  return (
    <ul className="legenda" aria-label="Legenda das colunas">
      {PAPEIS_CARGA.map((p) => (
        <li key={p}>
          <span className={`legenda__cor carga__seg--${p}`} aria-hidden="true" />
          {NOME_PAPEL[p]}
        </li>
      ))}
    </ul>
  );
}
