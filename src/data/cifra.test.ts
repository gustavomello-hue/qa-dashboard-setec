import { describe, expect, it } from "vitest";
import { ErroSenha, decifrar, derivarChave, ehEnvelope, exportarChave, importarChave, type Envelope } from "./cifra";
import fixture from "./cifra.fixture.json";

// O fixture foi cifrado pelo scripts/cifra_dados.py: este teste garante que
// o navegador abre exatamente o que o publicador produz.
const envelope = fixture as Envelope;
const SENHA = "frase de teste do painel com acentuação";

describe("cifra (Python → navegador)", () => {
  it("reconhece o envelope", () => {
    expect(ehEnvelope(envelope)).toBe(true);
    expect(ehEnvelope({ versao: 1 })).toBe(false);
  });

  it("a senha certa abre o JSON do publicador, acentos inclusive", async () => {
    const chave = await derivarChave(SENHA, envelope.kdf);
    expect(await decifrar(envelope, chave)).toEqual({ versao: 1, gerado_em: 1790000000, teste: "ação com acentuação" });
  });

  it("senha errada vira ErroSenha, não dado estranho", async () => {
    const chave = await derivarChave("outra frase qualquer bem comprida", envelope.kdf);
    await expect(decifrar(envelope, chave)).rejects.toBeInstanceOf(ErroSenha);
  });

  it("a chave lembrada (exportada e importada) continua abrindo", async () => {
    const lembrada = await importarChave(await exportarChave(await derivarChave(SENHA, envelope.kdf)));
    expect(await decifrar(envelope, lembrada)).toMatchObject({ versao: 1 });
  });
});
