---
name: QA·SETEC
description: Painel de métricas de QA do Kanboard da SETEC como tela de fliperama CRT feita de dados.
colors:
  fosforo: "#07070f"
  fundo-2: "#0c0e24"
  fundo-3: "#14173a"
  azul-arcade: "#3149ff"
  violeta: "#7446ff"
  lilas: "#b8a9ff"
  texto: "#f2f1ff"
  texto-2: "#b3b6df"
  texto-3: "#8a8db8"
  ciano: "#3fe3ff"
  verde: "#45e07a"
  vermelho: "#ff5361"
  dourado: "#ffcc38"
  aco: "#737696"
  aco-escuro: "#3a3c55"
typography:
  label:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.04em"
    fontFeature: "tnum"
  nav:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 400
    letterSpacing: "0.04em"
    fontFeature: "tnum"
  title:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "0.04em"
  numeral-sm:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 400
    letterSpacing: "0"
    fontFeature: "tnum"
  body:
    fontFamily: "Jersey 15, ui-sans-serif, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.3
  body-md:
    fontFamily: "Jersey 15, ui-sans-serif, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.15
  label-tv:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "20px"
    fontWeight: 400
    letterSpacing: "0.04em"
    fontFeature: "tnum"
  body-lg:
    fontFamily: "Jersey 15, ui-sans-serif, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.1
  numeral:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "24px"
    fontWeight: 700
    letterSpacing: "0"
    fontFeature: "tnum"
  title-tv:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "24px"
    fontWeight: 700
    letterSpacing: "0.04em"
  field:
    fontFamily: "Jersey 15, ui-sans-serif, sans-serif"
    fontSize: "24px"
    fontWeight: 400
  headline:
    fontFamily: "Jersey 15, ui-sans-serif, sans-serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.05
  numeral-tv:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "40px"
    fontWeight: 700
    letterSpacing: "0"
    fontFeature: "tnum"
  display-24:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0"
    fontFeature: "tnum"
  display-32:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0"
    fontFeature: "tnum"
  display-40:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0"
    fontFeature: "tnum"
  display-48:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0"
    fontFeature: "tnum"
  display-56:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0"
    fontFeature: "tnum"
  display-64:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0"
    fontFeature: "tnum"
  display-80:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "80px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0"
    fontFeature: "tnum"
  display-96:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "96px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0"
    fontFeature: "tnum"
  display-112:
    fontFamily: "Silkscreen, ui-monospace, monospace"
    fontSize: "112px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0"
    fontFeature: "tnum"
rounded:
  none: "0px"
spacing:
  pixel: "4px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  fase:
    textColor: "{colors.texto-2}"
    typography: "{typography.nav}"
    rounded: "{rounded.none}"
    padding: "8px 14px 8px 10px"
  fase-ativa:
    backgroundColor: "{colors.azul-arcade}"
    textColor: "{colors.texto}"
    rounded: "{rounded.none}"
    padding: "8px 14px 8px 10px"
  seletor-prefixo:
    backgroundColor: "{colors.fundo-2}"
    textColor: "{colors.texto-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
  seletor-prefixo-ativo:
    backgroundColor: "{colors.azul-arcade}"
    textColor: "{colors.texto}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
  controle:
    textColor: "{colors.texto-3}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
  botao:
    backgroundColor: "{colors.azul-arcade}"
    textColor: "{colors.texto}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  botao-hover:
    backgroundColor: "{colors.violeta}"
  botao-icone:
    backgroundColor: "{colors.fundo-2}"
    textColor: "{colors.texto}"
    rounded: "{rounded.none}"
    size: "30px"
  campo-busca:
    backgroundColor: "{colors.fosforo}"
    textColor: "{colors.texto}"
    typography: "{typography.field}"
    rounded: "{rounded.none}"
    padding: "8px 10px"
  painel:
    backgroundColor: "{colors.fundo-2}"
    rounded: "{rounded.none}"
    padding: "16px 22px 18px"
  selo-medicao:
    textColor: "{colors.texto-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "3px 8px"
---

# Design System: QA·SETEC

## Overview

**Creative North Star: "O Gabinete de Fliperama dos Dados"**

