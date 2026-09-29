import type { Dashboard, Papel } from "../data/contrato";
import { NOME_PAPEL, placar } from "../data/formato";
import { passaNoFiltro, type Filtro } from "../data/seletores";

const ORDEM: Papel[] = ["backlog", "a_iniciar", "andamento", "interrompida", "correcao", "qa", "outra"];
const COR: Partial<Record<Papel, string>> = { qa: "var(--ciano)", correcao: "var(--vermelho)" };

/** Onde o trabalho está parado agora. Concluídas fica fora da barra (acumula milhares). */
export function Distribuicao({ dados, filtro }: { dados: Dashboard; filtro: Filtro }) {
  const passa = passaNoFiltro(dados, filtro);
  const soma = new Map<Papel, { cards: number; antigo: number }>();
  let concluidas = 0;
  for (const l of dados.distribuicao) {
    if (!passa(l.project_id)) continue;
    if (l.papel === "concluida") {
      concluidas += l.cards;
      continue;
    }
    const s = soma.get(l.papel) ?? { cards: 0, antigo: 0 };
    s.cards += l.cards;
    s.antigo = Math.max(s.antigo, l.dias_mais_antigo ?? 0);
    soma.set(l.papel, s);
  }
  const linhas = ORDEM.filter((p) => soma.get(p)?.cards);
  const maior = Math.max(1, ...linhas.map((p) => soma.get(p)!.cards));
  // Um tile vale N cards, para a maior barra caber em ~24 tiles.
  const porTile = Math.max(1, Math.ceil(maior / 24));

  return (
    <section className="moldura painel" aria-labelledby="t-dist">
      <h2 id="t-dist" className="hud painel__titulo">ONDE ESTÁ AGORA</h2>
      <p className="hud painel__nota">1 BLOCO = {porTile} CARD{porTile > 1 ? "S" : ""}</p>
      <ul className="dist">
        {linhas.map((p) => {
          const s = soma.get(p)!;
          const tiles = Math.max(1, Math.round(s.cards / porTile));
          return (
            <li key={p} className="dist__linha">
              <span className="hud dist__nome">{NOME_PAPEL[p]}</span>
              <span className="dist__barra" style={{ color: COR[p] ?? "var(--texto-3)", width: `${(tiles / 24) * 100}%` }} aria-hidden="true" />
              <span className="num dist__valor" style={{ color: COR[p] ?? "var(--texto-2)" }}>{placar(s.cards)}</span>
              <span className="sr">{s.cards} cards, o mais antigo há {s.antigo} dias</span>
            </li>
          );
        })}
      </ul>
      <p className="dist__concluidas hud">
        CONCLUÍDAS NO QUADRO <span className="num">{concluidas.toLocaleString("pt-BR")}</span>
      </p>
    </section>
  );
}
