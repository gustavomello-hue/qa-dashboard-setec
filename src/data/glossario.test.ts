import { describe, expect, it } from "vitest";
import { DEFINICAO, GLOSSARIO_PROJETOS } from "./glossario";

describe("glossário (etapa 4)", () => {
  it("a tela Projetos explica seus termos e limitações", () => {
    const termos = GLOSSARIO_PROJETOS.map((g) => g.termo);
    expect(termos).toEqual(expect.arrayContaining(["Tempo de ciclo", "Parado", "Não medido", "Poucos dados", "Limitações"]));
  });
  it("a taxa de reprovação diz que só mede quadros com Correções", () => {
    expect(DEFINICAO.cardsReprovados).toContain("coluna de Correções");
  });
});
