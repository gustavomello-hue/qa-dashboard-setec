---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/telas/Hoje.tsx","src/telas/Mensal.tsx","src/telas/Card.tsx"]
---

# Painel de QA — superfície principal (Hoje, Mensal, Card)

Modo: **Operate**. Cenas: aba na mesa, TV da sala (modo atração), reunião.
Público: analistas de QA, devs, chefia. Tarefa nº 1: saber em segundos o que está parado em QA e o que voltou para correção. Dados reais do dashboard.json; nada inventado.

## Direction contract

THESIS: O painel é uma tela de fliperama feita de dados: placar fixo, telas inteiras como fases e um modo atração que roda sozinho na TV. Recusa o admin padrão (barra lateral, cartões brancos de KPI, azul de SaaS) e a gamificação de pessoas.

OWN-WORLD: Preto-fósforo com paleta de 16 cores sob lei: ciano = em QA, verde = aprovado, vermelho = reprovado, dourado = novo desde a última coleta, cinza-aço = lacuna/sem sinal; violeta/azul-arcade só em moldura e navegação. Caixa-alta 8×8 para HUD, rótulos e números; face pixelada legível em caixa normal para títulos. Molduras de linha dupla pixelada, cantos em degrau, grade de tiles; linhas de varredura e brilho de fósforo como camadas desligáveis.

STORY: Quem olha entende de relance quantos cards estão em QA e o que mudou desde o último dia útil, acha o card mais parado no topo da fila, e confia no número porque o que não foi medido aparece riscado como estática.

FIRST VIEWPORT: Faixa de HUD no topo com cinco placares (EM QA, ENTRARAM, APROV, REPROV, TAXA MÊS) em numerais grandes, valor do último dia útil abaixo em pequeno, selo de coleta à direita. Abaixo, à esquerda (~2/3), a FILA DE QA paginada em tela cheia; à direita, a distribuição por papel em barras de blocos e o seletor de prefixo (1P DEV…). Seleção de tela (HOJE/MENSAL/CARD) como menu de fase no rodapé do HUD. Assinatura: modo atração com ?tv percorre telas e páginas sozinho.

FORM: Fliperama CRT (medium-native-crt-arcade-pixel-glow), desafiante adotado pelo usuário no re-roll 1; seed key fc58feb4.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Anti-objetivos
- Pessoas nunca viram jogadores: sem ranking de devs, vidas, GAME OVER, HI-SCORE de pessoa.
- Sem cor por faixa de dias na fila (decisão do usuário). Sem som, sem piscar contínuo.

## Decisões em aberto
- Nenhuma de produto. Escolha exata das faces pixeladas fica para o build.
