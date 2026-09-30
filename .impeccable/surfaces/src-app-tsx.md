---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/telas/Agora.tsx","src/telas/Equipe.tsx","src/telas/Pessoa.tsx","src/telas/Mensal.tsx","src/telas/Card.tsx"]
---

# Painel de QA v2: superfície principal (Agora, Equipe, Pessoa, Mensal, Card)

Modo: **Operate**. Cenas: aba aberta no monitor da mesa o dia todo; reunião com a gestão. Modo TV secundário.
Público: equipe de QA e gestão. Tarefa nº 1: ver em segundos o que está parado em QA, o que voltou e quem está sobrecarregado. Dados reais; nada inventado. Régua de acabamento: Linear/GitHub. Não pode ser cansativo, genérico de SaaS nem enfeitado.

## Direction contract

THESIS: A tela é o quadro de faixas de quem controla o fluxo de QA: cada card é uma faixa de campos fixos que passa de baia em baia. Recusa o dashboard de cartões de KPI com gráficos soltos e o retrô que acabamos de descartar.

OWN-WORLD: Trilho em cinza-azulado frio, baias rebaixadas, faixas claras de altura fixa. Cinzas só de uma escala de 11 degraus. Filetes de 1px e no máximo três valores de tinta por faixa. A cor mora só no porta-faixa (borda esquerda de 4px, reta) e sempre com o rótulo escrito: azul entrou, verde aprovado, vermelho reprovado, violeta sem QA, ocre devolvido. Face de interface neutra; números e campos em mono tabular. Cantos retos na faixa, 2px no máximo nos controles.

STORY: Quem olha lê o quadro como um controlador: a cabeça do quadro diz o placar do dia, as baias dizem onde está cada card e com quem, e cada faixa diz de onde veio, para onde foi e quem moveu. Confia porque o que não foi medido aparece como não medido.

FIRST VIEWPORT: Barra fina com marca, abas (1–4), filtros e selo de coleta. Cabeça do quadro: 5 contadores em faixa única. Três baias em altura cheia, cada uma rolando por dentro: Carga (pessoa + barra por coluna), Fila de QA (faixas com #, título, designado, dias, retornos), Movimentações (faixas por hora com porta-faixa do evento). Sem rolar a página em 1280×720+.

FORM: Quadro de Faixas (faixas de progresso de voo), candidato 4 da lista, sorteado. Seed key 5a4ed70a. Raises: teclado (teletexto), escala de 11 cinzas (registro de exposição), filetes 1px e 3 tintas (edição de referência), estado nunca só por cor (ciclorama), filtro ativo afunda no trilho (CD-ROM).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Anti-objetivos
- Pessoas não viram ranking: tabelas abrem em ordem alfabética, sem pódio, sem cor de julgamento sobre pessoa.
- "Dias em QA" sem cor de alerta. Nada pisca; sem som.
- Faixa não vira fantasia de aeroporto: sem avião, sem textura de papel, sem canto arredondado.

## Decisões em aberto
- Nenhuma de produto.
