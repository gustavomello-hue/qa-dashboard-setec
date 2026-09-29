// Ícones desenhados pixel a pixel. Cada ícone é um bitmap 7×7 ("#" aceso),
// renderizado como retângulos inteiros com shape-rendering crispEdges: o
// mesmo traço da tipografia 8×8, sem depender de glifos unicode.

const BITMAPS = {
  cursor: [
    "#......",
    "###....",
    "#####..",
    "#######",
    "#####..",
    "###....",
    "#......",
  ],
  anterior: [
    "....#..",
    "...##..",
    "..###..",
    ".####..",
    "..###..",
    "...##..",
    "....#..",
  ],
  proximo: [
    "..#....",
    "..##...",
    "..###..",
    "..####.",
    "..###..",
    "..##...",
    "..#....",
  ],
  seta: [
    ".......",
    "....#..",
    ".....#.",
    "#######",
    ".....#.",
    "....#..",
    ".......",
  ],
  externo: [
    "...####",
    ".....##",
    "....#.#",
    "#..#..#",
    "#.#....",
    "#......",
    "#####..",
  ],
  novo: [
    ".......",
    ".#####.",
    ".#####.",
    ".#####.",
    ".#####.",
    ".#####.",
    ".......",
  ],
  tv: [
    "#######",
    "#.....#",
    "#.....#",
    "#.....#",
    "#######",
    "..#.#..",
    ".#####.",
  ],
  porcento: [
    "##...#.",
    "##..#..",
    "...#...",
    "..#....",
    ".#..##.",
    "#...##.",
    ".......",
  ],
  busca: [
    ".###...",
    "#...#..",
    "#...#..",
    "#...#..",
    ".####..",
    ".....#.",
    "......#",
  ],
} as const;

export type NomeIcone = keyof typeof BITMAPS;

export function Icone({ nome, tamanho = 14, titulo }: { nome: NomeIcone; tamanho?: number | string; titulo?: string }) {
  const linhas = BITMAPS[nome];
  const rects: string[] = [];
  linhas.forEach((linha, y) => {
    for (let x = 0; x < linha.length; x++) {
      if (linha[x] === "#") rects.push(`M${x} ${y}h1v1h-1z`);
    }
  });
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      aria-hidden={titulo ? undefined : true}
      role={titulo ? "img" : undefined}
      style={{ flex: "none", display: "inline-block", verticalAlign: "-0.1em" }}
    >
      {titulo && <title>{titulo}</title>}
      <path d={rects.join("")} fill="currentColor" />
    </svg>
  );
}
