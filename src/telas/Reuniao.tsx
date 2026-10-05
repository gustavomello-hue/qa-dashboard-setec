import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Dashboard, Grupo, Pessoa as PessoaT, Prefixo } from "../data/contrato";
import type { Rota, TipoReuniao } from "../data/rota";
import { escreverRota } from "../data/rota";
import { NOME_PAPEL, dataCurta, dataHora, haDias, duracao, mesCurto, nomeCurto, numero, porcento, separarEtiquetas } from "../data/formato";
import { emAndamento, intervalo, intervaloAnterior, mesAnterior, mesesDisponiveis, rotuloAnterior, type Periodo } from "../data/periodo";
import { frasesQa, indiceProjetos, indiceTitulos, mesLocal, resumoPorMes, semReprovacao, type Filtro } from "../data/seletores";
import {
  GRUPOS_TABELA, ROTULO_GRUPO, atribuicoesDe, composicaoPorMes, concluidos, ehQa, indicePessoas, nomeDe,
  pessoasDoGrupo, resumirPorPessoa, resumoVazio, taxaReprovacao, taxaReprovacaoQa, testados, type Resumo,
} from "../data/pessoas";
import { cardsParaConversar, dividirEmLaminas, mesParcial, numerosDoMes, observacoesDoMes } from "../data/reuniao";
import { Grafico, base, cor, useTema, type OpcoesGrafico } from "../componentes/Grafico";
import { NotasQa } from "../componentes/NotasQa";

const PREFIXOS: Prefixo[] = ["DEV", "WEB", "MOB", "Demandas"];

interface Props {
  dados: Dashboard;
  rota: Rota;
  ir: (r: Partial<Rota>) => void;
  /** Faixa de coleta parada, mostrada na primeira lâmina. */
  aviso: ReactNode;
}

/** Mês da reunião. Sem escolha, o último mês fechado: é o que a reunião mensal revisa. */
function mesDo(rota: Rota): string {
  if (rota.periodo?.tipo === "mes") return rota.periodo.mes;
  const hoje = new Date();
  return mesLocal(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1));
}

// ==========================================================================
// Preparo: escolhe a reunião antes de projetar
// ==========================================================================

