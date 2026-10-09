import { useState } from "react";
import type { Dashboard, Grupo, Metrica, Pessoa } from "../data/contrato";
import { mesCurto, numero, porcento } from "../data/formato";
import { intervalo, intervaloAnterior, mesAnterior, rotuloAnterior, ultimoDia, type Periodo } from "../data/periodo";
import { mesParcial } from "../data/reuniao";
import { mesLocal, semReprovacao, type Filtro } from "../data/seletores";
import {
  GRUPOS_TABELA, ROTULO_GRUPO, atribuicoesDe, cargaPorPessoa, concluidos, indicePessoas, nomeDe,
  pessoasDoGrupo, pessoasFora, porSemana, semanaIncompleta, resumirPorPessoa, resumoVazio, semanas, taxaReprovacao,
  taxaReprovacaoQa, testados, PAPEIS_CARGA, type Resumo,
} from "../data/pessoas";
import { Sparkline } from "../componentes/Sparkline";
import { Glossario } from "../componentes/Glossario";
import { DEFINICAO } from "../data/glossario";
import { Icone } from "../componentes/Icone";
import { NotasQa } from "../componentes/NotasQa";
import type { Consulta, MetricaLista } from "../data/listas";

interface Props {
  dados: Dashboard;
  filtro: Filtro;
  periodo: Periodo;
  inativos: boolean;
  /** Período escolhido sozinho (início do mês abre o mês fechado anterior). */
  periodoAutomatico?: boolean;
  alternarInativos: () => void;
  hrefPessoa: (id: number) => string;
  /** Números viram links para a lista de cards. */
  hrefLista?: (c: Consulta) => string;
}

interface Coluna {
  id: string;
  rotulo: string;
  dica: string;
  valor: (r: Resumo, uid: number) => number | null;
  formato?: "pct";
  tom?: string;
  /** Lista de cards que a célula abre. */
  lista?: MetricaLista;
}

const SEMANAS = 8;

function colunasDev(carga: (uid: number) => number): Coluna[] {
  return [
    { id: "entregues", lista: "entregue_qa", rotulo: "Entregues", dica: DEFINICAO.entregues, valor: (r) => r.entregues, tom: "entrada" },
    { id: "aprovados", lista: "aprovado", rotulo: "Aprovados", dica: DEFINICAO.aprovados, valor: (r) => r.aprovados, tom: "aprovado" },
    { id: "reprovacoes", lista: "reprovado", rotulo: "Reprovações", dica: DEFINICAO.reprovacoes, valor: (r) => r.reprovacoes, tom: "reprovado" },
    { id: "taxa", lista: "cards_reprovados", rotulo: "% cards reprov.", dica: DEFINICAO.cardsReprovados, valor: (r) => taxaReprovacao(r), formato: "pct" },
    { id: "devolvidos", lista: "devolvido", rotulo: "Devolvidos", dica: DEFINICAO.devolvidos, valor: (r) => r.devolvidos },
    { id: "concluidos", lista: "concluidos", rotulo: "Concluídos", dica: DEFINICAO.concluidos, valor: (r) => concluidos(r) },
    { id: "semqa", lista: "concluido_sem_qa", rotulo: "Sem QA", dica: DEFINICAO.semQa, valor: (r) => r.concluidosSemQa, tom: "sem-qa" },
    { id: "criados", lista: "criado", rotulo: "Criados", dica: DEFINICAO.criados, valor: (r) => r.criados },
    { id: "movimentou", lista: "movimentado", rotulo: "Movimentados", dica: DEFINICAO.movimentou, valor: (r) => r.movimentados },
    { id: "carga", lista: "abertos", rotulo: "Abertos", dica: DEFINICAO.abertos, valor: (_, uid) => carga(uid) },
  ];
}

function colunasQa(carga: (uid: number) => number): Coluna[] {
  return [
    { id: "testados", lista: "testados", rotulo: "Testados", dica: DEFINICAO.testados, valor: (r) => testados(r), tom: "entrada" },
    { id: "aprovou", lista: "testou_aprovado", rotulo: "Aprovou", dica: DEFINICAO.aprovou, valor: (r) => r.testouAprovado, tom: "aprovado" },
    { id: "reprovou", lista: "testou_reprovado", rotulo: "Reprovou", dica: DEFINICAO.reprovou, valor: (r) => r.testouReprovado, tom: "reprovado" },
    { id: "taxa", lista: "cards_reprovou", rotulo: "% cards reprov.", dica: DEFINICAO.cardsReprovouQa, valor: (r) => taxaReprovacaoQa(r), formato: "pct" },
    { id: "devolveu", lista: "testou_devolvido", rotulo: "Devolveu", dica: DEFINICAO.devolveu, valor: (r) => r.testouDevolvido },
    { id: "criados", lista: "criado", rotulo: "Criados", dica: DEFINICAO.criados, valor: (r) => r.criados },
    { id: "movimentou", lista: "movimentado", rotulo: "Movimentados", dica: DEFINICAO.movimentou, valor: (r) => r.movimentados },
    { id: "carga", lista: "abertos", rotulo: "Abertos", dica: DEFINICAO.abertos, valor: (_, uid) => carga(uid) },
  ];
}

