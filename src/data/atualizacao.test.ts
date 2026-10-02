import { describe, expect, it } from "vitest";
import { OCIOSO_MS, TRAVA_RECARGA_MS, decidirRecarga, intervaloBusca, podeRecarregarPorContrato } from "./atualizacao";

const as = (h: number, min = 0) => new Date(2026, 9, 2, h, min);

describe("intervaloBusca", () => {
  it("busca a cada 1 min no expediente da coleta (7h–19h)", () => {
    expect(intervaloBusca(as(7))).toBe(60 * 1000);
    expect(intervaloBusca(as(12, 40))).toBe(60 * 1000);
    expect(intervaloBusca(as(18, 59))).toBe(60 * 1000);
  });

  it("busca a cada 10 min fora dele", () => {
    expect(intervaloBusca(as(6, 59))).toBe(10 * 60 * 1000);
    expect(intervaloBusca(as(19))).toBe(10 * 60 * 1000);
    expect(intervaloBusca(as(23, 30))).toBe(10 * 60 * 1000);
  });
});

describe("decidirRecarga", () => {
  it("aba oculta recarrega na hora, até na apresentação", () => {
    expect(decidirRecarga({ oculta: true, ociosoMs: 0, apresentando: false })).toBe("agora");
    expect(decidirRecarga({ oculta: true, ociosoMs: 0, apresentando: true })).toBe("agora");
  });

  it("alguém usando: avisa; sem uso por 2 min: recarrega", () => {
    expect(decidirRecarga({ oculta: false, ociosoMs: OCIOSO_MS - 1, apresentando: false })).toBe("avisar");
    expect(decidirRecarga({ oculta: false, ociosoMs: OCIOSO_MS, apresentando: false })).toBe("agora");
  });

  it("apresentação visível nunca recarrega sozinha", () => {
    expect(decidirRecarga({ oculta: false, ociosoMs: 60 * 60 * 1000, apresentando: true })).toBe("esperar");
  });
});

describe("podeRecarregarPorContrato", () => {
  it("primeira vez recarrega; de novo só depois da trava de 10 min", () => {
    const t = 1_000_000_000;
    expect(podeRecarregarPorContrato(null, t)).toBe(true);
    expect(podeRecarregarPorContrato(t, t + TRAVA_RECARGA_MS - 1)).toBe(false);
    expect(podeRecarregarPorContrato(t, t + TRAVA_RECARGA_MS)).toBe(true);
  });
});
