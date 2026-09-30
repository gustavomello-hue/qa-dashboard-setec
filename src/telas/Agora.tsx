import type { Dashboard } from "../data/contrato";
import { NOME_EVENTO, diaCurto, hora, separarEtiquetas } from "../data/formato";
import { diaDeReferencia, diaLocal, estadoAtualizacao, kpisHoje, indiceTitulos, passaNoFiltro, inicioDaUltimaColeta, type Filtro } from "../data/seletores";
import { cargaPorPessoa, cargaVazia, feedRecente, grupoPrincipal, indicePessoas, pessoasDaCarga, PAPEIS_CARGA, ROTULO_GRUPO } from "../data/pessoas";
import { Kpi, type Tom } from "../componentes/Kpi";
import { BarraCarga, LegendaCarga } from "../componentes/BarraCarga";
import { Fila } from "../componentes/Fila";
import { Lacunas } from "../componentes/Sinal";
import { Glossario } from "../componentes/Glossario";
import { DEFINICAO } from "../data/glossario";

interface Props {
  dados: Dashboard;
  filtro: Filtro;
  /** Relógio do painel (anda a cada minuto): decide se o dado ainda é "de agora". */
  agora: Date;
  hrefCard: (id: number) => string;
  hrefPessoa: (id: number) => string;
  soForaDoPainel: boolean;
  alternarForaDoPainel?: () => void;
}

export function Agora({ dados, filtro, agora, hrefCard, hrefPessoa, soForaDoPainel, alternarForaDoPainel }: Props) {
  // Os contadores do dia só afirmam o que foi medido: com a coleta de outro
  // dia, contam aquele dia; com a coleta parada, dizem até que horas.
  const estado = estadoAtualizacao(dados, agora);
  const referencia = diaDeReferencia(dados, agora);
  const velho = estado.atrasado || estado.outroDia;
  const quando = estado.outroDia
    ? diaCurto(diaLocal(referencia))
    : estado.atrasado && estado.momento ? `até ${hora(estado.momento)}` : "hoje";
  const momentoFila = estado.outroDia ? `em ${diaCurto(diaLocal(referencia))}` : estado.atrasado && estado.momento ? `às ${hora(estado.momento)}` : "agora";

  const k = kpisHoje(dados, referencia, filtro);
  const ontem = diaCurto(k.diaComparacao);
  // Na segunda-feira a comparação é com a sexta: "Ontem" ali seria falso.
  const diaDeOntem = diaLocal(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 1));
  const dicaOntem = k.diaComparacao === diaDeOntem ? "Ontem" : `Último dia útil (${ontem})`;
  const desde = inicioDaUltimaColeta(dados);
  const passa = passaNoFiltro(dados, filtro);
  const novos = velho || desde === null ? 0 : dados.fila_qa.filter((c) => passa(c.project_id) && (c.entrou_em ?? 0) > desde).length;

  return (
    <div className="agora">
      <dl className={`kpis${velho ? " kpis--velho" : ""}`} aria-label={`Contadores de ${quando}`}>
        <Kpi rotulo={`Em QA ${momentoFila}`} valor={k.emQaAgora} tom="entrada" sub={novos > 0 ? `${novos} novo${novos > 1 ? "s" : ""} nesta coleta` : "na coluna Teste/QA"} />
        <Kpi rotulo={`Entraram ${quando}`} valor={k.hoje.entraram} tom="entrada" anterior={k.comparacao.entraram} rotuloAnterior={ontem} dicaAnterior={dicaOntem} />
        <Kpi rotulo={`Aprovados ${quando}`} valor={k.hoje.aprovados} tom="aprovado" anterior={k.comparacao.aprovados} rotuloAnterior={ontem} dicaAnterior={dicaOntem} />
        <Kpi rotulo={`Reprovados ${quando}`} valor={k.hoje.reprovados} tom="reprovado" anterior={k.comparacao.reprovados} rotuloAnterior={ontem} dicaAnterior={dicaOntem} />
        <Kpi
          rotulo={`Concluídos sem QA ${quando}`}
          valor={k.hoje.concluidosSemQa}
          tom="sem-qa"
          anterior={k.comparacao.concluidosSemQa}
          rotuloAnterior={ontem} dicaAnterior={dicaOntem}
          dica={DEFINICAO.semQa}
        />
      </dl>

      <CargaEquipe dados={dados} filtro={filtro} hrefPessoa={hrefPessoa} />
      <Fila dados={dados} filtro={filtro} hrefCard={hrefCard} soForaDoPainel={soForaDoPainel} alternarForaDoPainel={alternarForaDoPainel} />
      <Feed dados={dados} filtro={filtro} hrefCard={hrefCard} />
      <div className="agora__rodape">
        <Lacunas dados={dados} />
        <Glossario />
      </div>
    </div>
  );
}

