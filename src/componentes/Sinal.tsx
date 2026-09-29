import type { Dashboard } from "../data/contrato";
import { dataHora, haQuanto, hora } from "../data/formato";
import { estadoAtualizacao, lacunasRecentes } from "../data/seletores";

/** Selo da coleta no canto do HUD: horário, idade e "SEM SINAL" quando atrasa. */
export function SeloColeta({ dados, erro }: { dados: Dashboard; erro: string | null }) {
  const estado = estadoAtualizacao(dados, new Date());
  const momento = dados.coleta.momento;
  return (
    <div className={`selo hud${estado.atrasado ? " selo--sem-sinal" : ""}`} role="status">
      {estado.atrasado ? (
        <span className="selo__estado">SEM SINAL</span>
      ) : (
        <span className="selo__estado">COLETA {momento ? hora(momento) : "—"}</span>
      )}
      <span className="selo__idade">
        {estado.atrasado && momento ? `ÚLTIMA ${dataHora(momento)} · ` : ""}
        {estado.minutos !== null ? haQuanto(estado.minutos) : "SEM DATA"}
      </span>
      {erro && <span className="selo__erro" title={erro}>FALHA AO ATUALIZAR · MOSTRANDO O ÚLTIMO DADO BOM</span>}
    </div>
  );
}

/** Painel de lacunas: o que não foi medido fica riscado. */
export function PainelSinal({ dados }: { dados: Dashboard }) {
  const lacunas = lacunasRecentes(dados, new Date()).slice().reverse();
  return (
    <section className="moldura painel" aria-labelledby="t-sinal">
      <h2 id="t-sinal" className="hud painel__titulo">SINAL · 7 DIAS</h2>
      {lacunas.length === 0 ? (
        <p className="painel__vazio hud">COLETA CONTÍNUA NO EXPEDIENTE</p>
      ) : (
        <ul className="lacunas">
          {lacunas.map((l) => (
            <li key={l.inicio} className="lacuna">
              <span className="lacuna__faixa estatica" aria-hidden="true" />
              <span className="lacuna__texto">
                <span className="hud">{dataHora(l.inicio)} ATÉ {dataHora(l.fim)}</span>
                <span className="lacuna__detalhe">
                  {l.horas_expediente.toLocaleString("pt-BR")} h de expediente sem coleta
                  {l.movimentacoes_perdidas > 0 && ` · ${l.movimentacoes_perdidas} movimento(s) não visto(s)`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
