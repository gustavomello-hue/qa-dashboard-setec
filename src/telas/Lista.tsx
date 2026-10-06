import { useState } from "react";
import type { Dashboard } from "../data/contrato";
import type { Rota } from "../data/rota";
import { dataCurta, nomeCurto, separarEtiquetas } from "../data/formato";
import { diaLocal, indiceProjetos, indiceTitulos } from "../data/seletores";
import { indicePessoas, nomeDe } from "../data/pessoas";
import { mesesDisponiveis } from "../data/periodo";
import {
  ROTULO_LISTA, SEM_PERIODO, cabecalhoLista, consultaDaRota, escreverPeriodoLista, familiaDe, lerPeriodoLista,
  listarCards, rotaDaConsulta, rotuloPeriodoLista, textoCopiar, type Consulta, type MetricaLista,
} from "../data/listas";
import type { Tom } from "../componentes/Kpi";
import { Icone } from "../componentes/Icone";

interface Props {
  dados: Dashboard;
  rota: Rota;
  agora: Date;
  ir: (r: Rota) => void;
  hrefCard: (id: number) => string;
  hrefPessoa: (id: number) => string;
}

type Ordem = "recentes" | "vezes";

/** Cor do porta-faixa: o estado que o número conta. Concluídos e Testados usam o desfecho de cada card. */
const TOM_LISTA: Record<MetricaLista, Tom> = {
  em_qa: "entrada",
  entrou_qa: "entrada",
  qa_para_concluida: "aprovado",
  qa_para_correcao: "reprovado",
  concluida: "sem-qa",
  entregue_qa: "entrada",
  aprovado: "aprovado",
  reprovado: "reprovado",
  cards_reprovados: "reprovado",
  devolvido: "devolvido",
  concluidos: "neutro",
  concluido_sem_qa: "sem-qa",
  criado: "neutro",
  testados: "neutro",
  testou_aprovado: "aprovado",
  testou_reprovado: "reprovado",
  cards_reprovou: "reprovado",
  testou_devolvido: "devolvido",
  saida_qa_nao_qa: "neutro",
  abertos: "neutro",
};

