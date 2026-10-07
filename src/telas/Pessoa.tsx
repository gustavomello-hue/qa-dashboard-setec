import { useMemo } from "react";
import type { Dashboard } from "../data/contrato";
import { NOME_PAPEL, dataCurta, haDias, nomeCurto, numero, porcento, separarEtiquetas } from "../data/formato";
import { intervalo, intervaloAnterior, mesAnterior, rotuloAnterior, rotuloPeriodoLongo, ultimoDia, type Periodo } from "../data/periodo";
import { mesParcial } from "../data/reuniao";
import { indiceProjetos, indiceTitulos, mesLocal, semReprovacao, type Filtro } from "../data/seletores";
import {
  ROTULO_GRUPO, atribuicoesDe, inicioDaSemana, semanaIncompleta, cardsAbertos, cardsDaMetrica, cargaPorPessoa, cargaVazia, concluidos, ehQa,
  indicePessoas, nomeDe, porSemana, projetosTestados, resumirPorPessoa, resumoVazio, semanas, taxaReprovacao,
  taxaReprovacaoQa, testados, PAPEIS_CARGA, type CardContado,
} from "../data/pessoas";
import { Kpi } from "../componentes/Kpi";
import { DEFINICAO } from "../data/glossario";
import { BarraCarga, LegendaCarga } from "../componentes/BarraCarga";
import { Grafico, base, cor, useTema, type OpcoesGrafico } from "../componentes/Grafico";
import { Icone } from "../componentes/Icone";
import { NotasQa } from "../componentes/NotasQa";
import type { Consulta, MetricaLista } from "../data/listas";

interface Props {
  dados: Dashboard;
  filtro: Filtro;
  periodo: Periodo;
  uid?: number;
  hrefCard: (id: number) => string;
  /** Link de volta para a Equipe (mantém filtros e período). */
  hrefVoltar: string;
  /** Números viram links para a lista de cards. */
  hrefLista?: (c: Consulta) => string;
}

const SEMANAS = 12;

