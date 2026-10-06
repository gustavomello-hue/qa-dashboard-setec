import { describe, expect, it } from "vitest";
import type { Atribuicao, Dashboard, Evento, Metrica, Pessoa } from "./contrato";
import {
  cabecalhoLista, consultaDaRota, listarCards, rotaDaConsulta, textoCopiar, type Consulta,
} from "./listas";
import { cargaPorPessoa, concluidos, resumirPorPessoa, testados, PAPEIS_CARGA, atribuicoesDe } from "./pessoas";
import { contarDia, kpisHoje, passaNoFiltro, semReprovacao } from "./seletores";
import { intervalo } from "./periodo";
import { escreverRota, lerRota, rotaDaTela } from "./rota";

let momento = 1_790_000_000;
function at(metrica: Metrica, user_id: number | null, task_id: number, dia = "2026-09-10", project_id = 1): Atribuicao {
  return { momento: momento++, dia, ano_mes: dia.slice(0, 7), metrica, user_id, por: user_id, task_id, project_id };
}
function ev(evento: Evento["evento"], task_id: number, dia = "2026-10-06", project_id = 1): Evento {
  return {
    momento: momento++, dia, ano_mes: dia.slice(0, 7), evento, task_id, titulo: `T${task_id}`, project_id,
    de_coluna: "A", de_papel: "andamento", para_coluna: "B", para_papel: "qa",
    owner_nome: "Pessoa 10", creator_nome: null, movido_por: null, origem: "diff", link: null,
  };
}
function pessoa(user_id: number, grupos: Pessoa["grupos"]): Pessoa {
  return { user_id, nome: `P${user_id}`, nome_kanboard: `Pessoa ${user_id}`, grupos, ativo: true, classificado: true };
}
function dashboard(parcial: Partial<Dashboard>): Dashboard {
  return {
    versao: 1, gerado_em: 0, gerado_em_texto: "",
    coleta: { run_id: "r", momento: 0, momento_texto: "", tarefas: 1, eventos_ledger: 1 },
    regras: { lacuna_horas: 2, expediente: [7, 19], qa_confiavel_desde: "2026-08" },
    projetos: [
      { id: 1, nome: "DEV: A", prefixo: "DEV", ativo: true },
      { id: 2, nome: "WEB: B", prefixo: "WEB", ativo: true, mede_reprovacao: false },
    ],
    fila_qa: [], distribuicao: [], resumo_mensal: [], resumo_mensal_geral: [], cards: [],
    levantamento_anual: [], levantamento_projeto: [], execucoes: [], lacunas: [], eventos: [],
    ...parcial,
  };
}

const SET = { tipo: "mes" as const, mes: "2026-09" };
const AGORA = new Date(2026, 9, 6, 15, 0);
const d = dashboard({
  equipe: { grupos: {}, desde: "2026-08", pessoas: [pessoa(10, ["dev"]), pessoa(5, ["qa"])] },
  atribuicoes: [
    at("entregue_qa", 10, 1), at("entregue_qa", 10, 1), at("entregue_qa", 10, 2),
    at("reprovado", 10, 1), at("reprovado", 10, 1), at("aprovado", 10, 1), at("aprovado", 10, 3),
    at("reprovado", 10, 4, "2026-09-12", 2),          // projeto sem Correções: conta, mas fora da taxa
    at("concluido_sem_qa", 10, 5), at("concluido_sem_qa", 10, 6, "2026-08-30"),  // agosto: fora de setembro
    at("testou_aprovado", 5, 1), at("testou_reprovado", 5, 1), at("testou_reprovado", 5, 2),
    at("testou_devolvido", 5, 7), at("criado", 10, 8),
  ],
  eventos: [ev("entrou_qa", 1), ev("entrou_qa", 1), ev("qa_para_concluida", 2), ev("concluida", 3),
            ev("concluida", 4, "2026-10-06", 2), ev("concluida", 5, "2026-10-05")],
  fila_qa: [
    { task_id: 1, titulo: "T1", projeto: "DEV: A", project_id: 1, coluna: "Teste/QA", designado: "Pessoa 10", criador: "",
      prioridade: 0, entrou_em: 1_790_000_100, dias_em_qa: 1, retornos: 0, link: "" },
  ],
  carga: [
    { task_id: 1, titulo: "T1", project_id: 1, user_id: 10, coluna: "Teste/QA", papel: "qa", desde: 1, prioridade: 0 },
    { task_id: 9, titulo: "T9", project_id: 1, user_id: 10, coluna: "Backlog", papel: "backlog", desde: 1, prioridade: 0 },
    { task_id: 11, titulo: "T11", project_id: 1, user_id: 10, coluna: "Correções", papel: "correcao", desde: 2, prioridade: 0 },
  ],
});
const lista = (c: Partial<Consulta> & Pick<Consulta, "metrica">) =>
  listarCards(d, { periodo: SET, filtro: {}, ...c }, AGORA);

