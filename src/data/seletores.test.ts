import { describe, expect, it } from "vitest";
import type { Dashboard, Evento, ResumoMensal } from "./contrato";
import {
  contarDia,
  diaLocal,
  estadoAtualizacao,
  kpisHoje,
  lacunasRecentes,
  resumoPorMes,
  ultimoDiaUtil,
} from "./seletores";
import { escreverRota, lerRota } from "./rota";
import { sequenciaAtracao } from "./atracao";
import { inicioDaUltimaColeta, paginar } from "./seletores";

const ts = (s: string) => Math.floor(new Date(s).getTime() / 1000);

function evento(tipo: Evento["evento"], quando: string, project_id = 1): Evento {
  const d = new Date(quando);
  return {
    momento: ts(quando), dia: diaLocal(d), ano_mes: diaLocal(d).slice(0, 7),
    evento: tipo, task_id: 10, titulo: "t", project_id,
    de_coluna: null, de_papel: null, para_coluna: null, para_papel: null,
    owner_nome: null, creator_nome: null, movido_por: null, origem: "diff", link: null,
  };
}

function resumo(ano_mes: string, project_id: number | null, extra: Partial<ResumoMensal>): ResumoMensal {
  return {
    ano_mes, ano: 2026, mes: Number(ano_mes.slice(5)), projeto: "p", project_id,
    entradas: 0, cards_distintos: 0, reprovados: 0, aprovados: 0, outras_saidas: 0,
    saldo_qa: 0, taxa_aprovacao: null, tempo_medio_qa_h: null, completude: "completo",
    horas_qa_soma: 0, pares_qa: 0, ...extra,
  };
}

function dashboard(parcial: Partial<Dashboard> = {}): Dashboard {
  return {
    versao: 1, gerado_em: 0, gerado_em_texto: "",
    coleta: { run_id: "r", momento: ts("2026-09-28T15:00:00"), momento_texto: "", tarefas: 1, eventos_ledger: 1 },
    regras: { lacuna_horas: 2, expediente: [12, 19], qa_confiavel_desde: "2026-08" },
    projetos: [
      { id: 1, nome: "DEV: A", prefixo: "DEV", ativo: true },
      { id: 2, nome: "WEB: B", prefixo: "WEB", ativo: true },
    ],
    fila_qa: [], distribuicao: [], resumo_mensal: [], resumo_mensal_geral: [], cards: [],
    levantamento_anual: [], levantamento_projeto: [],
    execucoes: [], lacunas: [], eventos: [],
    ...parcial,
  };
}

describe("dias", () => {
  it("último dia útil de uma segunda é a sexta", () => {
    expect(diaLocal(ultimoDiaUtil(new Date("2026-09-28T10:00:00")))).toBe("2026-09-25");
  });
  it("último dia útil de uma quarta é a terça", () => {
    expect(diaLocal(ultimoDiaUtil(new Date("2026-09-30T10:00:00")))).toBe("2026-09-29");
  });
});

describe("KPIs de hoje", () => {
  const eventos = [
    evento("entrou_qa", "2026-09-28T13:00:00"),
    evento("qa_para_concluida", "2026-09-28T14:00:00"),
    evento("qa_para_correcao", "2026-09-28T14:30:00", 2),
    evento("entrou_qa", "2026-09-25T13:00:00"),
    evento("entrou_qa", "2026-09-27T13:00:00"), // domingo: fica fora das duas contagens
  ];

  it("conta só o dia pedido", () => {
    expect(contarDia(eventos, "2026-09-28", () => true)).toEqual({ entraram: 1, aprovados: 1, reprovados: 1, concluidosSemQa: 0 });
  });

  it("na segunda compara com a sexta e respeita o filtro", () => {
    const d = dashboard({ eventos });
    const k = kpisHoje(d, new Date("2026-09-28T16:00:00"), { prefixo: "DEV" });
    expect(k.hoje).toEqual({ entraram: 1, aprovados: 1, reprovados: 0, concluidosSemQa: 0 });
    expect(k.diaComparacao).toBe("2026-09-25");
    expect(k.comparacao.entraram).toBe(1);
  });
});

describe("resumo mensal filtrado", () => {
  const d = dashboard({
    resumo_mensal: [
      resumo("2026-07", 1, { entradas: 50 }), // antes de qa_confiavel_desde
      resumo("2026-09", 1, { aprovados: 3, reprovados: 1, horas_qa_soma: 30, pares_qa: 3 }),
      resumo("2026-09", 2, { aprovados: 1, reprovados: 3, horas_qa_soma: 10, pares_qa: 1 }),
    ],
  });

  it("refaz taxa e média a partir das somas, não da média de médias", () => {
    const [set] = resumoPorMes(d, { prefixo: undefined, projeto: 1 });
    expect(set.taxa_aprovacao).toBe(75);
    const todos = resumoPorMes(dashboard({ ...d, resumo_mensal_geral: [] }), { prefixo: "DEV" });
    expect(todos.map((r) => r.ano_mes)).toEqual(["2026-09"]);
  });

  it("somando dois projetos: 40h / 4 pares = 10h, taxa 4/8 = 50%", () => {
    const soma = resumoPorMes(
      { ...d, projetos: d.projetos.map((p) => ({ ...p, prefixo: "DEV" as const })) },
      { prefixo: "DEV" },
    );
    expect(soma[0].tempo_medio_qa_h).toBe(10);
    expect(soma[0].taxa_aprovacao).toBe(50);
  });
});

