import { describe, expect, it } from "vitest";
import type { ProjetoFluxo, ProjetosFluxo } from "./contrato";
import { abertos, filtrarProjetos, mesAtual, ordenarProjetos, semMovimento } from "./projetos";

const proj = (p: Partial<ProjetoFluxo>): ProjetoFluxo => ({
  id: 1, nome: "X", grupo: "geral", link: "", mede_saida: true, abertos_por_papel: {}, colunas: [],
  mensal: [], ciclo_90d: { mediana: null, p85: null, n: 0 }, parados_total: 0, parados: [], ...p,
});
const mes = (ano_mes: string, entradas = 0, saidas: number | null = 0) =>
  ({ ano_mes, entradas, saidas, ciclo_mediana: null, ciclo_p85: null, ciclo_n: 0 });

const fluxo: ProjetosFluxo = {
  parado_dias: 15, janela_ciclo_dias: 90, fechadas_em: null,
  projetos: [
    proj({ id: 1, nome: "Secom", grupo: "geral", parados_total: 3, abertos_por_papel: { andamento: 2, backlog: 5 } }),
    proj({ id: 2, nome: "DEV: SGO", grupo: "qa", parados_total: 9, abertos_por_papel: { qa: 1 } }),
    proj({ id: 3, nome: "GTI", grupo: "geral", parados_total: 0, ciclo_90d: { mediana: 4, p85: 9, n: 7 }, mensal: [mes("2026-10", 1)] }),
    proj({ id: 4, nome: "Parado de vez", grupo: "geral" }),
  ],
};

describe("tela Projetos", () => {
  it("frente demais/qa/todos", () => {
    expect(filtrarProjetos(fluxo, "demais", "", true).map((p) => p.id)).toEqual([1, 3, 4]);
    expect(filtrarProjetos(fluxo, "qa", "", true).map((p) => p.id)).toEqual([2]);
    expect(filtrarProjetos(fluxo, "todos", "", true).length).toBe(4);
  });
  it("busca sem acento e sem caixa", () => {
    expect(filtrarProjetos(fluxo, "todos", "sécom", true).map((p) => p.id)).toEqual([1]);
  });
  it("projeto sem movimento fica oculto até pedir", () => {
    expect(semMovimento(fluxo.projetos[3])).toBe(true);
    expect(semMovimento(fluxo.projetos[2])).toBe(false);
    expect(filtrarProjetos(fluxo, "demais", "", false).map((p) => p.id)).toEqual([1, 3]);
  });
  it("abertos soma os papéis", () => {
    expect(abertos(fluxo.projetos[0])).toBe(7);
  });
  it("ordena por parados desc e manda nulos para o fim", () => {
    expect(ordenarProjetos(fluxo.projetos, "parados", true).map((p) => p.id)).toEqual([2, 1, 3, 4]);
    expect(ordenarProjetos(fluxo.projetos, "ciclo", false).map((p) => p.id)).toEqual([3, 2, 4, 1]);
  });
  it("mês atual", () => {
    const p = proj({ mensal: [mes("2026-10", 2, null)] });
    expect(mesAtual(p, new Date(2026, 9, 5))?.saidas).toBeNull();
    expect(mesAtual(p, new Date(2026, 10, 5))).toBeUndefined();
  });
});
