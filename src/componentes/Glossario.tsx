import { GLOSSARIO } from "../data/glossario";

/**
 * "Como ler estes números": as definições num bloco que abre por clique ou
 * teclado. O tooltip do cabeçalho continua, mas não é mais o único lugar
 * onde a definição existe (teclado, toque e leitor de tela não o alcançam).
 */
export function Glossario({ termos = GLOSSARIO }: { termos?: { termo: string; definicao: string }[] }) {
  return (
    <details className="glossario">
      <summary>Como ler estes números</summary>
      <dl>
        {termos.map((g) => (
          <div key={g.termo}>
            <dt>{g.termo}</dt>
            <dd>{g.definicao}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