O painel é uma tela de fliperama CRT: preto-fósforo, um placar fixo no topo, telas inteiras tratadas como fases e um modo atração que roda sozinho na TV da sala. Tudo é desenhado no grão do pixel: fontes bitmap, molduras de linha dupla com cantos em degrau, barras feitas de blocos, ícones desenhados em grade 7×7. Nenhuma curva, nenhum gradiente decorativo, nenhum raio de canto.

A densidade é de HUD: muitos números, pouco texto, e cada cor carrega exatamente um significado. A atmosfera CRT (linhas de varredura, brilho de fósforo, grade de tiles 8×8) é uma camada que se liga e desliga e fica gravada por navegador; o painel continua inteiro e legível sem ela. O que não foi medido nunca some: aparece riscado como estática.

O mundo recusa o admin padrão (barra lateral, cartões brancos de KPI, azul de SaaS) e recusa transformar pessoas em jogadores. O vocabulário de fliperama vale para telas, filtros e dados, nunca para quem trabalha.

**Key Characteristics:**
- Paleta de 15 cores em uso, sob lei: cor de estado = um significado só.
- Duas faces pixeladas escolhidas por teste de leitura em 1:1: Silkscreen para rótulos e números, Jersey 15 para texto corrido, numa escala de degraus inteiros (12, 16, 18, 20, 22, 24, 32, 40, 48, 56, 64, 80, 96, 112px).
- Numerais de placar com zeros à esquerda (059, 002) e tamanho por container query.
- Molduras 9-slice de linha dupla (azul-arcade fora, violeta dentro), cantos em degrau, zero raio.
- Movimento em degraus (`steps()`), nunca contínuo; conteúdo nunca começa escondido.
- Camada CRT desligável e persistente.

## Colors

Preto-fósforo azulado com cores de estado saturadas de fliperama, cada uma presa a um único significado.

### Primary
- **Azul Arcade** (azul-arcade): moldura externa dos painéis, linhas do placar, fundo de seleção ativa (fase, prefixo, botão), borda do campo de busca, eixo do gráfico, barra de rolagem. Só moldura e navegação.
- **Violeta de Moldura** (violeta): linha interna da moldura, anel do estado ativo, hover de controles, ponto da marca, barra de tempo do modo atração, faixa da varredura de troca de tela. Só moldura e navegação.
- **Lilás de Metadado** (lilas): etiquetas e projeto sob o título do card na fila, link externo do card. Tom de apoio da família violeta, nunca estado.