const SPARK: Record<"dev" | "qa", { metricas: Metrica[]; rotulo: string }> = {
  dev: { metricas: ["entregue_qa"], rotulo: "entregues para QA" },
  qa: { metricas: ["testou_aprovado", "testou_reprovado"], rotulo: "testados" },
};

export function Equipe({ dados, filtro, periodo, inativos, periodoAutomatico, alternarInativos, hrefPessoa, hrefLista }: Props) {
  const hrefCelula = hrefLista && ((metrica: MetricaLista, uid: number) => hrefLista({ metrica, periodo, pessoa: uid, filtro }));
  const agora = new Date();
  const atual = intervalo(periodo, agora);
  const atribs = atribuicoesDe(dados, atual, filtro);
  const { porPessoa, saidasSemAutor } = resumirPorPessoa(atribs, semReprovacao(dados));
  const { porPessoa: antes } = resumirPorPessoa(atribuicoesDe(dados, intervaloAnterior(periodo, agora), filtro), semReprovacao(dados));
  // A sparkline olha as 8 semanas até o fim do período, com o mesmo filtro de projeto.
  const fim = ultimoDia(atual, agora);
  const inicios = semanas(fim, SEMANAS);
  const parcial = semanaIncompleta(fim);
  const historico = atribuicoesDe(dados, { de: inicios[0], ate: atual.ate }, filtro);
  const cargas = cargaPorPessoa(dados, filtro);
  const carga = (uid: number) => PAPEIS_CARGA.reduce((s, p) => s + (cargas.get(uid)?.[p] ?? 0), 0);
  const pessoas = indicePessoas(dados);
  // Base medida só em parte (mês reconstruído): sem sinal de variação.
  const baseParcial = periodo.tipo === "mes" && mesParcial(dados, mesAnterior(periodo.mes));

  if (!dados.equipe) return <p className="vazio">Este dashboard.json ainda não traz as métricas por pessoa.</p>;

  // Ordem alfabética: por contagem virava um pódio de quem tira card de QA sem ser do QA.
  const naoQa = [...porPessoa.entries()].filter(([, r]) => r.saidasNaoQa > 0).sort((a, b) => nomeDe(pessoas, a[0]).localeCompare(nomeDe(pessoas, b[0]), "pt-BR"));
  const comAtividade = new Set([...porPessoa.keys()]);

  return (
    <div className="equipe">
      <div className="barra-acoes">
        <p className="nota">
          {periodoAutomatico && periodo.tipo === "mes" && <>Início do mês: mostrando {mesCurto(periodo.mes)}, o último mês fechado. </>}
          Crédito ao responsável <strong>no momento</strong> de cada evento.{" "}
          {baseParcial
            ? <>A base {rotuloAnterior(periodo, agora)} foi medida só em parte: sem variação.</>
            : <>Sob cada número, a diferença para {rotuloAnterior(periodo, agora)}.</>}
          {hrefLista && <> Clique num número para ver os cards.</>}
        </p>
        <NotasQa dados={dados} filtro={filtro} meses={[periodo.tipo === "mes" ? periodo.mes : mesLocal(agora)]} />
        <Glossario />
        <label className="alternador">
          <input type="checkbox" checked={inativos} onChange={alternarInativos} /> Mostrar quem saiu da equipe
        </label>
      </div>

      {GRUPOS_TABELA.map((g) => {
        const tipo = g === "qa" || g === "estagiario_qa" ? "qa" : "dev";
        return (
          <TabelaGrupo
            key={g}
            grupo={g}
            pessoas={pessoasDoGrupo(dados, g, inativos)}
            colunas={tipo === "qa" ? colunasQa(carga) : colunasDev(carga)}
            resumo={(uid) => porPessoa.get(uid) ?? resumoVazio()}
            anterior={(uid) => antes.get(uid) ?? resumoVazio()}
            tendencia={(uid) => porSemana(historico, uid, SPARK[tipo].metricas, inicios)}
            rotuloTendencia={SPARK[tipo].rotulo}
            parcial={parcial}
            rotuloAnterior={rotuloAnterior(periodo, agora) + (baseParcial ? " (parcial)" : "")}
            semDelta={baseParcial}
            hrefPessoa={hrefPessoa}
            hrefCelula={hrefCelula}
            rodape={
              g === "qa" ? (
                <p className="nota">
                  Saídas de QA sem autor registrado no Kanboard: <strong>{saidasSemAutor}</strong> (não atribuídas a ninguém).
                  {naoQa.length > 0 && (
                    <>
                      {" "}Saídas de QA feitas por quem não é QA:{" "}
                      {naoQa.map(([uid, r], i) => (
                        <span key={uid}>
                          {i > 0 && ", "}
                          <a className="link-pessoa" href={hrefPessoa(uid)}>{nomeDe(pessoas, uid)}</a> ({r.saidasNaoQa})
                        </span>
                      ))}
                      .
                    </>
                  )}
                </p>
              ) : null
            }
          />
        );
      })}

      <details className="bloco">
        <summary className="bloco__titulo">Gestão e outros</summary>
        <p className="nota tabela-grupo__nota">Fora das tabelas por pessoa, mas os cards deles contam nos totais da equipe.</p>
        <TabelaGrupo
          grupo="outros"
          semTitulo
          pessoas={pessoasFora(dados, comAtividade)}
          colunas={[
            { id: "criados", lista: "criado", rotulo: "Criados", dica: DEFINICAO.criados, valor: (r) => r.criados },
            { id: "entregues", lista: "entregue_qa", rotulo: "Entregues", dica: DEFINICAO.entregues, valor: (r) => r.entregues, tom: "entrada" },
            { id: "semqa", lista: "concluido_sem_qa", rotulo: "Sem QA", dica: DEFINICAO.semQa, valor: (r) => r.concluidosSemQa, tom: "sem-qa" },
            { id: "naoqa", lista: "saida_qa_nao_qa", rotulo: "Saídas de QA", dica: DEFINICAO.naoQa, valor: (r) => r.saidasNaoQa },
          ]}
          resumo={(uid) => porPessoa.get(uid) ?? resumoVazio()}
          anterior={(uid) => antes.get(uid) ?? resumoVazio()}
          rotuloAnterior={rotuloAnterior(periodo, agora) + (baseParcial ? " (parcial)" : "")}
          semDelta={baseParcial}
          hrefPessoa={hrefPessoa}
          hrefCelula={hrefCelula}
          mostrarGrupo
        />
      </details>
    </div>
  );
}

