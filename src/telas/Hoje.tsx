import type { Dashboard } from "../data/contrato";
import type { Filtro } from "../data/seletores";
import { Fila } from "../componentes/Fila";
import { Distribuicao } from "../componentes/Distribuicao";
import { PainelSinal } from "../componentes/Sinal";
import { Legenda } from "../componentes/Legenda";

interface Props {
  dados: Dashboard;
  filtro: Filtro;
  pagina: number;
  porPagina?: number;
  mudarPagina?: (p: number) => void;
  abrirCard: (id: number) => void;
}

export function Hoje({ dados, filtro, pagina, porPagina, mudarPagina, abrirCard }: Props) {
  return (
    <div className="hoje">
      <Fila dados={dados} filtro={filtro} pagina={pagina} porPagina={porPagina} mudarPagina={mudarPagina} abrirCard={abrirCard} />
      <div className="hoje__lado">
        <Distribuicao dados={dados} filtro={filtro} />
        <PainelSinal dados={dados} />
        <Legenda />
      </div>
    </div>
  );
}