### Secondary (cores de estado)
- **Ciano de QA** (ciano): em QA e entradas em QA. Placar EM QA e ENTRARAM, contagem da fila, número do card (#10588), barra TESTE/QA, série "Entraram", cursor de texto.
- **Verde Aprovado** (verde): aprovado, QA para Concluídas. Placar, tabela mensal, série do gráfico, linha do tempo do card.
- **Vermelho Reprovado** (vermelho): reprovado, QA para Correções, e retornos para correção. Placar, barra CORREÇÕES, série do gráfico, retornos no celular.
- **Dourado Novo** (dourado): somente "novo desde a última coleta". Ícone ao lado do número do card e o sub-rótulo "NN NOVOS" do placar.

### Neutral
- **Preto-Fósforo** (fosforo): fundo da página, campo de busca, rodapé do modo atração, anel interno do estado ativo.
- **Fundo de Painel** (fundo-2): preenchimento das molduras (88% de opacidade), botões de prefixo e de ícone, tooltip do gráfico. O corpo usa um gradiente radial de fundo-2 para fosforo a partir do topo.
- **Fundo de Linha** (fundo-3): divisórias de tabela (2px), bordas de controles em repouso, hover de linha, separadores pontilhados.
- **Texto** (texto): números neutros, títulos, texto principal.
- **Texto 2** (texto-2): nomes, detalhes, controles inativos, rótulos de eixo.
- **Texto 3** (texto-3): cabeçalhos de tabela, sub-rótulos do placar, notas, placeholder.
- **Aço** (aco): borda do que não foi medido (lacuna, medição parcial), marca de "movimentação perdida" na linha do tempo.
- **Aço Escuro** (aco-escuro): o risco da estática (hachura 135°, 4px cheio / 4px vazio) e ícone desabilitado.

### Named Rules
**The Color Is Law Rule.** Ciano = em QA/entradas, verde = aprovado, vermelho = reprovado e retornos, dourado = novo desde a última coleta, aço/estática = não medido, lacuna, sem sinal. Nenhuma dessas cores aparece como enfeite. Azul-arcade e violeta são só moldura e navegação.

**The Uncolored Queue Rule.** A coluna "dias em QA" da fila é sempre na cor de texto. Nunca colorir por faixa de dias (decisão do usuário).

**The Static Rule.** O que não foi medido fica riscado como estática (hachura 135° em aco-escuro, borda em aço). Nunca esconder uma lacuna nem pintá-la com uma cor de estado.

**The One Legend Rule.** A lei das cores é explicada no próprio painel (painel LEGENDA na coluna direita da mesa; legenda em linha no gráfico mensal). Uma cor nova de estado exige entrada na legenda.

## Typography

**Display Font:** Silkscreen (com ui-monospace, monospace)
**Body Font:** Jersey 15 (com ui-sans-serif, sans-serif)
**Label/Mono Font:** Silkscreen

**Character:** Silkscreen é a voz do HUD, caixa-alta bitmap de 8×8 para rótulos e números tabulares; Jersey 15 é a voz legível, pixelada mas proporcional, com minúsculas e acentos para títulos de card, nomes e detalhes. As duas foram escolhidas por teste de leitura em 1:1: a letra que denuncia é o C, que nas faces de abertura de 1 pixel fecha em O. Pixelify Sans foi testada e removida. Suavização de fonte desligada (`-webkit-font-smoothing: none`).

### Hierarchy
Cada tamanho é um degrau literal da escala; não há tamanhos fora dela.

- **Label** (Silkscreen 400, 12px, 0.04em, caixa-alta): todo rótulo de mesa. Rótulos do placar, sub-rótulos, cabeçalhos de tabela, metadados da fila, prefixos e o número 1P…4P, controles, botão primário, selo de coleta, paginação, notas, legenda, selo de medição, rodapé da TV na mesa, e os eixos do gráfico.
- **Nav** (Silkscreen 400, 16px, 0.04em): menu de fases, rótulo da busca, selo SEM SINAL; na TV, sub-rótulos do placar, legendas de linha e metadados sobem para este degrau.
- **Title** (Silkscreen 700, 16px, 0.04em): títulos de painel (FILA DE QA, ONDE ESTÁ AGORA, SINAL · 7 DIAS, LEGENDA).
- **Numeral pequeno** (Silkscreen 400, 16px, tabular): número do card na fila, valores da distribuição, células da tabela mensal.
- **Body** (Jersey 15 400, 18px, 1.3): texto corrido, nomes, detalhes de lacuna, select de projeto, tooltip do gráfico.
- **Body médio** (Jersey 15 400, 20px, 1.15): valores da ficha do card e transição "de → para" da linha do tempo.
- **Label TV** (Silkscreen 400, 20px): rótulos do placar, selo, paginação e rodapé do modo atração na cena TV.
- **Body grande** (Jersey 15 400, 22px, 1.1, até 2 linhas na mesa e 3 no celular): título do card na fila; na TV, nome do designado e detalhe da lacuna.
- **Numeral** (Silkscreen 700, 24px, tabular): "dias em QA" na fila e números da ficha; na TV, número do card e valores da distribuição (400). A marca QA·SETEC usa Silkscreen 700 a 24px.
- **Title TV** (Silkscreen 700, 24px): títulos de painel na cena TV.
- **Campo** (Jersey 15 400, 24px): número digitado na busca de card.
- **Headline** (Jersey 15 400, 32px, 1.05, até 60ch, `text-wrap: balance`): título do card na tela CARD; na TV, título do card na fila. O texto da tela inicial (SEM SINAL, CARREGANDO…) usa Silkscreen a 32px.
- **Numeral TV** (Silkscreen 700, 40px): "dias em QA" na cena TV.
- **Display** (Silkscreen 700, 0.95, degraus 24 · 32 · 40 · 48 · 56 · 64 · 80 · 96 · 112px): numerais do placar, escolhidos por container query. Contadores: 32, 40, 48, 64, 80, 96, 112px. Taxa (mais caracteres): 24, 32, 40, 48, 56, 64px.

### Named Rules
**The Two Voices Rule.** Silkscreen só para rótulos e números; Jersey 15 para todo texto corrido. Nunca inverter: Silkscreen em frase longa vira ruído, Jersey em rótulo de HUD perde o fliperama.

**The Legibility Floor Rule.** Rótulo em Silkscreen nunca abaixo de 12px e nunca em negrito abaixo de 16px. Texto corrido em Jersey 15 nunca abaixo de 18px na mesa.

**The Literal Step Rule.** Todo tamanho de fonte é um degrau literal da escala (12, 16, 18, 20, 22, 24, 32, 40, 48, 56, 64, 80, 96, 112px). Nada de `clamp()`, `em` ou valores intermediários como 13px ou 14px: o pixel da fonte precisa cair em múltiplo inteiro.

**The Bitmap Percent Rule.** O "%" nunca é o glifo da fonte (na Silkscreen lê como Z, na Jersey pequena como ×): é o ícone bitmap "porcento", a 0.62em do número.

**The Scoreboard Padding Rule.** Contadores do placar e das tabelas saem com zeros à esquerda (059, 002, 013), como placar de fliperama.

## Layout

Largura máxima de 1680px centrada, com respiro fluido (`clamp(12px, 2vw, 28px)` no topo, `clamp(12px, 2.4vw, 36px)` nas laterais, 64px embaixo). O cabeçalho empilha três faixas: marca e selo de coleta; o placar de cinco colunas entre duas linhas azul-arcade de 2px, com divisórias pontilhadas em fundo-3; e a linha de navegação.

A linha de navegação carrega o menu de fases (HOJE / MENSAL / CARD), o seletor de prefixo (TODOS, 1P DEV, 2P WEB, 3P MOB, 4P DEMANDAS) com o select de projeto, e os controles CRT e MODO TV à direita. O seletor de prefixo mora nessa linha porque recorta o HUD e todas as telas (Hoje e Mensal), não só uma coluna; some na tela CARD.

Tela HOJE: grade de duas colunas (2,1fr para a FILA DE QA paginada, 10 linhas por página; coluna direita de no mínimo 300px com ONDE ESTÁ AGORA, SINAL · 7 DIAS e, fechando a coluna, LEGENDA). MENSAL e CARD são uma coluna só. Espaço entre painéis: 20px. Ritmo interno em múltiplos pequenos (4, 6, 8, 10, 12, 16px); o pixel da grade é 4px.

**Responsivo.** Abaixo de 1100px a tela HOJE vira uma coluna. Abaixo de 760px o placar vira 2 colunas com a taxa ocupando a linha inteira, as colunas DESIGNADO e RETORNOS saem da fila (os retornos passam a aparecer em vermelho sob o título), o título do card vai até 3 linhas, a linha do tempo perde a coluna de data, e tabelas largas rolam dentro do painel, nunca a página.

**Cena TV (`?tv`).** Modo atração: troca de quadro a cada 12s (Hoje em todas as páginas, Mensal, depois Hoje de cada prefixo com cards). Controles de mesa somem, exceto SAIR DA TV; seletor de prefixo some; LEGENDA some. Rótulos sobem para 16px ou 20px, títulos de painel para 24px, títulos de card para 32px, "dias em QA" para 40px, o rodapé do modo atração para 20px; a fila mostra 6 linhas por página; a coluna principal cresce para 2,5fr. Um rodapé fixo mostra MODO ATRAÇÃO, o quadro atual e uma barra de tempo em blocos violeta que enche em 24 degraus.

### Named Rules
**The Scoreboard Step Rule.** Numerais do placar crescem por container query em degraus fixos, com limiares em 128, 154, 205, 256, 308 e 358px de largura do item: contadores 32 → 40 → 48 → 64 → 80 → 96 → 112px, taxa 24 → 24 → 32 → 40 → 48 → 56 → 64px. Nunca `clamp()` contínuo.

## Elevation & Depth

Plano. Não há sombra de elevação: a profundidade vem da moldura dupla, do preenchimento fundo-2 sobre o gradiente fosforo e da luz. Quando a camada CRT está ligada, o fósforo brilha: números e marca ganham um halo da própria cor, os estados ativos ganham um halo violeta, a página ganha linhas de varredura e os painéis uma grade de tiles 8×8: um único pixel azul-arcade (opacidade de preenchimento 0,22) no canto de cada tile, desenhado como padrão SVG com `crispEdges`.

### Shadow Vocabulary
- **Brilho de fósforo** (`text-shadow: 0 0 6px color-mix(in srgb, currentColor 55%, transparent), 0 0 18px color-mix(in srgb, currentColor 22%, transparent)`): numerais do placar, marca e texto da tela inicial; só com CRT ligado.
- **Anel de seleção** (`box-shadow: 0 0 0 2px var(--fosforo), 0 0 0 4px var(--violeta)`): fase atual, prefixo marcado, botão primário. Com CRT, soma `0 0 16px rgb(116 70 255 / 0.55)`.
- **Linhas de varredura** (gradiente repetido de 4px, faixa preta a 22%, camada fixa sobre tudo, sem capturar o ponteiro): só com CRT ligado.
- **Grade de tiles** (padrão SVG de 8×8px com um retângulo de 1×1px em azul-arcade, `fill-opacity` 0,22, repetido no fundo das molduras): só com CRT ligado. É um ponto por tile, nunca linhas cruzadas.

### Named Rules
**The Switchable Atmosphere Rule.** Varredura, brilho e grade de tiles são uma camada desligável (controle CRT ON/OFF, gravado no navegador). Nenhuma informação pode depender dela.

## Shapes

Zero raio em tudo. As bordas são de 2px sólidas ou pontilhadas; a moldura de painel é um 9-slice de 8px desenhado em SVG com `crispEdges`: linha externa azul-arcade, um pixel de folga, linha interna violeta, cantos em degrau (a variante fina usa 4px). Barras de dados são feitas de blocos (8px cheio, 3px vazio), a barra de tempo da TV também (10px e 3px). Ícones são bitmaps 7×7 desenhados como retângulos inteiros (cursor, anterior, próximo, seta, tv, novo, porcento), no mesmo traço da tipografia. Marcadores de linha do tempo e amostras de legenda são quadrados e retângulos cheios.

## Components

### Buttons
Blocos de fliperama: retos, borda de 2px, seleção por preenchimento azul-arcade com anel duplo.
- **Shape:** sem raio (0px), borda de 2px.
- **Primário (botao):** fundo azul-arcade, texto claro, 10px 16px, Silkscreen 12px, com anel de seleção. Hover troca o fundo e a borda para violeta.
- **Controle (CRT, MODO TV):** transparente, borda fundo-3, texto-3, 12px. Hover ou pressionado: texto claro e borda azul-arcade.
- **Botão de ícone (paginação):** 30×30px, fundo-2, borda fundo-3; hover borda violeta; desabilitado com ícone em aço-escuro.
- **Foco:** contorno tracejado de 2px em texto, afastado 3px, em todo elemento focável.

### Chips (seletor de prefixo)
- **Style:** fundo-2, borda fundo-3 de 2px, texto-2, Silkscreen 12px; o número do jogador (1P…4P), também a 12px, vem antes em texto-3.
- **State:** hover com borda violeta; marcado (radio) com fundo azul-arcade e anel de seleção; desabilitado no modo TV.

### Cards / Containers (painel)
- **Corner Style:** degrau pixelado da moldura 9-slice, sem raio.
- **Background:** fundo-2 a 88%, recortado na área interna; com CRT, o ponto azul-arcade no canto de cada tile 8×8.
- **Shadow Strategy:** nenhuma (ver Elevation & Depth).
- **Border:** moldura dupla azul-arcade / violeta de 8px.
- **Internal Padding:** 16px no topo, `clamp(12px, 1.6vw, 22px)` nas laterais, 18px embaixo. Cabeça com título à esquerda e controles (paginação, legenda) à direita.

### Inputs / Fields
- **Busca de card:** fundo fosforo, borda azul-arcade de 2px, Jersey 24px, largura de 10ch, cursor ciano; rótulo em Silkscreen ciano.
- **Select de projeto:** fundo-2, borda fundo-3, Jersey 18px, 280px; hover com borda violeta.

### Navigation (menu de fases)
- Silkscreen 16px em texto-2, sem borda em repouso; hover em texto claro. A fase atual ganha fundo azul-arcade, anel de seleção e o cursor bitmap ▶ à esquerda (o cursor ocupa lugar sempre, só fica visível na fase atual).

### Placar (HUD)
Cinco itens (EM QA, ENTRARAM, APROVADOS, REPROVADOS, APROVAÇÃO MÊS): rótulo em Silkscreen 12px na cor de estado, numeral grande na mesma cor com brilho, sub-rótulo de 12px em texto-3 com o valor do último dia útil ("SEG 28: 013"). A taxa é neutra (texto) e leva o "%" bitmap. Na primeira aparição, o número conta de 0 até o valor em 8 degraus de 45ms (sem contagem com movimento reduzido).

### Fila de QA
Tabela paginada: número do card em Silkscreen ciano (abre a linha do tempo), ícone dourado de novo, título em Jersey 22px (link para o Kanboard) com metadados em lilás, designado em Jersey 18px, dias em QA em Silkscreen 24px negrito na cor de texto, retornos. Linhas separadas por 2px fundo-3, hover fundo-3.

### Gráfico mensal
Barras de blocos (pictorialBar) nas três cores de estado, eixo azul-arcade de 2px, linhas de grade fundo-3, rótulos de eixo em Silkscreen 12px, tooltip em fundo-2 com borda azul-arcade e Jersey 15 18px. Sem animação: as barras aparecem inteiras, nunca crescem suavemente.

### Distribuição em blocos
Uma linha por papel: nome em Silkscreen 12px, barra de blocos (1 bloco = 8 cards) em `currentColor`, valor à direita. Só TESTE/QA (ciano) e CORREÇÕES (vermelho) têm cor; o resto é neutro.

### Estática (lacuna e medição parcial)
Hachura 135° aco-escuro com borda em aço. Faixa de 36×28px no painel SINAL; selo de MEDIÇÃO parcial na tabela mensal; selo SEM SINAL no topo quando a coleta atrasa (Silkscreen 400 a 16px, sem negrito).

### Troca de tela
Uma faixa de 48px de linhas violeta desce sobre a tela nova em 420ms, em 10 degraus, e some. O conteúdo nunca começa escondido: se a animação não rodar, a tela já está inteira.

## Do's and Don'ts

### Do:
- **Do** usar cada cor de estado só para o seu significado (ciano em QA/entradas, verde aprovado, vermelho reprovado/retornos, dourado novo desde a última coleta, aço/estática não medido).
- **Do** manter azul-arcade e violeta restritos a moldura, navegação e seleção.
- **Do** riscar como estática (hachura 135° aco-escuro, borda aço) tudo que não foi medido.
- **Do** usar Silkscreen 400 a partir de 12px para rótulos e números, e Jersey 15 a partir de 18px para texto corrido.
- **Do** escolher todo tamanho de fonte entre os degraus literais da escala (12, 16, 18, 20, 22, 24, 32, 40, 48, 56, 64, 80, 96, 112px).
- **Do** desenhar o "%" com o ícone bitmap "porcento" e novos ícones como bitmaps 7×7 com `crispEdges`.
- **Do** fazer numerais de placar crescerem por container query em degraus fixos.
- **Do** animar em degraus (`steps()`) e deixar o conteúdo visível desde o primeiro quadro.
- **Do** manter a camada CRT desligável e o painel inteiro legível com ela desligada.
- **Do** manter a lei das cores explicada na tela (painel LEGENDA na mesa).

### Don't:
- **Don't** colorir "dias em QA" por faixa de dias.
- **Don't** transformar pessoas em jogadores: sem ranking de devs, vidas, GAME OVER ou HI-SCORE de pessoa. O "1P…4P" nomeia prefixos, nunca pessoas.
- **Don't** usar dourado, verde, vermelho ou ciano como enfeite, fundo de seção ou destaque genérico.
- **Don't** pôr Silkscreen em negrito abaixo de 16px nem abaixo de 12px em qualquer peso.
- **Don't** usar o glifo "%" das fontes nem ícones de glifo unicode ou de biblioteca vetorial.
- **Don't** arredondar cantos, usar sombra de elevação ou gradiente decorativo.
- **Don't** começar uma tela escondida à espera de animação, nem usar piscar contínuo, crescimento suave ou som.
- **Don't** voltar ao admin padrão: barra lateral, cartões brancos de KPI, azul de SaaS.
