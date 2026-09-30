// Formatação pt-BR usada pelas telas.

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function numero(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function hora(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function dataCurta(ts: number): string {
  const d = new Date(ts * 1000);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function dataHora(ts: number): string {
  return `${dataCurta(ts)} ${hora(ts)}`;
}

/** "2026-09-25" -> "sex 25/09". */
export function diaCurto(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  return `${DIAS[new Date(a, m - 1, d).getDay()]} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

/** "2026-09" -> "set/26". */
export function mesCurto(anoMes: string): string {
  const [a, m] = anoMes.split("-");
  return `${MESES[Number(m) - 1]}/${a.slice(2)}`;
}

export function haQuanto(minutos: number): string {
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const h = Math.floor(minutos / 60);
  if (h < 48) return `há ${h} h`;
  return `há ${Math.floor(h / 24)} dias`;
}

/** Dias corridos desde um timestamp. */
export function diasDesde(ts: number | null, agora = Date.now()): number | null {
  return ts ? Math.floor((agora / 1000 - ts) / 86400) : null;
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
  entrou_qa: "Entrou em QA",
  qa_para_concluida: "Aprovado",
  qa_para_correcao: "Reprovado",
  qa_para_outra: "Devolvido",
  entrou_correcao: "Foi para correção",
  concluida: "Concluído sem QA",
  criada: "Criado",
  movimentacao: "Movido",
  movimentacao_perdida: "Movimento não visto",
  sumiu: "Saiu dos abertos",
  fechada: "Fechado",
  mudou_projeto: "Mudou de projeto",
  bootstrap: "Início da medição",
};

export const NOME_PAPEL: Record<string, string> = {
  backlog: "Backlog",
  a_iniciar: "A iniciar",
  andamento: "Em andamento",
  interrompida: "Interrompido",
  correcao: "Correções",
  qa: "Teste/QA",
  concluida: "Concluídas",
  outra: "Outras",
};

/** Duração legível: "45 min", "71 h", "3 dias". Horas até 48 h; dias daí para cima. */
export function duracao(segundos: number): string {
  const min = Math.max(0, Math.round(segundos / 60));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h} h`;
  const dias = Math.round(h / 24);
  return `${dias} dias`;
}
