// Ícones de traço, 24x24, cor = currentColor. Só os que o painel usa.

const CAMINHOS = {
  externo: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  busca: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  seta: "M5 12h14M13 6l6 6-6 6",
  voltar: "M19 12H5M11 6l-6 6 6 6",
  tv: "M3 6h18v11H3zM8 21h8M12 17v4",
  cima: "M12 19V5M6 11l6-6 6 6",
  baixo: "M12 5v14M6 13l6 6 6-6",
} as const;

export type NomeIcone = keyof typeof CAMINHOS;

export function Icone({ nome, tamanho = 16, titulo }: { nome: NomeIcone; tamanho?: number; titulo?: string }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={titulo ? "img" : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
      className="icone"
    >
      <path d={CAMINHOS[nome]} />
    </svg>
  );
}
