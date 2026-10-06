import { describe, expect, it } from "vitest";
import { descricaoHtml } from "./markdown";

describe("descrição em Markdown", () => {
  it("formata o básico", () => {
    const html = descricaoHtml("**Passos**\n\n1. abrir\n2. salvar\n\n`codigo`");
    expect(html).toContain("<strong>Passos</strong>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<code>codigo</code>");
  });
  it("imagem some sem deixar marca", () => {
    const html = descricaoHtml("antes ![print](https://kb/img.png) depois");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("print");
    expect(html).toContain("antes");
    expect(html).toContain("depois");
  });
  it("HTML cru vira texto", () => {
    const html = descricaoHtml('<script>alert(1)</script> <img src=x onerror="alert(2)">');
    expect(html).not.toMatch(/<script|<img/);
    expect(html).toContain("&lt;script&gt;");
  });
  it("link só com http, https ou mailto, em nova aba", () => {
    expect(descricaoHtml("[ok](https://a.b/c)")).toContain('<a href="https://a.b/c" target="_blank" rel="noreferrer">ok</a>');
    const ruim = descricaoHtml("[x](javascript:alert(1))");
    expect(ruim).not.toContain("<a");
    expect(ruim).toContain("x");
  });
});