describe("paridade: a lista soma exatamente o número clicado", () => {
  const atribs = atribuicoesDe(d, intervalo(SET, AGORA), {});
  const dev = resumirPorPessoa(atribs, semReprovacao(d)).porPessoa.get(10)!;
  const qa = resumirPorPessoa(atribs, semReprovacao(d)).porPessoa.get(5)!;
  const hoje = { tipo: "dia" as const, dia: "2026-10-06" };

  it("Agora: os quatro contadores do dia", () => {
    const c = contarDia(d.eventos, "2026-10-06", passaNoFiltro(d, {}));
    expect(lista({ metrica: "entrou_qa", periodo: hoje }).total).toBe(c.entraram);
    expect(lista({ metrica: "qa_para_concluida", periodo: hoje }).total).toBe(c.aprovados);
    expect(lista({ metrica: "qa_para_correcao", periodo: hoje }).total).toBe(c.reprovados);
    expect(lista({ metrica: "concluida", periodo: hoje }).total).toBe(c.concluidosSemQa);
  });
  it("Agora: o filtro de frente vale na lista", () => {
    const c = contarDia(d.eventos, "2026-10-06", passaNoFiltro(d, { prefixo: "WEB" }));
    expect(lista({ metrica: "concluida", periodo: hoje, filtro: { prefixo: "WEB" } }).total).toBe(c.concluidosSemQa);
  });
  it("Agora: Em QA agora", () => {
    expect(lista({ metrica: "em_qa" }).total).toBe(kpisHoje(d, AGORA, {}).emQaAgora);
  });
  it("Pessoa/Equipe DEV", () => {
    expect(lista({ metrica: "entregue_qa", pessoa: 10 }).total).toBe(dev.entregues);
    expect(lista({ metrica: "aprovado", pessoa: 10 }).total).toBe(dev.aprovados);
    expect(lista({ metrica: "reprovado", pessoa: 10 }).total).toBe(dev.reprovacoes);
    expect(lista({ metrica: "concluidos", pessoa: 10 }).total).toBe(concluidos(dev));
    expect(lista({ metrica: "concluido_sem_qa", pessoa: 10 }).total).toBe(dev.concluidosSemQa);
    expect(lista({ metrica: "criado", pessoa: 10 }).total).toBe(dev.criados);
  });
  it("Pessoa/Equipe QA: Testados não inclui devolvido", () => {
    expect(lista({ metrica: "testados", pessoa: 5 }).total).toBe(testados(qa));
    expect(lista({ metrica: "testou_devolvido", pessoa: 5 }).total).toBe(qa.testouDevolvido);
  });
  it("taxa: cards e base batem com o resumo (sem os quadros fora da taxa)", () => {
    const r = lista({ metrica: "cards_reprovados", pessoa: 10 });
    expect([r.linhas.length, r.base]).toEqual([dev.cardsReprovados, dev.cardsJulgados]);
    const q = lista({ metrica: "cards_reprovou", pessoa: 5 });
    expect([q.linhas.length, q.base]).toEqual([qa.cardsTestadosReprovados, qa.cardsTestados]);
  });
  it("Abertos: só os papéis da carga (sem backlog)", () => {
    const carga = cargaPorPessoa(d, {}).get(10)!;
    expect(lista({ metrica: "abertos", pessoa: 10 }).total).toBe(PAPEIS_CARGA.reduce((s, p) => s + carga[p], 0));
  });
});

