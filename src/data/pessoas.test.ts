import { describe, expect, it } from "vitest";
import type { Atribuicao, Dashboard, Metrica, Pessoa } from "./contrato";
import {
  atribuicoesDe, cargaPorPessoa, cardsDaMetrica, composicaoPorMes, grupoPrincipal, inicioDaSemana,
  porSemana, resumirPorPessoa, semanaIncompleta, semanas, taxaReprovacao, taxaReprovacaoQa,
} from "./pessoas";
import { intervalo, intervaloAnterior, mesesDisponiveis, rotuloAnterior, ultimoDia } from "./periodo";

let momento = 1_790_000_000;
function at(metrica: Metrica, user_id: number | null, task_id: number, dia = "2026-09-10", project_id = 1): Atribuicao {
  return { momento: momento++, dia, ano_mes: dia.slice(0, 7), metrica, user_id, por: user_id, task_id, project_id };
}

function pessoa(user_id: number, grupos: Pessoa["grupos"], ativo: boolean | null = true): Pessoa {
  return { user_id, nome: `P${user_id}`, nome_kanboard: `Pessoa ${user_id}`, grupos, ativo, classificado: ativo !== null };
}

function dashboard(parcial: Partial<Dashboard>): Dashboard {
  return {
    versao: 1, gerado_em: 0, gerado_em_texto: "",
    coleta: { run_id: "r", momento: 0, momento_texto: "", tarefas: 1, eventos_ledger: 1 },
    regras: { lacuna_horas: 2, expediente: [7, 19], qa_confiavel_desde: "2026-08" },
    projetos: [{ id: 1, nome: "DEV: A", prefixo: "DEV", ativo: true }, { id: 2, nome: "WEB: B", prefixo: "WEB", ativo: true }],
    fila_qa: [], distribuicao: [], resumo_mensal: [], resumo_mensal_geral: [], cards: [],
    levantamento_anual: [], levantamento_projeto: [], execucoes: [], lacunas: [], eventos: [],
    ...parcial,
  };
}

describe("resumo por pessoa", () => {
  const atribs = [
    at("reprovado", 10, 1), at("reprovado", 10, 1), at("aprovado", 10, 1),
    at("aprovado", 10, 2), at("reprovado", 10, 3),
    at("testou_reprovado", 5, 1), at("testou_aprovado", 5, 2),
    at("saida_qa_sem_autor", null, 9),
  ];
  const { porPessoa, saidasSemAutor } = resumirPorPessoa(atribs);
  const dev = porPessoa.get(10)!;

  it("reprovação conta eventos e cards distintos", () => {
    expect(dev.reprovacoes).toBe(3);
    expect(dev.cardsReprovados).toBe(2);
  });
  it("taxa por card: 2 de 3 cards julgados foram reprovados", () => {
    expect(dev.cardsJulgados).toBe(3);
    expect(taxaReprovacao(dev)).toBe(66.7);
  });
  it("taxa do QA e sem autor à parte", () => {
    expect(taxaReprovacaoQa(porPessoa.get(5)!)).toBe(50);
    expect(saidasSemAutor).toBe(1);
    expect(porPessoa.has(null as unknown as number)).toBe(false);
  });
});

describe("filtro de período e projeto", () => {
  const d = dashboard({
    atribuicoes: [at("entregue_qa", 1, 1, "2026-08-31"), at("entregue_qa", 1, 2, "2026-09-01"), at("entregue_qa", 1, 3, "2026-09-02", 2)],
  });
  const set = intervalo({ tipo: "mes", mes: "2026-09" }, new Date(2026, 8, 30));
  it("mês pega só os dias do mês", () => {
    expect(atribuicoesDe(d, set, {}).map((a) => a.task_id)).toEqual([2, 3]);
  });
  it("prefixo filtra pelo projeto", () => {
    expect(atribuicoesDe(d, set, { prefixo: "WEB" }).map((a) => a.task_id)).toEqual([3]);
  });
  it("anterior de setembro é agosto; 7 dias anteriores encostam", () => {
    // Setembro já fechado (hoje é outubro): compara com agosto inteiro.
    expect(intervaloAnterior({ tipo: "mes", mes: "2026-09" }, new Date(2026, 9, 5))).toEqual({ de: "2026-08-01", ate: "2026-08-31" });
    const hoje = new Date(2026, 8, 30);
    expect(intervalo({ tipo: "7d" }, hoje)).toEqual({ de: "2026-09-24", ate: "2026-09-30" });
    expect(intervaloAnterior({ tipo: "7d" }, hoje)).toEqual({ de: "2026-09-17", ate: "2026-09-23" });
  });
  it("mês em andamento compara com o mesmo trecho do anterior", () => {
    const dia3 = new Date(2026, 9, 3);
    expect(intervaloAnterior({ tipo: "mes", mes: "2026-10" }, dia3)).toEqual({ de: "2026-09-01", ate: "2026-09-03" });
    expect(rotuloAnterior({ tipo: "mes", mes: "2026-10" }, dia3)).toBe("set/26 até dia 3");
    expect(rotuloAnterior({ tipo: "mes", mes: "2026-09" }, dia3)).toBe("ago/26");
    // 31 de março contra fevereiro: para no último dia de fevereiro.
    expect(intervaloAnterior({ tipo: "mes", mes: "2027-03" }, new Date(2027, 2, 31)).ate).toBe("2027-02-28");
  });
  it("semana incompleta: quarta sim, domingo não", () => {
    expect(semanaIncompleta("2026-09-30")).toBe(true);
    expect(semanaIncompleta("2026-10-04")).toBe(false);
  });
  it("virada de ano no mês anterior", () => {
    expect(intervaloAnterior({ tipo: "mes", mes: "2027-01" }, new Date()).de).toBe("2026-12-01");
  });
  it("último dia real: fevereiro e mês corrente", () => {
    expect(ultimoDia({ de: "2027-02-01", ate: "2027-02-31" }, new Date(2027, 5, 1))).toBe("2027-02-28");
    expect(ultimoDia({ de: "2026-09-01", ate: "2026-09-31" }, new Date(2026, 8, 15))).toBe("2026-09-15");
  });
  it("meses disponíveis do mais novo ao mais velho", () => {
    expect(mesesDisponiveis("2026-08", new Date(2026, 9, 5))).toEqual(["2026-10", "2026-09", "2026-08"]);
  });
});

