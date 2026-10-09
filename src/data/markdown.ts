// Descrição do card (Markdown do Kanboard) em HTML seguro para a tela Card.
//
// Sem DOM e sem sanitizador externo: o renderer só produz o que o Markdown
// produz. HTML cru vira texto escapado, imagem some (decisão do usuário:
// sem imagens, sem marca) e link só sai para http, https ou mailto.

import { Marked, type RendererObject, type Tokens } from "marked";

const ESCAPE: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapar = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPE[c]);
const PROTOCOLO_SEGURO = /^(https?:|mailto:)/i;

const renderer: RendererObject = {
  html(token: Tokens.HTML | Tokens.Tag) {
    return escapar(token.text);
  },
  image() {
    return "";
  },
  // A descrição mora sob o h3 "Descrição" da tela Card: o menor nível usado vira h4
  // (texto que começa em ## não pula de h3 para h5), os seguintes descem até h6.
  heading(token: Tokens.Heading) {
    const nivel = Math.min(Math.max(token.depth + deslocamento, 4), 6);
    return `<h${nivel}>${this.parser.parseInline(token.tokens)}</h${nivel}>\n`;
  },
  link(token: Tokens.Link) {
    const texto = this.parser.parseInline(token.tokens);
    if (!PROTOCOLO_SEGURO.test(token.href)) return texto;
    const titulo = token.title ? ` title="${escapar(token.title)}"` : "";
    return `<a href="${escapar(token.href)}" target="_blank" rel="noreferrer"${titulo}>${texto}</a>`;
  },
};

const md = new Marked({ gfm: true, breaks: true, renderer });

/** Quanto somar ao nível de cada título; recalculado a cada descrição. */
let deslocamento = 3;

export function descricaoHtml(texto: string): string {
  const tokens = md.lexer(texto);
  const niveis = tokens.filter((t): t is Tokens.Heading => t.type === "heading").map((t) => t.depth);
  deslocamento = 4 - (niveis.length ? Math.min(...niveis) : 1);
  return md.parser(tokens);
}