interface TabelaProps {
  grupo: Grupo;
  pessoas: Pessoa[];
  colunas: Coluna[];
  resumo: (uid: number) => Resumo;
  anterior: (uid: number) => Resumo;
  tendencia?: (uid: number) => number[];
  rotuloTendencia?: string;
  /** A última semana da tendência ainda não acabou. */
  parcial?: boolean;
  /** Nome do período de comparação ("ago/26", "set/26 até dia 3"). */
  rotuloAnterior: string;
  /** Base parcial: sem diferença sob os números. */
  semDelta?: boolean;
  hrefPessoa: (id: number) => string;
  /** Link da célula para a lista de cards (ausente no modo TV). */
  hrefCelula?: (metrica: MetricaLista, uid: number) => string;
  rodape?: React.ReactNode;
  semTitulo?: boolean;
  mostrarGrupo?: boolean;
}

/**
 * Diferença para o período anterior, sob o número, em tinta: sem verde nem
 * vermelho, porque subir reprovação não é "ruim" de uma pessoa, é contexto.
 */
function Delta({ atual, anterior, pct }: { atual: number | null; anterior: number | null; pct: boolean }) {
  // Zero contra zero não é informação: deixa a célula limpa.
  if (anterior === null || atual === null || (atual === 0 && anterior === 0)) return null;
  const d = Math.round((atual - anterior) * 10) / 10;
  const texto = d === 0 ? "=" : `${d > 0 ? "+" : "−"}${Math.abs(d).toLocaleString("pt-BR")}${pct ? " p.p." : ""}`;
  return (
    <span className="delta">
      <span className="sr">variação: </span>
      {texto}
    </span>
  );
}

function formatar(v: number | null, c: Coluna): string {
  if (v === null) return "—";
  return c.formato === "pct" ? porcento(v) : numero(v);
}

