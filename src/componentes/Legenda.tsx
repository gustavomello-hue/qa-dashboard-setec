/** A lei das cores do painel, para quem olha de longe ou chega agora. */
export function Legenda() {
  return (
    <section className="moldura painel legenda-painel" aria-labelledby="t-legenda">
      <h2 id="t-legenda" className="hud painel__titulo">LEGENDA</h2>
      <ul className="hud">
        <li><span className="legenda-painel__amostra" style={{ color: "var(--ciano)" }} />Em Teste/QA, entradas</li>
        <li><span className="legenda-painel__amostra" style={{ color: "var(--verde)" }} />Aprovado: QA para Concluídas</li>
        <li><span className="legenda-painel__amostra" style={{ color: "var(--vermelho)" }} />Reprovado: QA para Correções</li>
        <li><span className="legenda-painel__amostra" style={{ color: "var(--dourado)" }} />Novo desde a última coleta</li>
        <li><span className="legenda-painel__amostra estatica" />Não medido: sem coleta</li>
      </ul>
    </section>
  );
}