export function Lista({ dados, rota, agora, ir, hrefCard, hrefPessoa }: Props) {
  const consulta = consultaDaRota(rota, agora);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [copiado, setCopiado] = useState<string | null>(null);

  if (!consulta) {
    return (
      <p className="vazio lista-tela__orienta">
        Esta lista abre a partir de um número: clique num contador da tela Agora, num número da ficha de uma pessoa ou numa
        célula da tabela Equipe.
      </p>
    );
  }
  const mudar = (c: Partial<Consulta>) => {
    setCopiado(null);
    ir(rotaDaConsulta({ ...consulta, ...c }));
  };
  const resultado = listarCards(dados, consulta, agora);
  const titulos = indiceTitulos(dados);
  const projetos = indiceProjetos(dados);
  const pessoas = indicePessoas(dados);
  const links = new Map<number, string>();
  for (const c of dados.cards) if (c.link) links.set(c.task_id, c.link);
  for (const c of dados.fila_qa) if (c.link) links.set(c.task_id, c.link);
  const detalhe = (id: number) => dados.detalhes_cards?.[String(id)];
  const tituloDe = (id: number) => separarEtiquetas(titulos.get(id) ?? detalhe(id)?.titulo ?? "").resto;
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const linhas = resultado.linhas
    .filter((l) => !termo || tituloDe(l.task_id).toLocaleLowerCase("pt-BR").includes(termo) || String(l.task_id).includes(termo.replace(/^#/, "")))
    .sort((a, b) => (ordem === "vezes" ? b.vezes - a.vezes : 0) || (b.quando ?? 0) - (a.quando ?? 0) || b.task_id - a.task_id);
  const semPeriodo = SEM_PERIODO.includes(consulta.metrica);
  const meses = mesesDisponiveis(dados.equipe?.desde ?? dados.regras.qa_confiavel_desde, agora);
  const tom = TOM_LISTA[consulta.metrica];
  const algumRepetido = linhas.some((l) => l.vezes > 1);

  const copiar = async () => {
    const texto = textoCopiar(linhas);
    const ok = `${linhas.length} número${linhas.length === 1 ? "" : "s"} copiado${linhas.length === 1 ? "" : "s"}.`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(ok);
    } catch {
      // Sem permissão para a API (aba embutida, navegador antigo): o caminho antigo ainda funciona no clique.
      setCopiado(copiarPorSelecao(texto) ? ok : "Não foi possível copiar: selecione os números na tabela.");
    }
  };

  return (
    <div className="lista-tela">
      <div className="chips" role="group" aria-label="Filtros da lista">
        <label className="chip chip--campo">
          <span className="chip__rotulo">Número</span>
          <select value={consulta.metrica} onChange={(e) => mudar({ metrica: e.target.value as MetricaLista })}>
            {familiaDe(consulta.metrica).map((m) => (
              <option key={m} value={m}>{ROTULO_LISTA[m]}</option>
            ))}
          </select>
        </label>
        {!semPeriodo && (
          <label className="chip chip--campo">
            <span className="chip__rotulo">Período</span>
            <select
              value={consulta.periodo.tipo === "dia" ? "dia" : escreverPeriodoLista(consulta.periodo)}
              onChange={(e) => {
                const v = e.target.value;
                const p = v === "dia" ? { tipo: "dia" as const, dia: diaLocal(agora) } : lerPeriodoLista(v);
                if (p) mudar({ periodo: p });
              }}
            >
              <option value="dia">Um dia</option>
              <option value="7d">Últimos 7 dias</option>
              {meses.map((m) => (
                <option key={m} value={m}>{rotuloPeriodoLista({ tipo: "mes", mes: m })}</option>
              ))}
            </select>
            {consulta.periodo.tipo === "dia" && (
              <input
                type="date"
                className="num"
                aria-label="Dia"
                value={consulta.periodo.dia}
                max={diaLocal(agora)}
                onChange={(e) => e.target.value && mudar({ periodo: { tipo: "dia", dia: e.target.value } })}
              />
            )}
          </label>
        )}
        {consulta.pessoa !== undefined && (
          <span className="chip chip--campo">
            <span className="chip__rotulo">Pessoa</span>
            <a className="link-pessoa" href={hrefPessoa(consulta.pessoa)}>{nomeDe(pessoas, consulta.pessoa)}</a>
            <button type="button" className="chip__tirar" onClick={() => mudar({ pessoa: undefined })} aria-label="Tirar o filtro de pessoa">
              <Icone nome="fechar" tamanho={12} />
            </button>
          </span>
        )}
        {(consulta.filtro.prefixo || consulta.filtro.projeto !== undefined) && (
          <span className="chip chip--campo">
            <span className="chip__rotulo">{consulta.filtro.projeto !== undefined ? "Projeto" : "Frente"}</span>
            <span>{consulta.filtro.projeto !== undefined ? nomeCurto(projetos.get(consulta.filtro.projeto) ?? "") : consulta.filtro.prefixo}</span>
            <button type="button" className="chip__tirar" onClick={() => mudar({ filtro: {} })} aria-label="Tirar o filtro de frente e projeto">
              <Icone nome="fechar" tamanho={12} />
            </button>
          </span>
        )}
      </div>

      <section className="bloco lista" aria-labelledby="t-lista">
        <header className="bloco__cabeca">
          <h2 id="t-lista" className={`bloco__titulo coluna-tom etiqueta--${tom}`}>{ROTULO_LISTA[consulta.metrica]}</h2>
          <p className="lista__resumo" aria-live="polite">
            {cabecalhoLista(resultado, consulta.metrica)}
            {!semPeriodo && <span className="lista__periodo num"> · {rotuloPeriodoLista(consulta.periodo)}</span>}
          </p>
        </header>

        <div className="lista__acoes">
          <label className="sr" htmlFor="busca-lista">Buscar na lista</label>
          <input
            id="busca-lista"
            className="campo"
            type="search"
            placeholder="Buscar título ou #"
            autoComplete="off"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <label className="sr" htmlFor="ordem-lista">Ordenar</label>
          <select id="ordem-lista" className="campo" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
            <option value="recentes">Mais recentes</option>
            <option value="vezes">Mais vezes</option>
          </select>
          <button type="button" className="botao" onClick={copiar} disabled={linhas.length === 0}>
            Copiar números
          </button>
          {copiado && <span className="lista__copiado" role="status">{copiado}</span>}
        </div>

        {linhas.length === 0 ? (
          <p className="vazio">
            {termo
              ? "Nenhum card da lista bate com a busca."
              : semPeriodo
                ? "Nenhum card agora."
                : `Nenhum card em ${rotuloPeriodoLista(consulta.periodo)}.`}
          </p>
        ) : (
          <div className="rolavel">
            <table className="tabela tabela--compacta tabela--lista">
              <thead>
                <tr>
                  <th scope="col">Card</th>
                  <th scope="col">Título</th>
                  <th scope="col" className="so-largo">Projeto</th>
                  <th scope="col" className="so-largo">Pessoa</th>
                  <th scope="col" className="num so-largo">Quando</th>
                  <th scope="col" className="so-largo">Coluna atual</th>
                  {algumRepetido && <th scope="col" className="num" title="Quantas vezes o card conta no número">Vezes</th>}
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => {
                  const titulo = tituloDe(l.task_id);
                  const link = links.get(l.task_id) ?? detalhe(l.task_id)?.link ?? undefined;
                  const projeto = nomeCurto(projetos.get(l.project_id) ?? "");
                  const quando = l.quando ? dataCurta(l.quando) : "—";
                  return (
                    <tr key={l.task_id} className={`faixa--${l.etiqueta?.tom ?? tom}`}>
                      <th scope="row" className="celula-card">
                        <a className="link-card" href={hrefCard(l.task_id)} title="Ver a linha do tempo do card">#{l.task_id}</a>
                      </th>
                      <td className="celula-titulo">
                        {link ? (
                          <a href={link} target="_blank" rel="noreferrer" title={`${titulo} (abre no Kanboard)`}>
                            {titulo || "Título não registrado"}
                            <span className="sr"> (abre no Kanboard, em nova aba)</span>
                          </a>
                        ) : (
                          <span className="lista__titulo" title={titulo}>{titulo || <span className="meta">Título não registrado</span>}</span>
                        )}
                        {/* Linha de apoio: no celular ela leva os campos que saem da tabela. */}
                        <span className="meta">
                          {l.etiqueta && <span className={`etiqueta etiqueta--${l.etiqueta.tom}`}>{l.etiqueta.texto}</span>}
                          <span className="so-estreito">{projeto}</span>
                          {l.pessoa && <span className="so-estreito meta__pessoa">{l.pessoa}</span>}
                          <span className="so-estreito num">{quando}</span>
                          {l.coluna && <span className="so-estreito">{l.coluna}</span>}
                        </span>
                      </td>
                      <td className="so-largo lista__curta" title={projeto}>{projeto}</td>
                      <td className="so-largo">{l.pessoa || "—"}</td>
                      <td className="num so-largo">{quando}</td>
                      <td className="so-largo lista__curta" title={l.coluna ?? undefined}>{l.coluna ?? "—"}</td>
                      {algumRepetido && <td className={`num${l.vezes > 1 ? "" : " zero"}`}>{l.vezes > 1 ? `${l.vezes}×` : "1"}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function copiarPorSelecao(texto: string): boolean {
  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}