describe("semanas", () => {
  it("segunda-feira da semana (quarta 30/09 -> segunda 28/09; domingo volta 6 dias)", () => {
    expect(inicioDaSemana("2026-09-30")).toBe("2026-09-28");
    expect(inicioDaSemana("2026-10-04")).toBe("2026-09-28");
  });
  it("n semanas terminando na semana pedida", () => {
    expect(semanas("2026-09-30", 3)).toEqual(["2026-09-14", "2026-09-21", "2026-09-28"]);
  });
  it("conta por semana só a pessoa e as métricas pedidas", () => {
    const atribs = [at("entregue_qa", 1, 1, "2026-09-15"), at("entregue_qa", 1, 2, "2026-09-29"), at("entregue_qa", 2, 3, "2026-09-29"), at("aprovado", 1, 4, "2026-09-29")];
    expect(porSemana(atribs, 1, ["entregue_qa"], semanas("2026-09-30", 3))).toEqual([1, 0, 1]);
  });
});

describe("carga, cards e composição", () => {
  it("carga soma por pessoa e respeita o filtro", () => {
    const d = dashboard({
      carga: [
        { task_id: 1, titulo: null, project_id: 1, user_id: 7, coluna: "QA", papel: "qa", desde: null, prioridade: 0 },
        { task_id: 2, titulo: null, project_id: 2, user_id: 7, coluna: "And.", papel: "andamento", desde: null, prioridade: 0 },
      ],
    });
    expect(cargaPorPessoa(d, {}).get(7)?.qa).toBe(1);
    expect(cargaPorPessoa(d, { prefixo: "DEV" }).get(7)?.andamento).toBe(0);
  });
  it("cards da métrica com vezes, mais reprovado primeiro", () => {
    const lista = cardsDaMetrica([at("reprovado", 1, 5), at("reprovado", 1, 6), at("reprovado", 1, 6)], 1, "reprovado");
    expect(lista.map((c) => [c.task_id, c.vezes])).toEqual([[6, 2], [5, 1]]);
  });
  it("estagiário de QA conta como estagiário na composição", () => {
    expect(grupoPrincipal(pessoa(1, ["qa", "estagiario_qa"]))).toBe("estagiario_qa");
    expect(grupoPrincipal(undefined)).toBe("outros");
  });
  it("composição separa entregas por grupo e conta criados da gestão", () => {
    const d = dashboard({
      equipe: { grupos: {}, desde: "2026-08", pessoas: [pessoa(1, ["dev"]), pessoa(2, ["estagiario_dev"]), pessoa(3, ["gestao"])] },
      atribuicoes: [at("entregue_qa", 1, 1), at("entregue_qa", 2, 2), at("entregue_qa", 99, 3), at("criado", 3, 4), at("criado", 1, 5)],
    });
    const [set] = composicaoPorMes(d, {});
    expect(set.entregues.dev).toBe(1);
    expect(set.entregues.estagiario_dev).toBe(1);
    expect(set.entregues.outros).toBe(1);
    expect(set.criadosGestao).toBe(1);
  });
});

describe("% de cards reprovados por mês", () => {
  it("conta card distinto, na equipe toda, e respeita o filtro", async () => {
    const { taxaCardsPorMes } = await import("./pessoas");
    const d = dashboard({
      atribuicoes: [
        at("reprovado", 1, 1), at("reprovado", 1, 1), at("aprovado", 2, 1), // card 1: julgado e reprovado
        at("aprovado", 1, 2), // card 2: só aprovado
        at("reprovado", 2, 3, "2026-09-10", 2), // card 3: outro projeto (WEB)
      ],
    });
    const set = taxaCardsPorMes(d, {}).get("2026-09")!;
    expect([set.cardsJulgados, set.cardsReprovados, set.taxa]).toEqual([3, 2, 66.7]);
    expect(taxaCardsPorMes(d, { prefixo: "DEV" }).get("2026-09")!.taxa).toBe(50);
  });
});
