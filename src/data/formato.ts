// Formatação pt-BR usada pelas telas. Sem arredondar para "parecer pontos":
// o zero à esquerda é só a célula fixa do placar; o valor é o exato.

const DIAS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export function placar(n: number, casas = 3): string {
  return String(n).padStart(casas, "0");
}

export function hora(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function dataHora(ts: number): string {
  const d = new Date(ts * 1000);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${hora(ts)}`;
}

/** "2026-09-25" -> "SEX 25". */
export function diaCurto(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  return `${DIAS[new Date(a, m - 1, d).getDay()]} ${String(d).padStart(2, "0")}`;
}

/** "2026-09" -> "SET 26". */
export function mesCurto(anoMes: string): string {
  const [a, m] = anoMes.split("-");
  return `${MESES[Number(m) - 1]} ${a.slice(2)}`;
}

export function haQuanto(minutos: number): string {
  if (minutos < 60) return `HÁ ${minutos} MIN`;
  const h = Math.floor(minutos / 60);
  if (h < 48) return `HÁ ${h} H`;
  return `HÁ ${Math.floor(h / 24)} DIAS`;
}

/** "DEV: SIGIC - Sistema de Gestão..." -> "SIGIC - Sistema de Gestão...". */
export function nomeCurto(projeto: string): string {
  return projeto.replace(/^\s*(DEV|WEB|MOB|GEO)\s*:\s*/i, "").trim();
}

/**
 * "[QA][Cata-treco] Registrar solicitação" -> etiquetas "[QA][Cata-treco]" e
 * resto "Registrar solicitação". As etiquetas vão para a linha de apoio: no
 * celular elas sozinhas ocupavam as linhas do título.
 */
export function separarEtiquetas(titulo: string): { etiquetas: string; resto: string } {
  const m = titulo.match(/^\s*((?:\[[^\]]*\]\s*)+)(.*)$/);
  if (!m || !m[2].trim()) return { etiquetas: "", resto: titulo.trim() };
  // "[Portal] - Ajustar título" não pode sobrar como "- Ajustar título".
  const resto = m[2].replace(/^[\s\-–—:|]+/, "").trim() || m[2].trim();
  return { etiquetas: m[1].replace(/\]\s*\[/g, "][").trim(), resto };
}

export function porcento(v: number | null): string {
  return v === null ? "—" : `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export const NOME_EVENTO: Record<string, string> = {
  entrou_qa: "ENTROU EM QA",
  qa_para_concluida: "APROVADO",
  qa_para_correcao: "REPROVADO",
  qa_para_outra: "SAIU DE QA",
  entrou_correcao: "FOI P/ CORREÇÃO",
  concluida: "CONCLUÍDO",
  criada: "CRIADO",
  movimentacao: "MOVIDO",
  movimentacao_perdida: "MOVIMENTO NÃO VISTO",
  sumiu: "SAIU DOS ABERTOS",
  fechada: "FECHADO",
  mudou_projeto: "MUDOU DE PROJETO",
  bootstrap: "INÍCIO DA MEDIÇÃO",
};

export const NOME_PAPEL: Record<string, string> = {
  backlog: "BACKLOG",
  a_iniciar: "A INICIAR",
  andamento: "ANDAMENTO",
  interrompida: "INTERROMPIDO",
  correcao: "CORREÇÕES",
  qa: "TESTE/QA",
  concluida: "CONCLUÍDAS",
  outra: "OUTRAS",
};
