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
  link(token: Tokens.Link) {
    const texto = this.parser.parseInline(token.tokens);
    if (!PROTOCOLO_SEGURO.test(token.href)) return texto;
    const titulo = token.title ? ` title="${escapar(token.title)}"` : "";
    return `<a href="${escapar(token.href)}" target="_blank" rel="noreferrer"${titulo}>${texto}</a>`;
  },
};

const md = new Marked({ gfm: true, breaks: true, renderer });

export function descricaoHtml(texto: string): string {
  return md.parse(texto, { async: false }) as string;
}
