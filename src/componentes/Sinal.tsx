import type { Dashboard } from "../data/contrato";
import { dataHora, haQuanto, hora } from "../data/formato";
import { estadoAtualizacao, lacunasRecentes } from "../data/seletores";

/** Selo da coleta no topo: horário, idade e o aviso quando atrasa. */
export function SeloColeta({ dados, erro }: { dados: Dashboard; erro: string | null }) {
  const estado = estadoAtualizacao(dados, new Date());
  const momento = dados.coleta.momento;
  return (
    <div className={`selo${estado.atrasado ? " selo--atrasado" : ""}`} role="status">
      <span className="selo__ponto" aria-hidden="true" />
      <span>
        {estado.atrasado ? "Sem coleta desde " : "Coleta das "}
        {momento ? (estado.atrasado ? dataHora(momento) : hora(momento)) : "—"}
      </span>
      <span className="selo__idade">{estado.minutos !== null ? haQuanto(estado.minutos) : "sem data"}</span>
      {erro && <span className="selo__erro" title={erro}>Falha ao atualizar · mostrando o último dado bom</span>}
    </div>
  );
}

/** Lacunas de coleta dos últimos 7 dias: o que não foi medido fica visível. */
export function Lacunas({ dados }: { dados: Dashboard }) {
  const lacunas = lacunasRecentes(dados, new Date()).slice().reverse();
  if (lacunas.length === 0) return <p className="nota">Coleta contínua no expediente dos últimos 7 dias.</p>;
  return (
    <details className="nota lacunas">
      <summary>
        {lacunas.length} lacuna{lacunas.length > 1 ? "s" : ""} de coleta nos últimos 7 dias
      </summary>
      <ul>
        {lacunas.map((l) => (
          <li key={l.inicio}>
            {dataHora(l.inicio)} até {dataHora(l.fim)} · {l.horas_expediente.toLocaleString("pt-BR")} h de expediente
            {l.movimentacoes_perdidas > 0 && ` · ${l.movimentacoes_perdidas} movimento(s) não visto(s)`}
          </li>
        ))}
      </ul>
    </details>
  );
}
