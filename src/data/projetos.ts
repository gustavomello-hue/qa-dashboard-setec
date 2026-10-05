import type { MesFluxo, ProjetoFluxo, ProjetosFluxo } from "./contrato";

// Seletores da tela Projetos (etapa 4). Os números vêm prontos do Python
// (metricas_projetos.py); aqui só se filtra, busca e ordena.

export type FrenteFluxo = "qa" | "demais" | "todos";
export type ChaveOrdem = "nome" | "abertos" | "parados" | "entradas" | "saidas" | "ciclo";

export const semAcento = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function abertos(p: ProjetoFluxo): number {
  return Object.values(p.abertos_por_papel).reduce((a, b) => a + b, 0);
}

export function mesAtual(p: ProjetoFluxo, agora: Date): MesFluxo | undefined {
  const mes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
  return p.mensal.find((m) => m.ano_mes === mes);
}

/** Nenhum card aberto e nenhuma entrada ou saída nos 12 meses: some por padrão. */
export function semMovimento(p: ProjetoFluxo): boolean {
  return abertos(p) === 0 && p.mensal.every((m) => !m.entradas && !m.saidas);
}

export function filtrarProjetos(f: ProjetosFluxo, frente: FrenteFluxo, busca: string, comSemMovimento: boolean): ProjetoFluxo[] {
  const termo = semAcento(busca.trim());
  return f.projetos.filter((p) =>
    (frente === "todos" || (frente === "qa" ? p.grupo === "qa" : p.grupo !== "qa")) &&
    (comSemMovimento || !semMovimento(p)) &&
    (!termo || semAcento(p.nome).includes(termo)));
}

function valor(p: ProjetoFluxo, chave: ChaveOrdem, agora: Date): number | string | null {
  switch (chave) {
    case "nome": return p.nome;
    case "abertos": return abertos(p);
    case "parados": return p.parados_total;
    case "entradas": return mesAtual(p, agora)?.entradas ?? 0;
    case "saidas": return mesAtual(p, agora)?.saidas ?? null;
    case "ciclo": return p.ciclo_90d.mediana;
  }
}

/** Nulos ("não medido", "poucos dados") vão sempre para o fim, nos dois sentidos. */
export function ordenarProjetos(lista: ProjetoFluxo[], chave: ChaveOrdem, desc: boolean, agora = new Date()): ProjetoFluxo[] {
  return [...lista].sort((a, b) => {
    const va = valor(a, chave, agora);
    const vb = valor(b, chave, agora);
    if (va === null || vb === null) return va === vb ? a.nome.localeCompare(b.nome) : va === null ? 1 : -1;
    const c = typeof va === "string" ? va.localeCompare(vb as string) : (va as number) - (vb as number);
    return (desc ? -c : c) || a.nome.localeCompare(b.nome);
  });
}
