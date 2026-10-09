import { useMemo, useState } from "react";
import type { Dashboard, ProjetoFluxo } from "../data/contrato";
import { abertos, filtrarProjetos, mesAtual, ordenarProjetos, semAcento, type ChaveOrdem, type FrenteFluxo } from "../data/projetos";
import { dataCurta, mesCurto, nomeCurto, numero, separarEtiquetas } from "../data/formato";
import { mesLocal } from "../data/seletores";
import { Grafico, base, cor, useTema, type OpcoesGrafico } from "../componentes/Grafico";
import { Icone } from "../componentes/Icone";
import { Glossario } from "../componentes/Glossario";
import { GLOSSARIO_PROJETOS } from "../data/glossario";

// Tela Projetos (etapa 4): o fluxo de todos os projetos do Kanboard, para
// achar onde o trabalho está parado. Os números vêm prontos do Python
// (metricas_projetos.py); o que não foi medido aparece escrito, nunca como 0.

const DIA = 86400;
const FRENTES: { id: FrenteFluxo; rotulo: string }[] = [
  { id: "demais", rotulo: "Demais" },
  { id: "qa", rotulo: "Frente de QA" },
  { id: "todos", rotulo: "Todos" },
];
const NOME_PAPEL_COLUNA: Record<string, string> = {
  backlog: "backlog", a_iniciar: "a iniciar", andamento: "em andamento", correcao: "correções",
  qa: "teste/QA", interrompida: "interrompida", concluida: "concluída", outra: "",
};

interface Props {
  dados: Dashboard;
  detalhe?: number;
  agora: Date;
  hrefDetalhe: (id: number) => string;
  hrefVoltar: string;
}

export function Projetos({ dados, detalhe, agora, hrefDetalhe, hrefVoltar }: Props) {
  const fluxo = dados.projetos_fluxo;
  if (!fluxo) {
    return <p className="vazio">Dados de projetos ainda não publicados. Eles chegam na próxima coleta.</p>;
  }
  const atrasadas = fluxo.fechadas_em === null || agora.getTime() / 1000 - fluxo.fechadas_em > 2 * DIA;
  const aviso = atrasadas ? (
    <div className="aviso" role="status">
      <span className="aviso__marca" aria-hidden="true" />
      <p>
        {fluxo.fechadas_em === null
          ? "Cards fechados ainda não coletados: saídas e tempo de ciclo podem estar incompletos."
          : `Cards fechados sem atualização desde ${dataCurta(fluxo.fechadas_em)}: saídas e tempo de ciclo podem estar incompletos.`}
      </p>
    </div>
  ) : null;

  if (detalhe !== undefined) {
    const p = fluxo.projetos.find((x) => x.id === detalhe);
    if (!p) {
      return (
        <div className="pessoa">
          <a className="botao botao--leve" href={hrefVoltar}><Icone nome="voltar" /> Projetos</a>
          <p className="vazio">Projeto #{detalhe} não está na coleta (fechado no Kanboard ou removido).</p>
        </div>
      );
    }
    return <Detalhe p={p} parado={fluxo.parado_dias} agora={agora} hrefVoltar={hrefVoltar} aviso={aviso} />;
  }
  return <VisaoGeral dados={dados} agora={agora} hrefDetalhe={hrefDetalhe} aviso={aviso} />;
}

// --- Visão geral -----------------------------------------------------------

const COLUNAS: { id: ChaveOrdem; rotulo: string; dica: string; larga?: boolean }[] = [
  { id: "abertos", rotulo: "Abertos", dica: "Cards fora da coluna concluída e não fechados" },
  { id: "parados", rotulo: "Parados", dica: "Sem movimentação há 15 dias ou mais, fora do backlog e de interrompidas" },
  { id: "entradas", rotulo: "Entradas no mês", dica: "Cards criados no mês corrente", larga: true },
  { id: "saidas", rotulo: "Saídas no mês", dica: "Cards que chegaram à coluna concluída ou foram fechados no mês corrente", larga: true },
  { id: "ciclo", rotulo: "Ciclo 90 d", dica: "Dias corridos da criação à saída, nos últimos 90 dias: mediana e P85. — = nenhuma saída nos últimos 90 dias.", larga: true },
];

