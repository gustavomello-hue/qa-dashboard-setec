import { describe, expect, it } from "vitest";
import type { Atribuicao, Dashboard, Metrica, ResumoMensal } from "./contrato";
import { cardsParaConversar, dividirEmLaminas, numerosDoMes, observacoesDoMes } from "./reuniao";

let momento = 1_790_000_000;
function at(metrica: Metrica, user_id: number | null, task_id: number, dia = "2026-09-10"): Atribuicao {
  return { momento: momento++, dia, ano_mes: dia.slice(0, 7), metrica, user_id, por: user_id, task_id, project_id: 1 };
}

function resumo(ano_mes: string, extra: Partial<ResumoMensal>): ResumoMensal {
  return {
    ano_mes, ano: 2026, mes: Number(ano_mes.slice(5)), projeto: "(todos)", project_id: null,
    entradas: 0, cards_distintos: 0, reprovados: 0, aprovados: 0, outras_saidas: 0, saldo_qa: 0,
    taxa_aprovacao: null, tempo_medio_qa_h: null, completude: "completo", horas_qa_soma: 0, pares_qa: 0, ...extra,
  };
}

function dashboard(parcial: Partial<Dashboard>): Dashboard {
  return {
    versao: 1, gerado_em: 0, gerado_em_texto: "",
    coleta: { run_id: "r", momento: 0, momento_texto: "", tarefas: 1, eventos_ledger: 1 },
    regras: { lacuna_horas: 2, expediente: [7, 19], qa_confiavel_desde: "2026-08" },
    projetos: [{ id: 1, nome: "DEV: A", prefixo: "DEV", ativo: true }],
    fila_qa: [], distribuicao: [], resumo_mensal: [], resumo_mensal_geral: [], cards: [],
    levantamento_anual: [], levantamento_projeto: [], execucoes: [], lacunas: [], eventos: [],
    ...parcial,
  };
}

const SET = { de: "2026-09-01", ate: "2026-09-31" };

describe("modo reunião", () => {
  it("números do mês e do anterior, com a % por card", () => {
    const d = dashboard({
      resumo_mensal_geral: [resumo("2026-08", { entradas: 10 }), resumo("2026-09", { entradas: 20, reprovados: 3 })],
      atribuicoes: [at("reprovado", 1, 1), at("aprovado", 1, 2)],
    });
    const { atual, anterior } = numerosDoMes(d, {}, "2026-09");
    expect(atual?.entradas).toBe(20);
    expect([atual?.cardsReprovados, atual?.cardsJulgados, atual?.taxa]).toEqual([1, 2, 50]);
    expect(anterior?.entradas).toBe(10);
    expect(numerosDoMes(d, {}, "2026-08").anterior).toBeNull();
  });

  it("1:1 lista só reprovados mais de uma vez, da própria pessoa", () => {
    const d = dashboard({
      atribuicoes: [at("reprovado", 1, 5), at("reprovado", 1, 5), at("reprovado", 1, 6), at("reprovado", 2, 7), at("reprovado", 2, 7)],
    });
    const c = cardsParaConversar(d, 1, SET, {}, false);
    expect(c.reprovadosVariasVezes.map((x) => x.task_id)).toEqual([5]);
  });

  it("observações: sem autor e saídas por não-QA do mês", () => {
    const d = dashboard({
      atribuicoes: [at("saida_qa_sem_autor", null, 1), at("saida_qa_nao_qa", 9, 2), at("saida_qa_nao_qa", 9, 3), at("saida_qa_nao_qa", 9, 4, "2026-08-10")],
    });
    const o = observacoesDoMes(d, SET, {});
    expect(o.semAutor).toBe(1);
    expect(o.naoQa).toEqual([{ user_id: 9, saidas: 2 }]);
  });

  it("divide a tabela em lâminas de tamanho parecido", () => {
    expect(dividirEmLaminas([...Array(14).keys()], 12).map((l) => l.length)).toEqual([7, 7]);
    expect(dividirEmLaminas([1, 2, 3], 12)).toEqual([[1, 2, 3]]);
  });
});

describe("base parcial e período padrão", () => {
  it("mês reconstruído é parcial; mês completo não", async () => {
    const { mesParcial } = await import("./reuniao");
    const d = dashboard({
      resumo_mensal_geral: [resumo("2026-08", { completude: "parcial (reconstruído)" }), resumo("2026-09", { completude: "completo" })],
    });
    expect(mesParcial(d, "2026-08")).toBe(true);
    expect(mesParcial(d, "2026-09")).toBe(false);
    expect(mesParcial(d, "2026-07")).toBe(false);
  });

  it("nos 5 primeiros dias o padrão é o mês fechado anterior", async () => {
    const { periodoPadrao } = await import("./periodo");
    expect(periodoPadrao(new Date(2026, 9, 1))).toEqual({ tipo: "mes", mes: "2026-09" });
    expect(periodoPadrao(new Date(2026, 9, 6))).toEqual({ tipo: "mes", mes: "2026-10" });
    expect(periodoPadrao(new Date(2027, 0, 3))).toEqual({ tipo: "mes", mes: "2026-12" });
  });

  it("conversa: totais antes do corte e sem cards parados em QA para quem desenvolve", () => {
    const carga = [10, 11, 12].map((t, i) => ({
      task_id: t, titulo: null, project_id: 1, user_id: 1, coluna: "c",
      papel: (i === 0 ? "qa" : "correcao") as "qa" | "correcao", desde: 1_780_000_000 + i, prioridade: 0,
    }));
    const d = dashboard({ carga, atribuicoes: [at("reprovado", 1, 5), at("reprovado", 1, 5)] });
    const dev = cardsParaConversar(d, 1, SET, {}, false, 1);
    expect(dev.abertosMaisAntigos.map((c) => c.task_id)).toEqual([11]);
    expect(dev.totais.abertos).toBe(2);
    expect(cardsParaConversar(d, 1, SET, {}, true).totais.abertos).toBe(3);
  });
});
