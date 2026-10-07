import { describe, expect, it } from "vitest";
import { DEFINICAO, GLOSSARIO, GLOSSARIO_PROJETOS } from "./glossario";

describe("glossário (etapa 4)", () => {
  it("a tela Projetos explica seus termos e limitações", () => {
    const termos = GLOSSARIO_PROJETOS.map((g) => g.termo);
    expect(termos).toEqual(expect.arrayContaining(["Tempo de ciclo", "Parado", "Não medido", "Poucos dados", "Limitações"]));
  });
  it("a taxa de reprovação diz que só mede quadros com Correções", () => {
    expect(DEFINICAO.cardsReprovados).toContain("coluna de Correções");
  });
});

describe("glossário (cards clicáveis)", () => {
  it("explica a lista de cards e a marca N×", () => {
    const verbete = GLOSSARIO.find((g) => g.termo === "Lista de cards");
    expect(verbete?.definicao).toContain("N×");
  });
});

describe("glossário (criados e movimentados)", () => {
  it("explica Criados, Movimentados e a entrada de card criado em QA", () => {
    const termos = GLOSSARIO.map((g) => g.termo);
    expect(termos).toEqual(expect.arrayContaining(["Criados", "Movimentados"]));
    expect(DEFINICAO.entregues).toContain("criados direto em Teste/QA");
    expect(DEFINICAO.movimentou).toContain("Interrompidas");
  });
});