function VisaoGeral({ dados, agora, hrefDetalhe, aviso }: { dados: Dashboard; agora: Date; hrefDetalhe: (id: number) => string; aviso: React.ReactNode }) {
  const fluxo = dados.projetos_fluxo!;
  const [frente, setFrente] = useState<FrenteFluxo>("demais");
  const [busca, setBusca] = useState("");
  const [comSemMovimento, setComSemMovimento] = useState(false);
  const [ordem, setOrdem] = useState<{ chave: ChaveOrdem; desc: boolean }>({ chave: "parados", desc: true });
  const lista = ordenarProjetos(filtrarProjetos(fluxo, frente, busca, comSemMovimento), ordem.chave, ordem.desc, agora);
  const clicar = (chave: ChaveOrdem) =>
    setOrdem((o) => (o.chave === chave ? { chave, desc: !o.desc } : { chave, desc: chave !== "nome" }));
  const seta = (chave: ChaveOrdem) => ordem.chave === chave && <Icone nome={ordem.desc ? "baixo" : "cima"} tamanho={12} />;
  const sort = (chave: ChaveOrdem) => (ordem.chave === chave ? (ordem.desc ? "descending" : "ascending") : undefined);

  return (
    <div className="projetos">
      <div className="barra-acoes projetos__filtros" role="group" aria-label="Filtros de projetos">
        <div className="segmentado" role="radiogroup" aria-label="Frente">
          {FRENTES.map((f) => (
            <button key={f.id} role="radio" aria-checked={frente === f.id} className="segmentado__opcao" onClick={() => setFrente(f.id)}>
              {f.rotulo}
            </button>
          ))}
        </div>
        <label className="sr" htmlFor="busca-projeto">Buscar projeto</label>
        <input
          id="busca-projeto"
          className="campo"
          type="search"
          placeholder="Buscar projeto"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <label className="alternador">
          <input type="checkbox" checked={comSemMovimento} onChange={() => setComSemMovimento((v) => !v)} /> Mostrar projetos sem movimento
        </label>
        <Glossario termos={GLOSSARIO_PROJETOS} />
      </div>
      {aviso}

      <section className="bloco" aria-labelledby="t-projetos">
        <header className="bloco__cabeca">
          <h2 id="t-projetos" className="bloco__titulo">
            Projetos <span className="contagem">{lista.length}</span>
          </h2>
          <p className="nota">Parado: {fluxo.parado_dias} dias ou mais sem movimentação, fora do backlog e de interrompidas.</p>
        </header>
        {lista.length === 0 ? (
          <p className="vazio">{busca ? `Nenhum projeto com "${busca}".` : "Nenhum projeto neste filtro."}</p>
        ) : (
          <div className="rolavel-x">
            <table className="tabela projetos__tabela">
              <thead>
                <tr>
                  <th scope="col" aria-sort={sort("nome")}>
                    <button className="ordenar" onClick={() => clicar("nome")}>Projeto {seta("nome")}</button>
                  </th>
                  {COLUNAS.map((c) => (
                    <th key={c.id} scope="col" className={`num${c.larga ? " so-largo" : ""}`} title={c.dica} aria-sort={sort(c.id)}>
                      <button className="ordenar" onClick={() => clicar(c.id)}>{c.rotulo} {seta(c.id)}</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => (
                  <LinhaProjeto key={p.id} p={p} agora={agora} href={hrefDetalhe(p.id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function LinhaProjeto({ p, agora, href }: { p: ProjetoFluxo; agora: Date; href: string }) {
  const mes = mesAtual(p, agora);
  const n = abertos(p);
  return (
    <tr className={p.parados_total > 0 ? "linha-parada" : undefined} onClick={() => { window.location.hash = href; }}>
      <th scope="row">
        <a className="link-pessoa" href={href} onClick={(e) => e.stopPropagation()}>{nomeCurto(p.nome)}</a>
        {p.grupo === "qa" && <span className="meta"> Frente de QA</span>}
      </th>
      <td className={`num${n === 0 ? " zero" : ""}`}>{numero(n)}</td>
      <td className={`num${p.parados_total === 0 ? " zero" : ""}`}>{numero(p.parados_total)}</td>
      <td className={`num so-largo${!mes?.entradas ? " zero" : ""}`}>{numero(mes?.entradas ?? 0)}</td>
      <td className={`num so-largo${!mes?.saidas ? " zero" : ""}`}>
        {p.mede_saida ? numero(mes?.saidas ?? 0) : <span className="nao-medido">não medido</span>}
      </td>
      <td className="num so-largo">
        <Ciclo p={p} />
      </td>
    </tr>
  );
}

function Ciclo({ p }: { p: ProjetoFluxo }) {
  const c = p.ciclo_90d;
  if (!p.mede_saida) return <span className="nao-medido">não medido</span>;
  // "—" com a explicação no cabeçalho: o texto repetido em dezenas de linhas virava ruído.
  if (c.n === 0) return <span className="nao-medido" title="Nenhuma saída nos últimos 90 dias">—</span>;
  if (c.mediana === null) return <span className="nao-medido">poucos dados (n={c.n})</span>;
  return (
    <>
      {dias(c.mediana)}
      {/* P85 na mesma linha: em sub-linha a faixa mudava de altura (34 × 46px). */}
      <span className="ciclo__p85">P85 {dias(c.p85)}</span>
    </>
  );
}

function dias(v: number | null): string {
  if (v === null) return "—";
  return `${v < 10 ? v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : Math.round(v)} d`;
}

// --- Detalhe ---------------------------------------------------------------

function Detalhe({ p, parado, agora, hrefVoltar, aviso }: { p: ProjetoFluxo; parado: number; agora: Date; hrefVoltar: string; aviso: React.ReactNode }) {
  const tema = useTema();
  const atual = mesLocal(agora);
  const meses = p.mensal.map((m) => (m.ano_mes === atual ? `${mesCurto(m.ano_mes)} *` : mesCurto(m.ano_mes)));
  const chave = JSON.stringify(p.mensal) + tema;

  const fluxoOpcoes = useMemo<OpcoesGrafico>(() => {
    const b = base();
    const series: OpcoesGrafico["series"] = [
      { name: "Entradas", type: "bar", barMaxWidth: 28, data: p.mensal.map((m) => m.entradas), itemStyle: { color: cor("--n5") } },
    ];
    if (p.mede_saida) {
      series.push({ name: "Saídas", type: "bar", barMaxWidth: 28, data: p.mensal.map((m) => m.saidas), itemStyle: { color: cor("--n9") } });
    }
    return { ...b, xAxis: { ...(b.xAxis as object), data: meses }, series };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const cicloOpcoes = useMemo<OpcoesGrafico>(() => {
    const b = base();
    return {
      ...b,
      xAxis: { ...(b.xAxis as object), data: meses },
      yAxis: { ...(b.yAxis as object), min: 0, axisLabel: { color: cor("--tinta-3"), formatter: "{value} d" } },
      series: [
        { name: "Mediana", type: "line", data: p.mensal.map((m) => m.ciclo_mediana), itemStyle: { color: cor("--n9") }, lineStyle: { width: 2 }, symbolSize: 6 },
        { name: "P85", type: "line", data: p.mensal.map((m) => m.ciclo_p85), itemStyle: { color: cor("--n6") }, lineStyle: { width: 2, type: "dashed" }, symbolSize: 5 },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const temCiclo = p.mensal.some((m) => m.ciclo_mediana !== null);
  const naoMedido = <p className="vazio">Saída não medida: o quadro não tem coluna de concluído e nunca fechou cards.</p>;

  return (
    <div className="pessoa projeto">
      <header className="pessoa__cabeca">
        <a className="botao botao--leve" href={hrefVoltar}><Icone nome="voltar" /> Projetos</a>
        <div>
          <h1 className="pessoa__nome">{p.nome}</h1>
          <p className="meta">
            {p.grupo === "qa" ? "Frente de QA" : "Demais projetos"}
            {" · "}
            <a href={p.link} target="_blank" rel="noreferrer">Abrir quadro no Kanboard<span className="sr"> (em nova aba)</span></a>
          </p>
        </div>
        <p className="pessoa__periodo">{numero(abertos(p))} abertos · {numero(p.parados_total)} parados</p>
      </header>
      {aviso}

      <div className="pessoa__grade">
        <section className="bloco" aria-labelledby="t-colunas">
          <header className="bloco__cabeca">
            <h2 id="t-colunas" className="bloco__titulo">Abertos por coluna</h2>
          </header>
          <ul className="lista-simples projeto__colunas">
            {p.colunas.map((c, i) => (
              <li key={`${c.nome}-${i}`}>
                <span>
                  {c.nome}
                  {/* O papel só aparece quando o nome não o diz (ex.: "Feito" → concluída). */}
                  {NOME_PAPEL_COLUNA[c.papel] && semAcento(c.nome) !== NOME_PAPEL_COLUNA[c.papel] && (
                    <span className="meta"> · {NOME_PAPEL_COLUNA[c.papel]}</span>
                  )}
                </span>
                {c.papel === "concluida"
                  ? <span className="meta">saída do fluxo</span>
                  : <span className={`projeto__qtd${c.cards === 0 ? " zero" : ""}`}>{numero(c.cards)}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="bloco" aria-labelledby="t-fluxo">
          <header className="bloco__cabeca">
            <h2 id="t-fluxo" className="bloco__titulo">Entradas e saídas</h2>
            <p className="nota">Por mês, nos últimos 12 meses. * mês em andamento.</p>
          </header>
          <Grafico opcoes={fluxoOpcoes} altura={220} rotulo={`${p.nome}: entradas e saídas por mês`} />
          {!p.mede_saida && naoMedido}
        </section>

        <section className="bloco" aria-labelledby="t-ciclo">
          <header className="bloco__cabeca">
            <h2 id="t-ciclo" className="bloco__titulo">Tempo de ciclo</h2>
            <p className="nota">Dias corridos da criação à saída, pelo mês da saída. Meses com menos de 5 saídas ficam em branco.</p>
          </header>
          {!p.mede_saida
            ? naoMedido
            : temCiclo
              ? <Grafico opcoes={cicloOpcoes} altura={220} rotulo={`${p.nome}: mediana e P85 do tempo de ciclo por mês`} />
              : <p className="vazio">Poucos dados: nenhum mês teve 5 saídas ou mais.</p>}
        </section>

        <section className="bloco" aria-labelledby="t-parados">
          <header className="bloco__cabeca">
            <h2 id="t-parados" className="bloco__titulo">
              Parados <span className="contagem">{p.parados_total}</span>
            </h2>
            <p className="nota">{parado} dias ou mais sem movimentação.</p>
          </header>
          {p.parados.length === 0 ? (
            <p className="vazio">Nenhum card parado.</p>
          ) : (
            <div className="rolavel">
              <table className="tabela tabela--compacta">
                <thead>
                  <tr>
                    <th scope="col">Card</th>
                    <th scope="col">Título</th>
                    <th scope="col" className="num">Dias</th>
                  </tr>
                </thead>
                <tbody>
                  {p.parados.map((c) => {
                    const { resto } = separarEtiquetas(c.titulo || `Card #${c.task_id}`);
                    return (
                      <tr key={c.task_id}>
                        <td className="celula-card">
                          <a className="link-card" href={c.link} target="_blank" rel="noreferrer">#{c.task_id}<span className="sr"> (abre no Kanboard)</span></a>
                        </td>
                        <td className="celula-titulo">
                          <a href={c.link} target="_blank" rel="noreferrer" title={c.titulo}>{resto}</a>
                          <span className="meta">
                            <span>{c.coluna}</span>
                            {c.responsavel && <span className="meta__pessoa">{c.responsavel}</span>}
                          </span>
                        </td>
                        <td className="num">{c.dias}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {p.parados_total > p.parados.length && (
                <p className="nota projeto__mais">e mais {p.parados_total - p.parados.length} parado(s), dos mais recentes.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
