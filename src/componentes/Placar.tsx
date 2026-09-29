import { useEffect, useRef, useState } from "react";
import type { Dashboard } from "../data/contrato";
import { diaCurto, placar } from "../data/formato";
import { Porcento } from "./Porcento";
import { inicioDaUltimaColeta, kpisHoje, passaNoFiltro, type Filtro } from "../data/seletores";

/** Conta de 0 até o valor em degraus, só na primeira vez que o número aparece. */
function useContagem(valor: number): number {
  const [exibido, setExibido] = useState(valor);
  const primeira = useRef(true);
  useEffect(() => {
    if (!primeira.current || valor === 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setExibido(valor);
      return;
    }
    primeira.current = false;
    let passo = 0;
    const passos = 8;
    const id = window.setInterval(() => {
      passo++;
      setExibido(Math.round((valor * passo) / passos));
      if (passo >= passos) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [valor]);
  return exibido;
}

function Contador({ valor, casas = 3 }: { valor: number; casas?: number }) {
  return <>{placar(useContagem(valor), casas)}</>;
}

interface ItemProps {
  rotulo: string;
  cor: string;
  taxa?: boolean;
  children: React.ReactNode;
  sub: React.ReactNode;
}

function Item({ rotulo, cor, children, sub, taxa }: ItemProps) {
  return (
    <div className="placar__item">
      <dt className="hud placar__rotulo" style={{ color: cor }}>{rotulo}</dt>
      <dd className="placar__valor">
        <span className={`num brilha${taxa ? " num--taxa" : ""}`} style={{ color: cor }}>{children}</span>
        <span className="hud placar__sub">{sub}</span>
      </dd>
    </div>
  );
}

export function Placar({ dados, filtro }: { dados: Dashboard; filtro: Filtro }) {
  const k = kpisHoje(dados, new Date(), filtro);
  const ontem = diaCurto(k.diaComparacao);
  const desde = inicioDaUltimaColeta(dados);
  const passa = passaNoFiltro(dados, filtro);
  const novos = desde === null ? 0 : dados.fila_qa.filter((c) => passa(c.project_id) && (c.entrou_em ?? 0) > desde).length;

  return (
    <dl className="placar" aria-label="Placar de hoje">
      <Item rotulo="EM QA" cor="var(--ciano)" sub={
        novos > 0 ? <span style={{ color: "var(--dourado)" }}>{placar(novos, 2)} NOVOS</span> : "AGORA"
      }>
        <Contador valor={k.emQaAgora} />
      </Item>
      <Item rotulo="ENTRARAM" cor="var(--ciano)" sub={`${ontem}: ${placar(k.comparacao.entraram)}`}>
        <Contador valor={k.hoje.entraram} />
      </Item>
      <Item rotulo="APROVADOS" cor="var(--verde)" sub={`${ontem}: ${placar(k.comparacao.aprovados)}`}>
        <Contador valor={k.hoje.aprovados} />
      </Item>
      <Item rotulo="REPROVADOS" cor="var(--vermelho)" sub={`${ontem}: ${placar(k.comparacao.reprovados)}`}>
        <Contador valor={k.hoje.reprovados} />
      </Item>
      <Item rotulo="APROVAÇÃO MÊS" cor="var(--texto)" sub="APROVADOS ÷ JULGADOS" taxa>
        <Porcento valor={k.taxaAprovacaoMes} />
      </Item>
    </dl>
  );
}