export function Reuniao({ dados, rota, ir, aviso }: Props) {
  if (rota.slide) return <Apresentacao dados={dados} rota={rota} ir={ir} aviso={aviso} />;

  const tipo: TipoReuniao = rota.reuniao ?? "mensal";
  const mes = mesDo(rota);
  const meses = mesesDisponiveis(dados.equipe?.desde ?? dados.regras.qa_confiavel_desde, new Date());
  const pessoas = (dados.equipe?.pessoas ?? [])
    .filter((p) => p.grupos.some((g) => GRUPOS_TABELA.includes(g)))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const pessoa = rota.pessoa ?? pessoas.find((p) => p.ativo !== false)?.user_id;
  const pronta = tipo === "mensal" || pessoa !== undefined;
  const destino: Rota = { ...rota, reuniao: tipo, periodo: { tipo: "mes", mes }, pessoa: tipo === "individual" ? pessoa : undefined, slide: 1 };

  return (
    <div className="preparo">
      <section className="bloco preparo__bloco" aria-labelledby="t-preparo">
        <header className="bloco__cabeca">
          <h2 id="t-preparo" className="bloco__titulo">Preparar a reunião</h2>
          <p className="nota">Uma lâmina por tela, para projetar. Setas ou espaço avançam, Esc volta para cá.</p>
          <NotasQa dados={dados} filtro={rota.filtro} meses={[mes]} />
        </header>

        <div className="preparo__campos">
          <fieldset className="preparo__campo">
            <legend>Reunião</legend>
            <div className="segmentado" role="radiogroup" aria-label="Tipo de reunião">
              {(["mensal", "individual"] as TipoReuniao[]).map((t) => (
                <button key={t} role="radio" aria-checked={tipo === t} className="segmentado__opcao" onClick={() => ir({ reuniao: t })}>
                  {t === "mensal" ? "Mensal da equipe" : "Conversa individual"}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="preparo__campo">
            <label htmlFor="reuniao-mes">Mês</label>
            <select
              id="reuniao-mes"
              className="campo"
              value={mes}
              onChange={(e) => ir({ periodo: { tipo: "mes", mes: e.target.value } })}
            >
              {meses.map((m) => (
                <option key={m} value={m}>{mesCurto(m)}{m === mesLocal(new Date()) ? " (em andamento)" : ""}</option>
              ))}
            </select>
          </div>

          {tipo === "individual" && (
            <div className="preparo__campo">
              <label htmlFor="reuniao-pessoa">Pessoa</label>
              <select
                id="reuniao-pessoa"
                className="campo"
                value={pessoa ?? ""}
                onChange={(e) => ir({ pessoa: Number(e.target.value) })}
              >
                {GRUPOS_TABELA.map((g) => {
                  const doGrupo = pessoas.filter((p) => p.grupos[0] === g || (g !== "qa" && p.grupos.includes(g) && !p.grupos.includes("qa")));
                  return doGrupo.length ? (
                    <optgroup key={g} label={ROTULO_GRUPO[g]}>
                      {doGrupo.map((p) => (
                        <option key={p.user_id} value={p.user_id}>{p.nome}{p.ativo === false ? " (saiu)" : ""}</option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </select>
            </div>
          )}

          <fieldset className="preparo__campo">
            <legend>Frente</legend>
            <div className="segmentado" role="radiogroup" aria-label="Frente">
              {[undefined, ...PREFIXOS].map((p) => (
                <button
                  key={p ?? "todas"}
                  role="radio"
                  aria-checked={rota.filtro.prefixo === p}
                  className="segmentado__opcao"
                  onClick={() => ir({ filtro: p ? { prefixo: p } : {} })}
                >
                  {p ?? "Todas"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <p className="preparo__resumo">
          {tipo === "mensal"
            ? "Lâminas: o mês em números · volume e grupos · DEV · QA e estagiários · o que não foi medido."
            : "Lâminas: os três números da pessoa · os cards para conversar. Nenhuma outra pessoa aparece."}
        </p>
        <a className={`botao botao--primario${pronta ? "" : " botao--inerte"}`} href={pronta ? escreverRota(destino) : undefined} aria-disabled={!pronta}>
          Começar a apresentação
        </a>
      </section>
    </div>
  );
}

// ==========================================================================
// Apresentação
// ==========================================================================

/** Altura da janela: decide quantas linhas de tabela cabem numa lâmina. */
function useAltura(): number {
  const [h, setH] = useState(() => window.innerHeight);
  useEffect(() => {
    const aoMudar = () => setH(window.innerHeight);
    window.addEventListener("resize", aoMudar);
    return () => window.removeEventListener("resize", aoMudar);
  }, []);
  return h;
}

interface Lamina {
  titulo: string;
  corpo: ReactNode;
  /** Números grandes: centralizados na altura, para não sobrar meia tela vazia. */
  centrar?: boolean;
}

function Apresentacao({ dados, rota, ir, aviso }: Props) {
  const altura = useAltura();
  const tipo: TipoReuniao = rota.reuniao ?? "mensal";
  const mes = mesDo(rota);
  const periodo: Periodo = { tipo: "mes", mes };
  const filtro = rota.filtro;
  const frente = filtro.prefixo ? ` · ${filtro.prefixo}` : "";
  const andamento = emAndamento(periodo, new Date());

  const laminas: Lamina[] =
    tipo === "mensal"
      ? laminasMensal(dados, periodo, filtro, altura, aviso)
      : laminasIndividual(dados, periodo, filtro, rota.pessoa, aviso);

  const total = laminas.length;
  const atual = Math.min(Math.max(1, rota.slide ?? 1), total);
  // A lâmina corrente mora num ref: duas setas antes do React redesenhar
  // avançam duas lâminas, não uma.
  const atualRef = useRef(atual);
  atualRef.current = atual;
  const irPara = (n: number) => {
    const alvo = Math.min(Math.max(1, n), total);
    atualRef.current = alvo;
    ir({ slide: alvo });
  };
  const sair = () => ir({ slide: undefined });

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        irPara(atualRef.current + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        irPara(atualRef.current - 1);
      } else if (e.key === "Home") irPara(1);
      else if (e.key === "End") irPara(total);
      else if (e.key === "Escape") sair();
      else if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  });

  const lamina = laminas[atual - 1];
  const quem = tipo === "individual" && rota.pessoa !== undefined ? indicePessoas(dados).get(rota.pessoa)?.nome : undefined;

  return (
    <div className="apresentacao" role="region" aria-roledescription="apresentação" aria-label={`Reunião ${tipo === "mensal" ? "mensal" : "individual"}`}>
      <header className="apresentacao__cabeca">
        <p className="apresentacao__contexto">
          <span className="marca__qa">QA</span> {tipo === "mensal" ? "Reunião mensal" : `Conversa individual · ${quem ?? ""}`} ·{" "}
          {mesCurto(mes)}{andamento ? " (em andamento)" : ""}{frente}
        </p>
        <h1 className="apresentacao__titulo">{lamina.titulo}</h1>
      </header>

      {/* Clique na metade direita avança, na esquerda volta. */}
      <p className="sr" aria-live="polite">Lâmina {atual} de {total}: {lamina.titulo}</p>
      <main
        className={`apresentacao__corpo${lamina.centrar ? " apresentacao__corpo--centro" : ""}`}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          irPara(e.clientX > r.left + r.width / 2 ? atualRef.current + 1 : atualRef.current - 1);
        }}
      >
        {lamina.corpo}
      </main>

      <footer className="apresentacao__rodape">
        <button className="botao botao--leve" onClick={sair}>Esc · sair</button>
        <span className="apresentacao__dica">→ avança · ← volta · F tela cheia</span>
        <span className="apresentacao__contador num" aria-label={`Lâmina ${atual} de ${total}`}>{atual}/{total}</span>
      </footer>
    </div>
  );
}

// --------------------------------------------------------------------------
// Peças das lâminas
// --------------------------------------------------------------------------

function Numero({ rotulo, valor, unidade, tom, apoio, anterior }: { rotulo: string; valor: string; unidade?: string; tom?: string; apoio?: ReactNode; anterior?: string }) {
  return (
    <div className={`grande faixa--${tom ?? "neutro"}`}>
      <dt className="grande__rotulo">{rotulo}</dt>
      <dd className="grande__valor num">
        {valor}
        {unidade && <span className="grande__unidade"> {unidade}</span>}
      </dd>
      {apoio && <dd className="grande__apoio">{apoio}</dd>}
      {anterior && <dd className="grande__anterior">{anterior}</dd>}
    </div>
  );
}

function variacao(atual: number | null, anterior: number | null | undefined, unidade = ""): string {
  if (anterior === undefined || anterior === null || atual === null) return "";
  const d = Math.round((atual - anterior) * 10) / 10;
  return d === 0 ? " (=)" : ` (${d > 0 ? "+" : "−"}${Math.abs(d).toLocaleString("pt-BR")}${unidade})`;
}

/**
 * "ago/26: 364 (−35)". Contra um mês medido só em parte, o rótulo diz
 * "(parcial)" e o sinal sai: 26 contra 1 de um mês reconstruído não é queda nem alta.
 */
function comparacao(rotulo: string, parcial: boolean, texto: string, atual: number | null, anterior: number | null, unidade = ""): string {
  return parcial ? `${rotulo} (parcial): ${texto}` : `${rotulo}: ${texto}${variacao(atual, anterior, unidade)}`;
}

// --------------------------------------------------------------------------
// Reunião mensal
// --------------------------------------------------------------------------

function laminasMensal(d: Dashboard, periodo: Periodo, filtro: Filtro, altura: number, aviso: ReactNode): Lamina[] {
  const mes = periodo.tipo === "mes" ? periodo.mes : mesLocal(new Date());
  const agora = new Date();
  const { atual: n, anterior: a } = numerosDoMes(d, filtro, mes);
  const antes = mesCurto(n && a ? a.mes : mes);
  const baseParcial = a ? mesParcial(d, a.mes) : false;
  const laminas: Lamina[] = [];

  laminas.push({
    titulo: "O mês em números",
    centrar: true,
    corpo: (
      <>
        {aviso}
        {!n ? (
          <p className="vazio grande-vazio">Sem medição de QA em {mesCurto(mes)}.</p>
        ) : (
          <dl className="grandes">
            <Numero rotulo="Entraram em QA" tom="entrada" valor={numero(n.entradas)}
              anterior={a ? comparacao(antes, baseParcial, numero(a.entradas), n.entradas, a.entradas) : undefined} />
            <Numero rotulo="Aprovados" tom="aprovado" valor={numero(n.aprovados)}
              anterior={a ? comparacao(antes, baseParcial, numero(a.aprovados), n.aprovados, a.aprovados) : undefined} />
            <Numero rotulo="Reprovados" tom="reprovado" valor={numero(n.reprovados)}
              anterior={a ? comparacao(antes, baseParcial, numero(a.reprovados), n.reprovados, a.reprovados) : undefined} />
            <Numero
              rotulo="% cards reprovados"
              valor={porcento(n.taxa)}
              apoio={`${n.cardsReprovados} de ${n.cardsJulgados} cards julgados`}
              anterior={a ? comparacao(antes, baseParcial, porcento(a.taxa), n.taxa, a.taxa, " p.p.") : undefined}
            />
            <Numero
              rotulo="Tempo médio em QA"
              valor={n.tempoMedioH === null ? "—" : numero(Math.round(n.tempoMedioH))}
              unidade={n.tempoMedioH === null ? undefined : "h"}
              apoio={n.tempoMedioH === null ? undefined : `cerca de ${duracao(n.tempoMedioH * 3600)} por passagem`}
              anterior={
                a && a.tempoMedioH !== null
                  ? comparacao(antes, baseParcial, `${numero(Math.round(a.tempoMedioH))} h`,
                      n.tempoMedioH === null ? null : Math.round(n.tempoMedioH), Math.round(a.tempoMedioH), " h")
                  : undefined
              }
            />
          </dl>
        )}
        {n && emAndamento(periodo, agora) && (
          <p className="nota grande-nota">{mesCurto(mes)} ainda está em andamento: a comparação é com {antes} inteiro.</p>
        )}
        {n && !emAndamento(periodo, agora) && n.completude.startsWith("parcial") && (
          <p className="nota grande-nota">Medição de {mesCurto(mes)} parcial: parte do mês foi reconstruída.</p>
        )}
        {baseParcial && (
          <p className="nota grande-nota">{antes} foi medido só em parte: serve de referência, não de comparação.</p>
        )}
        {frasesQa(d, filtro, [mes]).map((f) => <p key={f} className="nota grande-nota">{f}</p>)}
      </>
    ),
  });

  laminas.push({ titulo: "Volume e grupos", corpo: <VolumeEGrupos d={d} filtro={filtro} ate={mes} /> });

  // Tabelas por pessoa: DEV numa (ou mais) lâmina; QA e estagiários em seguida.
  const atual = intervalo(periodo, agora);
  const ant = intervaloAnterior(periodo, agora);
  const { porPessoa } = resumirPorPessoa(atribuicoesDe(d, atual, filtro), semReprovacao(d));
  const { porPessoa: porPessoaAntes } = resumirPorPessoa(atribuicoesDe(d, ant, filtro), semReprovacao(d));
  // Altura de uma linha da tabela projetada, pela mesma escala --r-* do CSS:
  // dado = clamp(16px, 2.2vh, 24px) com 1,45 de entrelinha, respiro = clamp(4px, 0.7vh, 10px).
  // Sobram ~290px para cabeça, cabeçalho da tabela e rodapé.
  const dado = Math.min(24, Math.max(16, altura * 0.022));
  const respiro = Math.min(10, Math.max(4, altura * 0.007));
  const alturaLinha = dado * 1.45 + 2 * respiro + 1;
  const linhasPorLamina = Math.max(4, Math.floor((altura - 290) / alturaLinha));
  const parcialAnt = periodo.tipo === "mes" && mesParcial(d, mesAnterior(periodo.mes));
  const rotuloAnt = rotuloAnterior(periodo, agora) + (parcialAnt ? " (parcial)" : "");

  const devs = pessoasDoGrupo(d, "dev", false);
  dividirEmLaminas(devs, linhasPorLamina).forEach((parte, i, todas) => {
    laminas.push({
      titulo: todas.length > 1 ? `DEV (${i + 1} de ${todas.length})` : "DEV",
      corpo: <TabelaReuniao pessoas={parte} tipo="dev" atual={porPessoa} antes={porPessoaAntes} rotuloAnterior={rotuloAnt} semDelta={parcialAnt} />,
    });
  });

  const outros: { g: Grupo; tipo: "dev" | "qa" }[] = [
    { g: "qa", tipo: "qa" },
    { g: "estagiario_dev", tipo: "dev" },
  ];
  const secao = ({ g, tipo }: { g: Grupo; tipo: "dev" | "qa" }) => (
    <section key={g}>
      <h2 className="grupo-reuniao__titulo">{ROTULO_GRUPO[g]}</h2>
      <TabelaReuniao pessoas={pessoasDoGrupo(d, g, false)} tipo={tipo} atual={porPessoa} antes={porPessoaAntes} rotuloAnterior={rotuloAnt} semDelta={parcialAnt} />
    </section>
  );
  // Juntas se couberem (cada grupo gasta ~2 linhas de título e cabeçalho); senão, uma lâmina cada.
  const linhasOutros = outros.reduce((s, o) => s + pessoasDoGrupo(d, o.g, false).length + 2, 0);
  if (linhasOutros <= linhasPorLamina) {
    laminas.push({ titulo: "QA e estagiários", corpo: <div className="grupos-reuniao">{outros.map(secao)}</div> });
  } else {
    for (const o of outros) laminas.push({ titulo: ROTULO_GRUPO[o.g], corpo: <div className="grupos-reuniao">{secao(o)}</div> });
  }

  const obs = observacoesDoMes(d, atual, filtro);
  const pessoas = indicePessoas(d);
  laminas.push({
    titulo: "O que não foi medido",
    corpo: (
      <ul className="observacoes">
        <li>
          <strong>{numero(obs.semAutor)}</strong> saída{obs.semAutor === 1 ? "" : "s"} de Teste/QA sem autor registrado no Kanboard. Não são atribuídas a ninguém.
        </li>
        <li>
          {obs.naoQa.length === 0 ? (
            "Nenhuma saída de Teste/QA feita por quem não é do QA."
          ) : (
            <>
              <strong>{numero(obs.naoQa.reduce((s, x) => s + x.saidas, 0))}</strong> saídas de Teste/QA feitas por quem não é do QA:{" "}
              {obs.naoQa.map((x, i) => (
                <span key={x.user_id}>{i > 0 && ", "}{nomeDe(pessoas, x.user_id)} ({x.saidas})</span>
              ))}
              .
            </>
          )}
        </li>
        <li>
          {obs.lacunas.length === 0
            ? "Coleta contínua no expediente durante o mês."
            : `${obs.lacunas.length} lacuna${obs.lacunas.length > 1 ? "s" : ""} de coleta no mês: ${obs.lacunas
                .map((l) => `${dataHora(l.inicio)} a ${dataHora(l.fim)} (${l.horas_expediente.toLocaleString("pt-BR")} h)`)
                .join("; ")}.`}
        </li>
        <li>Medição de QA confiável desde {mesCurto(d.regras.qa_confiavel_desde)}: antes disso só há amostra incompleta.</li>
      </ul>
    ),
  });
  return laminas;
}

function VolumeEGrupos({ d, filtro, ate }: { d: Dashboard; filtro: Filtro; ate: string }) {
  const tema = useTema();
  const linhas = resumoPorMes(d, filtro).filter((l) => l.ano_mes <= ate);
  const composicao = composicaoPorMes(d, filtro).filter((c) => c.ano_mes <= ate);
  const chave = linhas.map((l) => l.ano_mes + l.entradas).join() + composicao.map((c) => JSON.stringify(c.entregues)).join() + tema;
  // Na projeção ninguém passa o mouse: o número vai escrito na barra. Mês parcial vem marcado.
  const rotulo = (m: string) => (mesParcial(d, m) ? `${mesCurto(m)} (parcial)` : mesCurto(m));
  const valorNaBarra = { show: true, position: "top" as const, fontSize: 16, color: cor("--tinta-1") };

  const grande = (o: OpcoesGrafico): OpcoesGrafico => {
    const fonte = { fontSize: 16 };
    return {
      ...o,
      legend: { ...(o.legend as object), itemWidth: 14, itemHeight: 14, textStyle: { color: cor("--tinta-1"), ...fonte } },
      xAxis: { ...(o.xAxis as object), axisLabel: { ...((o.xAxis as { axisLabel?: object }).axisLabel ?? {}), ...fonte } },
      yAxis: { ...(o.yAxis as object), axisLabel: { ...((o.yAxis as { axisLabel?: object }).axisLabel ?? {}), ...fonte } },
      grid: { left: 8, right: 8, top: 44, bottom: 4, containLabel: true },
    };
  };

  const volume = useMemo<OpcoesGrafico>(() => {
    const b = base();
    return grande({
      ...b,
      xAxis: { ...(b.xAxis as object), data: linhas.map((l) => rotulo(l.ano_mes)) },
      series: [
        { name: "Entraram", type: "bar", barMaxWidth: 40, label: valorNaBarra, data: linhas.map((l) => l.entradas), itemStyle: { color: cor("--entrada") } },
        { name: "Aprovados", type: "bar", barMaxWidth: 40, label: valorNaBarra, data: linhas.map((l) => l.aprovados), itemStyle: { color: cor("--aprovado") } },
        { name: "Reprovados", type: "bar", barMaxWidth: 40, label: valorNaBarra, data: linhas.map((l) => l.reprovados), itemStyle: { color: cor("--reprovado") } },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const grupos = useMemo<OpcoesGrafico>(() => {
    const b = base();
    const ordem: Grupo[] = ["dev", "estagiario_dev", "qa", "estagiario_qa", "gestao", "outros"];
    const tokens: Record<Grupo, string> = {
      dev: "--grupo-dev", estagiario_dev: "--grupo-est-dev", qa: "--grupo-qa", estagiario_qa: "--grupo-est-qa", gestao: "--grupo-gestao", outros: "--grupo-outros",
    };
    return grande({
      ...b,
      xAxis: { ...(b.xAxis as object), data: composicao.map((c) => rotulo(c.ano_mes)) },
      series: ordem
        .filter((g) => composicao.some((c) => c.entregues[g] > 0))
        .map((g) => ({
          name: ROTULO_GRUPO[g], type: "bar" as const, stack: "t", barMaxWidth: 40,
          data: composicao.map((c) => c.entregues[g]), itemStyle: { color: cor(tokens[g]) },
        })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return (
    <div className="graficos-reuniao">
      <section>
        <h2 className="grupo-reuniao__titulo">Volume de QA por mês</h2>
        <Grafico opcoes={volume} altura={Math.max(220, window.innerHeight - 380)} rotulo="Entradas, aprovados e reprovados por mês" />
      </section>
      <section>
        <h2 className="grupo-reuniao__titulo">Entregas para QA por grupo</h2>
        <Grafico opcoes={grupos} altura={Math.max(220, window.innerHeight - 380)} rotulo="Entregas para QA por mês, por grupo" />
      </section>
    </div>
  );
}

function TabelaReuniao({
  pessoas, tipo, atual, antes, rotuloAnterior, semDelta = false,
}: {
  pessoas: PessoaT[];
  tipo: "dev" | "qa";
  atual: Map<number, Resumo>;
  antes: Map<number, Resumo>;
  rotuloAnterior: string;
  /** Base parcial: sem sinal de variação. */
  semDelta?: boolean;
}) {
  const colunas: { rotulo: string; valor: (r: Resumo) => number | null; pct?: boolean }[] =
    tipo === "dev"
      ? [
          { rotulo: "Entregues", valor: (r) => r.entregues },
          { rotulo: "Aprovados", valor: (r) => r.aprovados },
          { rotulo: "Reprovações", valor: (r) => r.reprovacoes },
          { rotulo: "% cards reprov.", valor: (r) => taxaReprovacao(r), pct: true },
          { rotulo: "Concluídos", valor: (r) => concluidos(r) },
          { rotulo: "Sem QA", valor: (r) => r.concluidosSemQa },
        ]
      : [
          { rotulo: "Testados", valor: (r) => testados(r) },
          { rotulo: "Aprovou", valor: (r) => r.testouAprovado },
          { rotulo: "Reprovou", valor: (r) => r.testouReprovado },
          { rotulo: "% cards reprov.", valor: (r) => taxaReprovacaoQa(r), pct: true },
          { rotulo: "Devolveu", valor: (r) => r.testouDevolvido },
        ];
  if (pessoas.length === 0) return <p className="vazio">Ninguém neste grupo.</p>;
  return (
    <table className="tabela tabela--reuniao">
      <caption className="sr">{semDelta ? `Comparação com ${rotuloAnterior} omitida` : `Diferença para ${rotuloAnterior} ao lado de cada número`}</caption>
      <thead>
        <tr>
          <th scope="col">Pessoa</th>
          {colunas.map((c) => (
            <th key={c.rotulo} scope="col" className="num">{c.rotulo}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pessoas.map((p) => {
          const r = atual.get(p.user_id) ?? resumoVazio();
          const a = antes.get(p.user_id) ?? resumoVazio();
          return (
            <tr key={p.user_id}>
              <th scope="row">{p.nome}</th>
              {colunas.map((c) => {
                const v = c.valor(r);
                const va = c.valor(a);
                const dif = semDelta || v === null || va === null || (v === 0 && va === 0) ? null : Math.round((v - va) * 10) / 10;
                return (
                  <td key={c.rotulo} className={`num${!v ? " zero" : ""}`}>
                    {v === null ? "—" : c.pct ? porcento(v) : numero(v)}
                    {dif !== null && (
                      <span className="delta">
                        <span className="sr">variação: </span>
                        {dif === 0 ? "=" : `${dif > 0 ? "+" : "−"}${Math.abs(dif).toLocaleString("pt-BR")}${c.pct ? " p.p." : ""}`}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// --------------------------------------------------------------------------
// Conversa individual
// --------------------------------------------------------------------------

function laminasIndividual(d: Dashboard, periodo: Periodo, filtro: Filtro, uid: number | undefined, aviso: ReactNode): Lamina[] {
  const pessoa = uid !== undefined ? indicePessoas(d).get(uid) : undefined;
  if (!pessoa || uid === undefined) {
    return [{ titulo: "Pessoa não encontrada", corpo: <p className="vazio grande-vazio">Volte (Esc) e escolha uma pessoa.</p> }];
  }
  const agora = new Date();
  const atual = intervalo(periodo, agora);
  const r = resumirPorPessoa(atribuicoesDe(d, atual, filtro), semReprovacao(d)).porPessoa.get(uid) ?? resumoVazio();
  const a = resumirPorPessoa(atribuicoesDe(d, intervaloAnterior(periodo, agora), filtro), semReprovacao(d)).porPessoa.get(uid) ?? resumoVazio();
  const baseParcial = periodo.tipo === "mes" && mesParcial(d, mesAnterior(periodo.mes));
  const antes = rotuloAnterior(periodo, agora);
  const qa = ehQa(pessoa);
  const mes = periodo.tipo === "mes" ? mesCurto(periodo.mes) : "";
  const semNada = qa ? testados(r) === 0 && r.criados === 0 : r.entregues === 0 && concluidos(r) === 0 && r.reprovacoes === 0;

  const comp = (vAtual: number, vAntes: number) => comparacao(antes, baseParcial, numero(vAntes), vAtual, vAntes);
  const numeros = qa ? (
    <dl className="grandes grandes--tres">
      <Numero rotulo="Testados" tom="entrada" valor={numero(testados(r))} anterior={comp(testados(r), testados(a))} />
      <Numero rotulo="Aprovou" tom="aprovado" valor={numero(r.testouAprovado)} anterior={comp(r.testouAprovado, a.testouAprovado)} />
      <Numero
        rotulo="Reprovou"
        tom="reprovado"
        valor={numero(r.testouReprovado)}
        apoio={r.cardsTestados ? `${r.cardsTestadosReprovados} de ${r.cardsTestados} cards testados (${porcento(taxaReprovacaoQa(r))})` : undefined}
        anterior={comp(r.testouReprovado, a.testouReprovado)}
      />
    </dl>
  ) : (
    <dl className="grandes grandes--tres">
      <Numero rotulo="Entregues para QA" tom="entrada" valor={numero(r.entregues)} anterior={comp(r.entregues, a.entregues)} />
      <Numero
        rotulo="Reprovações"
        tom="reprovado"
        valor={numero(r.reprovacoes)}
        apoio={r.cardsJulgados ? `${r.cardsReprovados} de ${r.cardsJulgados} cards julgados (${porcento(taxaReprovacao(r))})` : undefined}
        anterior={comp(r.reprovacoes, a.reprovacoes)}
      />
      <Numero
        rotulo="Concluídos"
        valor={numero(concluidos(r))}
        apoio={`${r.aprovados} aprovados em QA · ${r.concluidosSemQa} sem QA`}
        anterior={comp(concluidos(r), concluidos(a))}
      />
    </dl>
  );

  const cards = cardsParaConversar(d, uid, atual, filtro, qa);
  const titulos = indiceTitulos(d);
  const projetos = indiceProjetos(d);
  const titulo = (task: number) => separarEtiquetas(titulos.get(task) ?? "").resto || "Título não registrado";

  return [
    {
      titulo: pessoa.nome,
      centrar: true,
      corpo: (
        <>
          {aviso}
          <p className="grande-sub">{pessoa.grupos.map((g) => ROTULO_GRUPO[g]).join(" · ")} · {mes}</p>
          {semNada ? <p className="vazio grande-vazio">Sem movimentações em {mes}.</p> : numeros}
          {baseParcial && !semNada && (
            <p className="nota grande-nota">{antes} foi medido só em parte: serve de referência, não de comparação.</p>
          )}
          {!semNada && periodo.tipo === "mes" && frasesQa(d, filtro, [periodo.mes]).map((f) => <p key={f} className="nota grande-nota">{f}</p>)}
        </>
      ),
    },
    {
      titulo: "Cards para conversar",
      corpo: (
        <div className="conversa">
          <ListaConversa
            titulo={qa ? "Reprovou mais de uma vez" : "Reprovados mais de uma vez"}
            vazio="Nenhum card reprovado mais de uma vez no mês."
            itens={cards.reprovadosVariasVezes.map((c) => ({ id: c.task_id, titulo: titulo(c.task_id), meta: `${nomeCurto(projetos.get(c.project_id) ?? "")} · reprovado ${c.vezes}×` }))}
            total={cards.totais.reprovados}
          />
          {!qa && (
            <ListaConversa
              titulo="Concluídos sem QA"
              vazio="Nenhum card concluído sem passar pelo QA no mês."
              itens={cards.semQa.map((c) => ({ id: c.task_id, titulo: titulo(c.task_id), meta: `${nomeCurto(projetos.get(c.project_id) ?? "")} · ${dataCurta(c.ultimo)}` }))}
              total={cards.totais.semQa}
            />
          )}
          <ListaConversa
            titulo={qa ? "Abertos há mais tempo" : "Abertos há mais tempo (fora de Teste/QA)"}
            vazio="Nenhum card aberto agora."
            total={cards.totais.abertos}
            itens={cards.abertosMaisAntigos.map((c) => ({
              id: c.task_id,
              titulo: titulo(c.task_id),
              meta: `${NOME_PAPEL[c.papel] ?? c.coluna} · ${haDias(c.desde)}`,
            }))}
          />
        </div>
      ),
    },
  ];
}

function ListaConversa({
  titulo, itens, vazio, total,
}: {
  titulo: string;
  itens: { id: number; titulo: string; meta: string }[];
  vazio: string;
  /** Quantos existem antes do corte da lâmina. */
  total: number;
}) {
  return (
    <section className="conversa__coluna">
      <h2 className="grupo-reuniao__titulo">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="vazio">{vazio}</p>
      ) : (
        <ul className="conversa__lista">
          {itens.map((i) => (
            <li key={i.id}>
              <span className="num conversa__id">#{i.id}</span>
              <span className="conversa__titulo">{i.titulo}</span>
              <span className="meta">{i.meta}</span>
            </li>
          ))}
          {total > itens.length && <li className="conversa__mais">e mais {total - itens.length}</li>}
        </ul>
      )}
    </section>
  );
}