export function Pessoa({ dados, filtro, periodo, uid, hrefCard, hrefVoltar, hrefLista }: Props) {
  const pessoas = indicePessoas(dados);
  const pessoa = uid !== undefined ? pessoas.get(uid) : undefined;
  const tema = useTema();
  const agora = new Date();
  const atual = intervalo(periodo, agora);
  const atribs = atribuicoesDe(dados, atual, filtro);
  const r = (uid !== undefined && resumirPorPessoa(atribs, semReprovacao(dados)).porPessoa.get(uid)) || resumoVazio();
  const a = (uid !== undefined && resumirPorPessoa(atribuicoesDe(dados, intervaloAnterior(periodo, agora), filtro), semReprovacao(dados)).porPessoa.get(uid)) || resumoVazio();
  const lista = (metrica: MetricaLista) => (uid === undefined ? undefined : hrefLista?.({ metrica, periodo, pessoa: uid, filtro }));
  // Base medida só em parte: o rótulo avisa, para "ago/26: 1" não virar comparação.
  const antes = rotuloAnterior(periodo, agora) + (periodo.tipo === "mes" && mesParcial(dados, mesAnterior(periodo.mes)) ? " (parcial)" : "");
  const qa = pessoa ? ehQa(pessoa) : false;
  const dev = pessoa ? pessoa.grupos.some((g) => g === "dev" || g === "estagiario_dev") || r.entregues > 0 : false;

  // Antes de `desde` não há atribuição: semanas vazias ali pareceriam queda.
  const desde = dados.equipe?.desde ?? dados.regras.qa_confiavel_desde;
  const inicios = semanas(ultimoDia(atual, agora), SEMANAS).filter((s) => s >= inicioDaSemana(`${desde}-01`));
  const historico = atribuicoesDe(dados, { de: inicios[0], ate: atual.ate }, filtro);
  const parcial = semanaIncompleta(ultimoDia(atual, agora));
  // A última semana, se ainda está em curso, sai vazada: não é queda, é semana pela metade.
  const serie = (metricas: Parameters<typeof porSemana>[2]) => {
    const valores = uid === undefined ? [] : porSemana(historico, uid, metricas, inicios);
    return valores.map((v, i) =>
      parcial && i === valores.length - 1
        ? { value: v, itemStyle: { color: "transparent", borderColor: cor("--tinta-2"), borderWidth: 1 } }
        : v,
    );
  };

  const opcoes = useMemo<OpcoesGrafico>(() => {
    const series = qa
      ? [
          { name: "Aprovou", type: "bar" as const, barMaxWidth: 28, data: serie(["testou_aprovado"]), itemStyle: { color: cor("--aprovado") } },
          { name: "Reprovou", type: "bar" as const, barMaxWidth: 28, data: serie(["testou_reprovado"]), itemStyle: { color: cor("--reprovado") } },
        ]
      : [
          { name: "Entregues", type: "bar" as const, barMaxWidth: 28, data: serie(["entregue_qa"]), itemStyle: { color: cor("--entrada") } },
          { name: "Aprovados", type: "bar" as const, barMaxWidth: 28, data: serie(["aprovado"]), itemStyle: { color: cor("--aprovado") } },
          { name: "Reprovações", type: "bar" as const, barMaxWidth: 28, data: serie(["reprovado"]), itemStyle: { color: cor("--reprovado") } },
        ];
    const b = base();
    return { ...b, xAxis: { ...(b.xAxis as object), data: inicios.map((s) => s.slice(8) + "/" + s.slice(5, 7)) }, series };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, qa, tema, JSON.stringify(inicios), atribs.length, filtro.prefixo, filtro.projeto]);

  if (!pessoa || uid === undefined) {
    return (
      <div className="vazio">
        <p>Pessoa não encontrada.</p>
        <a className="botao" href={hrefVoltar}><Icone nome="voltar" /> Voltar para a equipe</a>
      </div>
    );
  }

  const titulos = indiceTitulos(dados);
  const projetos = indiceProjetos(dados);
  const carga = cargaPorPessoa(dados, filtro).get(uid) ?? cargaVazia();
  const abertos = cardsAbertos(dados, uid, filtro);
  const reprovados = cardsDaMetrica(atribs, uid, qa ? "testou_reprovado" : "reprovado");
  const semQa = cardsDaMetrica(atribs, uid, "concluido_sem_qa");
  const testadosPorProjeto = qa ? projetosTestados(atribs, uid) : [];

  return (
    <div className="pessoa">
      <header className="pessoa__cabeca">
        <a className="botao botao--leve" href={hrefVoltar}><Icone nome="voltar" /> Equipe</a>
        <div>
          <h1 className="pessoa__nome">{pessoa.nome}</h1>
          <p className="meta">
            {pessoa.grupos.map((g) => ROTULO_GRUPO[g]).join(" · ")}
            {pessoa.ativo === false && " · saiu da equipe"}
            {pessoa.nome_kanboard && pessoa.nome_kanboard !== pessoa.nome && ` · ${pessoa.nome_kanboard}`}
          </p>
        </div>
        <p className="pessoa__periodo">{rotuloPeriodoLongo(periodo, agora)}</p>
      </header>
      <NotasQa dados={dados} filtro={filtro} meses={[periodo.tipo === "mes" ? periodo.mes : mesLocal(agora)]} />

      {/* Primeiro o fluxo (entregou → aprovado/reprovado → concluiu), depois o resto em tamanho
          menor. A taxa vira contexto da reprovação, não um número de veredito ao lado das contagens. */}
      {dev && (
        <section className="numeros" aria-labelledby="t-fluxo-dev">
          <h2 id="t-fluxo-dev" className="numeros__titulo">Fluxo dos cards · como responsável</h2>
          <dl className="kpis kpis--fluxo">
            <Kpi rotulo="Entregues para QA" href={lista("entregue_qa")} valor={r.entregues} anterior={a.entregues} rotuloAnterior={antes} tom="entrada" dica={DEFINICAO.entregues} />
            <Kpi rotulo="Aprovados" href={lista("aprovado")} valor={r.aprovados} anterior={a.aprovados} rotuloAnterior={antes} tom="aprovado" dica={DEFINICAO.aprovados} />
            <Kpi
              rotulo="Reprovações"
              href={lista("reprovado")}
              valor={r.reprovacoes}
              anterior={a.reprovacoes}
              rotuloAnterior={antes}
              tom="reprovado"
              dica={DEFINICAO.reprovacoes}
              extra={
                r.cardsJulgados ? (
                  <>
                    <LinkTaxa href={lista("cards_reprovados")}>{r.cardsReprovados} de {r.cardsJulgados} cards julgados</LinkTaxa> ({porcento(taxaReprovacao(r))})
                  </>
                ) : (
                  "Nenhum card julgado no período"
                )
              }
            />
            <Kpi
              rotulo="Concluídos"
              href={lista("concluidos")}
              valor={concluidos(r)}
              anterior={concluidos(a)}
              rotuloAnterior={antes}
              dica={DEFINICAO.concluidos}
              extra={`${r.aprovados} aprovados em QA + ${r.concluidosSemQa} sem QA`}
            />
          </dl>
          <dl className="kpis kpis--outros" aria-label="Outros números como responsável">
            <Kpi menor rotulo="Concluídos sem QA" href={lista("concluido_sem_qa")} valor={r.concluidosSemQa} anterior={a.concluidosSemQa} rotuloAnterior={antes} tom="sem-qa" dica={DEFINICAO.semQa} />
            <Kpi menor rotulo="Devolvidos" href={lista("devolvido")} valor={r.devolvidos} anterior={a.devolvidos} rotuloAnterior={antes} tom="devolvido" dica={DEFINICAO.devolvidos} />
            <Kpi menor rotulo="Criados" href={lista("criado")} valor={r.criados} anterior={a.criados} rotuloAnterior={antes} dica={DEFINICAO.criados} />
            <Kpi menor rotulo="Movimentou" href={lista("movimentado")} valor={r.movimentados} anterior={a.movimentados} rotuloAnterior={antes} dica={DEFINICAO.movimentou} />
          </dl>
        </section>
      )}
      {qa && (
        <section className="numeros" aria-labelledby="t-fluxo-qa">
          <h2 id="t-fluxo-qa" className="numeros__titulo">Testes · como QA</h2>
          <dl className="kpis kpis--fluxo">
            <Kpi rotulo="Testados" href={lista("testados")} valor={testados(r)} anterior={testados(a)} rotuloAnterior={antes} tom="entrada" dica={DEFINICAO.testados} />
            <Kpi rotulo="Aprovou" href={lista("testou_aprovado")} valor={r.testouAprovado} anterior={a.testouAprovado} rotuloAnterior={antes} tom="aprovado" dica={DEFINICAO.aprovou} />
            <Kpi
              rotulo="Reprovou"
              href={lista("testou_reprovado")}
              valor={r.testouReprovado}
              anterior={a.testouReprovado}
              rotuloAnterior={antes}
              tom="reprovado"
              dica={DEFINICAO.reprovou}
              extra={
                r.cardsTestados ? (
                  <>
                    <LinkTaxa href={lista("cards_reprovou")}>{r.cardsTestadosReprovados} de {r.cardsTestados} cards testados</LinkTaxa> ({porcento(taxaReprovacaoQa(r))})
                  </>
                ) : (
                  "Nenhum card testado no período"
                )
              }
            />
          </dl>
          <dl className="kpis kpis--outros" aria-label="Outros números como QA">
            <Kpi menor rotulo="Devolveu" href={lista("testou_devolvido")} valor={r.testouDevolvido} anterior={a.testouDevolvido} rotuloAnterior={antes} tom="devolvido" dica={DEFINICAO.devolveu} />
            {!dev && <Kpi menor rotulo="Criados" href={lista("criado")} valor={r.criados} anterior={a.criados} rotuloAnterior={antes} dica={DEFINICAO.criados} />}
            {!dev && <Kpi menor rotulo="Movimentou" href={lista("movimentado")} valor={r.movimentados} anterior={a.movimentados} rotuloAnterior={antes} dica={DEFINICAO.movimentou} />}
          </dl>
        </section>
      )}

      <div className="pessoa__grade">
        {/* Coluna 1 empilha o gráfico com a lista mais curta: nenhuma baia deixa trilho vazio embaixo. */}
        <div className="pessoa__coluna">
          <section className="bloco" aria-labelledby="t-semanal">
            <header className="bloco__cabeca">
              <h2 id="t-semanal" className="bloco__titulo">Por semana · últimas {inicios.length}</h2>
            </header>
            <Grafico opcoes={opcoes} altura={240} rotulo={`${pessoa.nome}: contagem semanal`} />
          </section>
          {dev && (
            <ListaCards
              titulo="Concluídos sem QA"
              cards={semQa}
              vazio="Nenhum card concluído sem passar pelo QA no período."
              titulos={titulos}
              projetos={projetos}
              hrefCard={hrefCard}
              quem={(c) => (c.por !== null && c.por !== uid ? `movido por ${nomeDe(pessoas, c.por)}` : "")}
            />
          )}
          {qa && (
            <section className="bloco" aria-labelledby="t-projetos">
              <header className="bloco__cabeca">
                <h2 id="t-projetos" className="bloco__titulo">Projetos mais testados</h2>
              </header>
              {testadosPorProjeto.length === 0 ? (
                <p className="vazio">Nenhum teste no período.</p>
              ) : (
                <ul className="lista-simples">
                  {testadosPorProjeto.slice(0, 10).map((p) => (
                    <li key={p.project_id}>
                      <span>{nomeCurto(projetos.get(p.project_id) ?? `Projeto ${p.project_id}`)}</span>
                      <span className="num">{numero(p.testes)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <section className="bloco" aria-labelledby="t-carga-pessoa">
          <header className="bloco__cabeca">
            <h2 id="t-carga-pessoa" className="bloco__titulo">Abertos agora <span className="contagem">{abertos.filter((c) => c.papel !== "backlog").length}</span></h2>
            <p className="nota">Foto de agora: não muda com o período</p>
            <LegendaCarga />
          </header>
          <BarraCarga carga={carga} max={Math.max(1, PAPEIS_CARGA.reduce((s, p) => s + carga[p], 0))} />
          <ListaAbertos cards={abertos} titulos={titulos} projetos={projetos} hrefCard={hrefCard} />
        </section>

        <ListaCards
          titulo={qa ? "Cards que reprovou" : "Cards reprovados"}
          cards={reprovados}
          vazio="Nenhuma reprovação no período."
          titulos={titulos}
          projetos={projetos}
          hrefCard={hrefCard}
          mostrarVezes
        />
      </div>
    </div>
  );
}

function ListaCards({
  titulo, cards, vazio, titulos, projetos, hrefCard, mostrarVezes, quem,
}: {
  titulo: string;
  cards: CardContado[];
  vazio: string;
  titulos: Map<number, string>;
  projetos: Map<number, string>;
  hrefCard: (id: number) => string;
  mostrarVezes?: boolean;
  quem?: (c: CardContado) => string;
}) {
  return (
    <section className="bloco">
      <header className="bloco__cabeca">
        <h2 className="bloco__titulo">{titulo} <span className="contagem">{cards.length}</span></h2>
      </header>
      {cards.length === 0 ? (
        <p className="vazio">{vazio}</p>
      ) : (
        <ul className="lista-cards rolavel">
          {cards.map((c) => (
            <li key={c.task_id}>
              <a className="link-card" href={hrefCard(c.task_id)}>#{c.task_id}</a>
              <span className="lista-cards__titulo">
                <TituloCard titulo={titulos.get(c.task_id)} />
                <span className="meta">
                  <span>{nomeCurto(projetos.get(c.project_id) ?? "")}</span>
                  <span>{dataCurta(c.ultimo)}</span>
                  {quem?.(c) && <span>{quem(c)}</span>}
                </span>
              </span>
              {mostrarVezes && <span className="num" title={`${c.vezes} vez(es) no período`}>{c.vezes}×</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ListaAbertos({
  cards, titulos, projetos, hrefCard,
}: {
  cards: ReturnType<typeof cardsAbertos>;
  titulos: Map<number, string>;
  projetos: Map<number, string>;
  hrefCard: (id: number) => string;
}) {
  const visiveis = cards.filter((c) => c.papel !== "backlog");
  const backlog = cards.length - visiveis.length;
  return (
    <>
      <ul className="lista-cards rolavel">
        {visiveis.map((c) => (
          <li key={c.task_id}>
            <a className="link-card" href={hrefCard(c.task_id)}>#{c.task_id}</a>
            <span className="lista-cards__titulo">
              <TituloCard titulo={titulos.get(c.task_id)} />
              <span className="meta">
                <span>{nomeCurto(projetos.get(c.project_id) ?? "")}</span>
                <span>{NOME_PAPEL[c.papel] ?? c.coluna}</span>
                {c.desde && <span>{haDias(c.desde)} na coluna</span>}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {backlog > 0 && <p className="nota">+ {backlog} no backlog.</p>}
    </>
  );
}

/** Cards parados desde antes do ledger não têm título guardado (o snapshot não traz título). */
function TituloCard({ titulo }: { titulo?: string }) {
  const resto = titulo ? separarEtiquetas(titulo).resto : "";
  return resto ? <span title={resto}>{resto}</span> : <span className="meta">Título não registrado (card anterior ao histórico)</span>;
}

/** "3 de 8 cards julgados": vira link para a base da taxa quando há lista. */
function LinkTaxa({ href, children }: { href?: string; children: React.ReactNode }) {
  return href ? <a className="link-numero" href={href}>{children}</a> : <>{children}</>;
}