function TabelaGrupo({
  grupo, pessoas, colunas, resumo, anterior, tendencia, rotuloTendencia, parcial = false, rotuloAnterior, semDelta = false, hrefPessoa, hrefCelula, rodape, semTitulo, mostrarGrupo,
}: TabelaProps) {
  // Abre em ordem alfabética (sem ranking); clicar no cabeçalho ordena.
  const [ordem, setOrdem] = useState<{ id: string; desc: boolean } | null>(null);
  const coluna = ordem ? colunas.find((c) => c.id === ordem.id) : undefined;
  const linhas = [...pessoas];
  if (coluna && ordem) {
    linhas.sort((a, b) => {
      const va = coluna.valor(resumo(a.user_id), a.user_id) ?? -1;
      const vb = coluna.valor(resumo(b.user_id), b.user_id) ?? -1;
      return (ordem.desc ? vb - va : va - vb) || a.nome.localeCompare(b.nome, "pt-BR");
    });
  }
  const clicar = (id: string) =>
    setOrdem((o) => (o?.id !== id ? { id, desc: true } : o.desc ? { id, desc: false } : null));

  // Total do grupo: soma das contagens; a taxa não se soma, fica "—".
  const totais = colunas.map((c) =>
    c.formato === "pct" ? null : pessoas.reduce((s, p) => s + (c.valor(resumo(p.user_id), p.user_id) ?? 0), 0),
  );

  return (
    <section className={semTitulo ? "tabela-grupo" : "bloco tabela-grupo"} aria-label={ROTULO_GRUPO[grupo]}>
      {!semTitulo && (
        <header className="bloco__cabeca">
          <h2 className="bloco__titulo">
            {ROTULO_GRUPO[grupo]} <span className="contagem">{pessoas.length}</span>
          </h2>
        </header>
      )}
      {pessoas.length === 0 ? (
        <p className="vazio">Ninguém neste grupo no período.</p>
      ) : (
        <div className="rolavel-x">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">
                  <button className="ordenar" onClick={() => setOrdem(null)} aria-pressed={ordem === null}>Pessoa</button>
                </th>
                {mostrarGrupo && <th scope="col">Grupo</th>}
                {colunas.map((c) => (
                  <th key={c.id} scope="col" className="num" title={c.dica} aria-sort={ordem?.id === c.id ? (ordem.desc ? "descending" : "ascending") : undefined}>
                    <button className={`ordenar${c.tom ? ` coluna-tom etiqueta--${c.tom}` : ""}`} onClick={() => clicar(c.id)}>
                      {c.rotulo}
                      {ordem?.id === c.id && <Icone nome={ordem.desc ? "baixo" : "cima"} tamanho={12} />}
                    </button>
                  </th>
                ))}
                {tendencia && <th scope="col" title={`Semanal, ${rotuloTendencia}, últimas ${SEMANAS} semanas`}>Tendência</th>}
              </tr>
            </thead>
            <tbody>
              {linhas.map((p) => {
                const r = resumo(p.user_id);
                const a = anterior(p.user_id);
                return (
                  <tr key={p.user_id} className={p.ativo === false ? "inativo" : undefined}>
                    <th scope="row">
                      <a className="link-pessoa" href={hrefPessoa(p.user_id)}>{p.nome}</a>
                      {p.ativo === false && <span className="meta"> saiu da equipe</span>}
                    </th>
                    {mostrarGrupo && <td><span className="meta">{p.grupos.map((g) => ROTULO_GRUPO[g]).join(", ")}</span></td>}
                    {colunas.map((c) => {
                      const v = c.valor(r, p.user_id);
                      const va = c.id === "carga" ? null : c.valor(a, p.user_id);
                      const href = c.lista && v !== null && v > 0 ? hrefCelula?.(c.lista, p.user_id) : undefined;
                      return (
                        <td
                          key={c.id}
                          className={`num${!v ? " zero" : ""}`}
                          title={va === null ? undefined : `${rotuloAnterior}: ${formatar(va, c)}`}
                        >
                          {href ? <a className="link-numero" href={href} aria-label={`${formatar(v, c)} ${c.rotulo} de ${p.nome}: ver os cards`}>{formatar(v, c)}</a> : formatar(v, c)}
                          {!semDelta && <Delta atual={v} anterior={va} pct={c.formato === "pct"} />}
                        </td>
                      );
                    })}
                    {tendencia && (
                      <td>
                        <Sparkline valores={tendencia(p.user_id)} rotulo={`${p.nome}: ${rotuloTendencia} por semana`} parcial={parcial} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            {pessoas.length > 1 && (
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  {mostrarGrupo && <td />}
                  {colunas.map((c, i) => (
                    <td key={c.id} className="num">{formatar(totais[i], c)}</td>
                  ))}
                  {tendencia && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
      {rodape}
    </section>
  );
}