describe("atualização e lacunas", () => {
  const d = dashboard();
  it("3h sem coleta no expediente de dia útil = atrasado", () => {
    expect(estadoAtualizacao(d, new Date("2026-09-28T18:00:00")).atrasado).toBe(true);
  });
  it("fora do expediente não acusa atraso", () => {
    expect(estadoAtualizacao(d, new Date("2026-09-28T22:00:00")).atrasado).toBe(false);
  });
  it("lacunas dos últimos 7 dias", () => {
    const l = { inicio: 0, horas: 3, horas_expediente: 3, movimentacoes_perdidas: 0 };
    const d2 = dashboard({ lacunas: [{ ...l, fim: ts("2026-09-10T12:00:00") }, { ...l, fim: ts("2026-09-27T12:00:00") }] });
    expect(lacunasRecentes(d2, new Date("2026-09-28T12:00:00"))).toHaveLength(1);
  });
});

describe("rota na URL", () => {
  it("ida e volta preserva aba e filtros", () => {
    const r = { tela: "mensal" as const, filtro: { prefixo: "DEV" as const, projeto: 252 } };
    expect(lerRota(escreverRota(r))).toEqual(r);
  });
  it("hash desconhecido (e o antigo #/hoje) cai em Agora sem filtro", () => {
    expect(lerRota("#/xyz?prefixo=FOO")).toEqual({ tela: "agora", filtro: {} });
    expect(lerRota("#/hoje").tela).toBe("agora");
  });
  it("pessoa, período e inativos vão e voltam", () => {
    const r = lerRota("#/pessoa?pessoa=96&periodo=2026-09&inativos");
    expect(r).toEqual({ tela: "pessoa", filtro: {}, pessoa: 96, periodo: { tipo: "mes", mes: "2026-09" }, inativos: true });
    expect(escreverRota(r)).toBe("#/pessoa?periodo=2026-09&pessoa=96&inativos");
    expect(lerRota("#/equipe?periodo=7d").periodo).toEqual({ tipo: "7d" });
    expect(lerRota("#/equipe?periodo=lixo").periodo).toBeUndefined();
  });
});

describe("modo atração", () => {
  it("?fora sobrevive à ida e volta junto com filtros", () => {
    const r = lerRota("#/agora?prefixo=WEB&fora");
    expect(r.fora).toBe(true);
    expect(escreverRota(r)).toBe("#/agora?prefixo=WEB&fora");
  });
  it("?tv liga o modo e sobrevive à ida e volta", () => {
    const r = lerRota("#/agora?tv");
    expect(r.tv).toBe(true);
    expect(escreverRota(r)).toBe("#/agora?tv");
  });
  it("sequência: Agora, Equipe, Mensal e só prefixos com card em QA", () => {
    const seq = sequenciaAtracao((f) => (f.prefixo === undefined ? 2 : f.prefixo === "DEV" ? 1 : 0));
    expect(seq.map((q) => `${q.tela}:${q.filtro.prefixo ?? "*"}`)).toEqual([
      "agora:*", "equipe:*", "mensal:*", "agora:DEV",
    ]);
  });
});

describe("novidade e paginação", () => {
  it("coleta anterior é a última execução antes da atual", () => {
    const d = dashboard({ execucoes: [100, 3700, ts("2026-09-28T15:00:00")] });
    expect(inicioDaUltimaColeta(d)).toBe(3700);
  });
  it("paginar prende a página no intervalo", () => {
    expect(paginar([1, 2, 3, 4, 5], 2, 9)).toEqual({ itens: [5], total: 3 });
    expect(paginar([], 2, 0)).toEqual({ itens: [], total: 1 });
  });
});

describe("etiquetas do título", async () => {
  const { separarEtiquetas } = await import("./formato");
  it("tira os colchetes do começo", () => {
    expect(separarEtiquetas("[QA][Cata-treco] Registrar solicitação")).toEqual({
      etiquetas: "[QA][Cata-treco]", resto: "Registrar solicitação",
    });
  });
  it("separador depois da etiqueta não sobra no título", () => {
    expect(separarEtiquetas("[Portal] - Ajustar título institucional").resto).toBe("Ajustar título institucional");
    expect(separarEtiquetas("[API] : Consulta").resto).toBe("Consulta");
  });
  it("título sem etiqueta fica igual", () => {
    expect(separarEtiquetas("Multi-Evento - Falha no envio")).toEqual({ etiquetas: "", resto: "Multi-Evento - Falha no envio" });
  });
  it("título que é só etiqueta não some", () => {
    expect(separarEtiquetas("[QA] ").resto).toBe("[QA]");
  });
});