function CargaEquipe({ dados, filtro, hrefPessoa }: { dados: Dashboard; filtro: Filtro; hrefPessoa: (id: number) => string }) {
  const cargas = cargaPorPessoa(dados, filtro);
  const pessoas = pessoasDaCarga(dados);
  const total = (uid: number) => PAPEIS_CARGA.reduce((s, p) => s + (cargas.get(uid)?.[p] ?? 0), 0);
  const max = Math.max(1, ...pessoas.map((p) => total(p.user_id)));
  // Agrupa pela ordem DEV, QA, estagiários, e alfabético dentro do grupo.
  const ordem = ["dev", "qa", "estagiario_dev", "estagiario_qa"];
  const grupos = ordem
    .map((g) => ({ g, pessoas: pessoas.filter((p) => grupoPrincipal(p) === g) }))
    .filter((x) => x.pessoas.length);

  return (
    <section className="bloco carga-equipe" aria-labelledby="t-carga">
      <header className="bloco__cabeca">
        <h2 id="t-carga" className="bloco__titulo">Carga por pessoa</h2>
        <LegendaCarga />
      </header>
      {pessoas.length === 0 ? (
        <p className="vazio">Sem equipe cadastrada no equipe.json.</p>
      ) : (
        <div className="rolavel">
          {grupos.map(({ g, pessoas: lista }) => (
            <div key={g} className="carga-grupo">
              <h3 className="carga-grupo__titulo">{ROTULO_GRUPO[g as keyof typeof ROTULO_GRUPO]}</h3>
              <ul className="carga-lista">
                {lista.map((p) => (
                  <li key={p.user_id} className="carga-linha">
                    <a className="link-pessoa" href={hrefPessoa(p.user_id)}>{p.nome}</a>
                    <BarraCarga carga={cargas.get(p.user_id) ?? cargaVazia()} max={max} />
                    <span className="num carga-linha__total">{total(p.user_id)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const TOM_EVENTO: Record<string, Tom> = {
  entrou_qa: "entrada",
  qa_para_concluida: "aprovado",
  qa_para_correcao: "reprovado",
  qa_para_outra: "devolvido",
  concluida: "sem-qa",
  criada: "neutro",
};

function Feed({ dados, filtro, hrefCard }: { dados: Dashboard; filtro: Filtro; hrefCard: (id: number) => string }) {
  const eventos = feedRecente(dados, filtro, 40);
  // O que chegou nesta coleta entra no quadro com o gesto de inserir a faixa.
  const desde = inicioDaUltimaColeta(dados);
  const titulos = indiceTitulos(dados);
  const pessoas = indicePessoas(dados);
  // O evento traz o nome completo do Kanboard; a tela usa o nome curto da equipe.
  const curto = new Map([...pessoas.values()].map((p) => [p.nome_kanboard, p.nome]));
  const nome = (n: string | null) => (n ? curto.get(n) ?? n : "");
  let diaAnterior = "";

  return (
    <section className="bloco feed" aria-labelledby="t-feed">
      <header className="bloco__cabeca">
        <h2 id="t-feed" className="bloco__titulo">Movimentações recentes</h2>
      </header>
      {eventos.length === 0 ? (
        <p className="vazio">Nenhuma movimentação.</p>
      ) : (
        <ol className="rolavel feed__lista">
          {eventos.map((e, i) => {
            const cabecalho = e.dia !== diaAnterior ? diaCurto(e.dia) : null;
            diaAnterior = e.dia;
            const titulo = separarEtiquetas(titulos.get(e.task_id) ?? e.titulo ?? "").resto;
            const dono = e.evento === "criada" ? nome(e.creator_nome) : nome(e.owner_nome);
            return (
              <li key={`${e.task_id}-${e.momento}-${i}`}>
                {cabecalho && <p className="feed__dia">{cabecalho}</p>}
                <div className={`feed__item faixa--${TOM_EVENTO[e.evento] ?? "neutro"}${desde !== null && e.momento > desde ? " faixa--nova" : ""}`}>
                  <span className="feed__hora num">{hora(e.momento)}</span>
                  <span className="feed__cabeca">
                    <span className={`etiqueta etiqueta--${TOM_EVENTO[e.evento] ?? "neutro"}`}>{NOME_EVENTO[e.evento]}</span>
                    <span className="meta">
                      {dono && <span className="meta__pessoa">{dono}</span>}
                      {e.movido_por && nome(e.movido_por) !== dono && <span>por {nome(e.movido_por)}</span>}
                    </span>
                  </span>
                  <span className="feed__titulo" title={titulo}>
                    <a className="link-card" href={hrefCard(e.task_id)}>#{e.task_id}</a> {titulo}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