describe("linhas", () => {
  it("uma linha por card, com N× e o mais recente primeiro", () => {
    const r = lista({ metrica: "reprovado", pessoa: 10 });
    expect(r.linhas.map((l) => [l.task_id, l.vezes])).toEqual([[4, 1], [1, 2]]);
    expect(cabecalhoLista(r, "reprovado")).toBe("3 eventos em 2 cards");
  });
  it("N = M: só os cards", () => {
    expect(cabecalhoLista(lista({ metrica: "aprovado", pessoa: 10 }), "aprovado")).toBe("2 cards");
  });
  it("taxa: M de J", () => {
    expect(cabecalhoLista(lista({ metrica: "cards_reprovados", pessoa: 10 }), "cards_reprovados")).toBe("1 de 2 cards julgados");
  });
  it("Concluídos e Testados levam a etiqueta do desfecho", () => {
    const r = lista({ metrica: "concluidos", pessoa: 10 });
    expect(r.linhas.find((l) => l.task_id === 5)?.etiqueta?.texto).toBe("Sem QA");
  });
  it("nome curto da equipe e coluna atual", () => {
    const l = lista({ metrica: "em_qa" }).linhas[0];
    expect([l.pessoa, l.coluna]).toEqual(["P10", "Teste/QA"]);
  });
  it("copiar números", () => {
    expect(textoCopiar(lista({ metrica: "reprovado", pessoa: 10 }).linhas)).toBe("#4, #1");
  });
});

describe("rota da lista", () => {
  it("ida e volta com período dia", () => {
    const c: Consulta = { metrica: "concluida", periodo: { tipo: "dia", dia: "2026-10-06" }, filtro: { prefixo: "DEV" } };
    const hash = escreverRota(rotaDaConsulta(c));
    expect(hash).toBe("#/cards?prefixo=DEV&periodo=2026-10-06&metrica=concluida");
    expect(consultaDaRota(lerRota(hash), AGORA)).toEqual(c);
  });
  it("ida e volta com mês e pessoa", () => {
    const c: Consulta = { metrica: "cards_reprovados", periodo: SET, pessoa: 10, filtro: {} };
    expect(consultaDaRota(lerRota(escreverRota(rotaDaConsulta(c))), AGORA)).toEqual(c);
  });
  it("URL inválida: sem consulta (a tela orienta), sem erro", () => {
    expect(consultaDaRota(lerRota("#/cards?metrica=inventada"), AGORA)).toBeNull();
    expect(lerRota("#/cards?metrica=concluida&periodo=2026-13-45").dia).toBeUndefined();
  });
  it("período inválido com métrica válida: orienta, não troca por outra lista", () => {
    expect(consultaDaRota(lerRota("#/cards?metrica=concluida&periodo=2026-13-45"), AGORA)).toBeNull();
    expect(consultaDaRota(lerRota("#/cards?metrica=concluida&periodo=2026-13"), AGORA)).toBeNull();
    expect(consultaDaRota(lerRota("#/cards?metrica=concluida&periodo=lixo"), AGORA)).toBeNull();
  });
  it("sem período na URL: mês padrão (link legítimo, sem filtro de período)", () => {
    expect(consultaDaRota(lerRota("#/cards?metrica=em_qa"), AGORA)?.metrica).toBe("em_qa");
  });
  it("sair da lista limpa métrica e dia", () => {
    const r = rotaDaTela(lerRota("#/cards?metrica=concluida&periodo=2026-10-06"), "equipe");
    expect([r.metrica, r.dia]).toEqual([undefined, undefined]);
  });
  it("período dia não vaza para outras telas", () => {
    expect(lerRota("#/equipe?periodo=2026-10-06").periodo).toBeUndefined();
  });
});
