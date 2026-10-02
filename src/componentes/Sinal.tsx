import type { Dashboard } from "../data/contrato";
import { dataHora, diaCurto, haQuanto, hora } from "../data/formato";
import { diaLocal, estadoAtualizacao, lacunasRecentes } from "../data/seletores";

/**
 * Selo da coleta no topo: horário e idade. Não é região viva: seria
 * re-anunciado a cada atualização. O que precisa ser anunciado (atraso) vai
 * no AvisoColeta.
 */
export function SeloColeta({ dados, erro, agora, recarregar }: { dados: Dashboard; erro: string | null; agora: Date; recarregar: () => void }) {
  const estado = estadoAtualizacao(dados, agora);
  const momento = dados.coleta.momento;
  return (
    <div className={`selo${estado.atrasado ? " selo--atrasado" : ""}`}>
      <span className="selo__ponto" aria-hidden="true" />
      <span>
        {estado.atrasado ? "Sem coleta desde " : "Coleta das "}
        {momento ? (estado.atrasado || estado.outroDia ? dataHora(momento) : hora(momento)) : "—"}
      </span>
      <span className="selo__idade">{estado.minutos !== null ? haQuanto(estado.minutos) : "sem data"}</span>
      {erro && (
        <span className="selo__erro" title={erro}>
          Falha ao atualizar
          <button className="botao botao--mini" onClick={recarregar}>Tentar de novo</button>
        </span>
      )}
    </div>
  );
}

/**
 * Faixa de aviso quando o dado não é de agora. A coleta parada no expediente
 * é o caso grave: sem este aviso, "Entraram hoje 0" parece equipe parada
 * quando é o coletor que parou.
 */
export function AvisoColeta({ dados, agora }: { dados: Dashboard; agora: Date }) {
  const estado = estadoAtualizacao(dados, agora);
  if (!estado.momento || (!estado.atrasado && !estado.outroDia)) return null;
  const quando = estado.outroDia ? `${diaCurto(diaLocal(new Date(estado.momento * 1000)))} às ${hora(estado.momento)}` : hora(estado.momento);
  return (
    <div className={`aviso${estado.atrasado ? " aviso--grave" : ""}`} role="status">
      <span className="aviso__marca" aria-hidden="true" />
      {estado.atrasado ? (
        <p>
          <strong>Coleta parada {estado.minutos !== null ? haQuanto(estado.minutos) : ""}.</strong> Os números param em {quando}.
          {" "}Confira se o PC da coleta está ligado e o Agendador de Tarefas rodando.
        </p>
      ) : (
        <p>
          <strong>Ainda não houve coleta hoje.</strong> Os números são de {quando}, a última coleta.
        </p>
      )}
    </div>
  );
}

/**
 * Saiu um deploy novo e alguém está usando a aba: avisa em vez de recarregar
 * no meio do uso. Ninguém mexendo por 2 min, a página recarrega sozinha.
 */
export function AvisoVersao() {
  return (
    <div className="aviso" role="status">
      <span className="aviso__marca" aria-hidden="true" />
      <p>
        <strong>Nova versão do painel.</strong> A página se atualiza sozinha quando ficar sem uso.
      </p>
      <button className="botao botao--mini" onClick={() => window.location.reload()}>Atualizar agora</button>
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
