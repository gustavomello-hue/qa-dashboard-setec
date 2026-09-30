---
name: QA·SETEC
description: Painel de métricas de QA do Kanboard da SETEC como quadro de faixas de controle de fluxo.
colors:
  n0: "#ffffff"
  n1: "#f7f8fa"
  n2: "#eef0f3"
  n3: "#e3e6ea"
  n4: "#d3d8de"
  n5: "#b6bdc6"
  n6: "#8f98a3"
  n7: "#69727e"
  n8: "#4b535e"
  n9: "#313740"
  n10: "#1b1f25"
  entrada: "#2f5fc4"
  aprovado: "#1f7f55"
  reprovado: "#bf3a33"
  sem-qa: "#7550ad"
  devolvido: "#9c6c10"
  correcao-carga: "color-mix(in srgb, #bf3a33 78%, #ffffff)"
typography:
  numeral:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Public Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Public Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: "Public Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  body-sm:
    fontFamily: "Public Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Public Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.07em"
  label-sm:
    fontFamily: "Public Sans, system-ui, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.07em"
  dado:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "\"tnum\""
rounded:
  faixa: "0px"
  controle: "2px"
spacing:
  fio: "1px"
  xs: "2px"
  sm: "6px"
  md: "10px"
  porta-folga: "14px"
  lg: "12px"
  xl: "16px"
components:
  botao:
    backgroundColor: "{colors.n0}"
    textColor: "{colors.n10}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.controle}"
    padding: "0 12px"
    height: "28px"
  botao-hover:
    backgroundColor: "{colors.n1}"
  botao-pressionado:
    backgroundColor: "{colors.n2}"
    textColor: "{colors.n10}"
  aba:
    textColor: "{colors.n8}"
    typography: "{typography.body}"
    rounded: "{rounded.controle}"
    padding: "0 10px 0 7px"
    height: "30px"
  aba-atual:
    backgroundColor: "{colors.n2}"
    textColor: "{colors.n10}"
  segmentado-opcao:
    backgroundColor: "{colors.n0}"
    textColor: "{colors.n8}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.controle}"
    padding: "3px 10px"
  segmentado-opcao-ativa:
    textColor: "{colors.n10}"
  campo:
    backgroundColor: "{colors.n0}"
    textColor: "{colors.n10}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.controle}"
    padding: "0 8px"
    height: "28px"
  chip:
    backgroundColor: "{colors.n0}"
    textColor: "{colors.n8}"
    rounded: "{rounded.controle}"
    padding: "1px 8px"
  baia:
    backgroundColor: "{colors.n3}"
    rounded: "{rounded.faixa}"
    padding: "0 6px 6px"
  faixa:
    backgroundColor: "{colors.n0}"
    textColor: "{colors.n10}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.faixa}"
    padding: "6px 10px 7px 14px"
  faixa-hover:
    backgroundColor: "{colors.n1}"
  kpi:
    backgroundColor: "{colors.n0}"
    textColor: "{colors.n10}"
    typography: "{typography.numeral}"
    rounded: "{rounded.faixa}"
    padding: "9px 14px 10px 16px"
  tecla:
    backgroundColor: "{colors.n0}"
    textColor: "{colors.n7}"
    rounded: "{rounded.controle}"
    padding: "0 3px"
---

# Design System: QA·SETEC

## Overview

**Creative North Star: "O Quadro de Faixas"**

O painel é o quadro de quem controla o fluxo de QA, como um controlador de voo lê suas faixas de progresso: um trilho cinza-azulado frio ao fundo, baias rebaixadas que agrupam o trabalho, e dentro delas faixas claras de altura fixa, uma por card, pessoa ou evento. Cada faixa tem campos em posições fixas e passa de baia em baia. A leitura é de cima para baixo: a cabeça do quadro dá o placar do dia, as baias dizem onde está cada card e com quem, e cada faixa diz de onde veio, para onde foi e quem moveu.

A densidade é alta e calma. O quadro é feito de cinzas de uma única escala de 11 degraus, filetes de 1px e três valores de tinta; a cor aparece só onde tem significado de estado (entrou, aprovado, reprovado, sem QA, devolvido) e sempre com o nome escrito ao lado. A profundidade é de encaixe, não de elevação: baias e controles ativos afundam no trilho com sombra interna; nada flutua. Cantos retos em tudo que é faixa, 2px no máximo nos controles.

O mundo substituiu o "Fliperama CRT", que foi descartado por inteiro: nenhum brilho de fósforo, nenhuma textura, nenhum retrô. Também recusa o dashboard genérico de cartões de KPI com gráficos soltos e sombras flutuantes, e recusa a fantasia literal de aeroporto (sem avião, sem textura de papel, sem canto arredondado).

**Key Characteristics:**
- Trilho, baia rebaixada e faixa reta: três planos, sem elevação para fora.
- Cinzas só da escala --n0..--n10; tema claro e escuro trocam a escala, não os papéis.
- Cor de estado só no porta-faixa de 4px e nos marcadores quadrados de 7px, sempre com rótulo escrito.
- Interface em Public Sans; todo número, código de card e horário em JetBrains Mono tabular.
- Filtro ou aba ativa afunda no trilho em vez de ganhar cor.
- Teclado de primeira classe: 1–4 trocam de tela, # ou / vai para a busca de card.

## Colors

Uma escala fria de 11 cinzas faz todo o quadro; cinco matizes de estado, de saturação média, só marcam o que aconteceu com o card.

### Primary
- **Azul Entrada** (entrada): o card entrou ou está em QA. Porta-faixa da Fila de QA e de eventos de entrada, marcador do rótulo "Entrou", segmento Teste/QA da barra de carga, série "Entraram" dos gráficos. Também é a cor do foco de teclado, do cursor de texto e da seleção (24% sobre transparente). No escuro sobe para #6f9cf0.

### Secondary
- **Verde Aprovado** (aprovado): QA → Concluídas. Porta-faixa, marcador e série de aprovados. No escuro #4cb784.
- **Vermelho Reprovado** (reprovado): QA → Correções. Porta-faixa, marcador, série de reprovados. No escuro #ec6d65. Na barra de carga o segmento "Correções" usa a versão lavada **Vermelho Correção** (correcao-carga, 78% do vermelho sobre --n0) para não gritar numa barra comprida.

### Tertiary
- **Violeta Sem QA** (sem-qa): chegou em Concluídas sem passar por QA. No escuro #ae8ae6.
- **Ocre Devolvido** (devolvido): QA → outra coluna que não Concluídas nem Correções. No escuro #d5a444.

### Neutral
A escala --n0..--n10 é a única fonte de cinza. No tema escuro os mesmos degraus são redefinidos (--n0 #0d1013 até --n10 #e6e9ed) e os papéis abaixo passam a apontar para eles:
- **Trilho** (--trilho → n2): fundo da página, barra de filtros, controle ativo afundado.
- **Baia** (--baia → n3; no escuro n1): bloco rebaixado que agrupa faixas e rola por dentro; também o fundo do cabeçalho fixo das tabelas.
- **Faixa** (--faixa → n0; no escuro n3): a faixa, a barra do topo, KPIs, campos e botões. No escuro a baia afunda para o preto e a faixa acende um degrau.
- **Faixa realce** (--faixa-realce → n1; no escuro n4): hover de faixa e de botão, fundo inicial da faixa recém-inserida.
- **Filete** (--filete → n4): toda linha de 1px, porta-faixa neutro, grade e eixo dos gráficos.
- **Tinta 1 / 2 / 3** (n10 / n8 / n7): texto principal; rótulos e texto secundário; meta, horários, zeros e inativos. Nunca mais que três tintas numa faixa.
- **Grupos** (DEV n9, estagiários DEV n6, QA n8, estagiários QA n5, gestão n7, outros n4): séries dos gráficos por grupo, alternando claro e escuro, sempre com legenda escrita.
- **Papéis de carga**: A iniciar n5 (escuro n6), Em andamento n8.

### Named Rules
**A Regra do Porta-Faixa.** A cor de estado mora no porta-faixa (borda esquerda de 4px, reta, feita com sombra interna) e nos marcadores quadrados de 7px dos rótulos e cabeçalhos; barras de carga e séries de gráfico são as únicas outras superfícies coloridas, e sempre com legenda. Texto, fundo de faixa e número não recebem cor de estado.

**A Regra da Cor Escrita.** Nenhuma cor aparece sozinha: todo porta-faixa colorido tem o nome do estado escrito na mesma faixa ou na coluna, todo quadradinho tem rótulo ao lado, toda série tem legenda.

**A Regra dos Onze Cinzas.** Nenhum cinza existe fora de --n0..--n10. Um cinza novo é um degrau errado da escala, não um token novo.

**A Regra do Grupo Neutro.** Grupos de pessoas (DEV, QA, estagiários, gestão) são tons da escala neutra, nunca matizes de estado: grupo não é acontecimento.

## Typography

**Display Font:** nenhuma; o número grande do KPI é o único destaque e sai em mono.
**Body Font:** Public Sans (com system-ui, Segoe UI, sans-serif), pesos 400/500/600/700 via @fontsource.
**Label/Mono Font:** JetBrains Mono (com ui-monospace, Cascadia Mono, Consolas), pesos 400/500, sempre com algarismos tabulares.

**Character:** Uma face de interface neutra, de repartição bem feita, para tudo que é nome, rótulo e frase; uma mono de terminal para tudo que é impresso na faixa: número, #card, horário, período. A troca de face é a troca entre ler e conferir.

### Hierarchy
- **Numeral** (JetBrains Mono 500, 28px, 1.1, -0.02em; 24px abaixo de 700px): o valor do contador na cabeça do quadro.
- **Escala em tokens:** os tamanhos moram em `--t-*` no `base.css` (numeral 28, numeral-estreito 24, destaque 22, título 16, corpo 14, dado 13, meta 12, título-baia 12, rótulo 11). O CSS não usa tamanho literal.
- **Headline** (600, 22px, 1.2, -0.01em): nome da pessoa na tela Pessoa.
- **Title** (600, 16px): título do card na tela Card.
- **Body** (400, 14px, 1.45): base do documento, abas.
- **Body-sm** (400, 13px): conteúdo das faixas, controles, campos, botões, números das tabelas.
- **Label** (600, 12px, 0.06–0.07em, caixa alta): título de baia (em tinta 1, para se separar dos rótulos de estado), rótulo de KPI, rótulo da busca. Cabeçalho de tabela e rótulo de ficha usam o degrau de 11px com 0.05em.
- **Label-sm** (600, 11px, 0.07–0.08em, caixa alta): nome do estado ao lado do marcador, título de grupo na carga, dia no feed. Nada abaixo de 11px.
- **Dado** (JetBrains Mono 400/500, 12–13px, tabular): #card (500, sublinhado em n5), horários, dias em QA, contagens, período, rodapé do modo TV, rótulos de eixo dos gráficos (11px).

### Named Rules
**A Regra da Impressão.** Mono só para dado: números, códigos de card, horários, datas e períodos. Cabeçalhos, rótulos, nomes e frases ficam em Public Sans, inclusive o cabeçalho das colunas numéricas.

## Layout

A página é a casca: barra do topo (faixa, 44px de altura mínima, com marca, abas, selo de coleta), barra de filtros no trilho, e a tela com respiro de 12px no topo e 16px nas laterais (10/12px abaixo de 700px). Entre baias o espaço é 12px; entre faixas, 1px de trilho ou baia (a pilha de faixas é separada por fio, não por margem). Dentro da baia as faixas ficam a 6px das bordas; dentro da faixa o texto começa 14px à esquerda (4px de porta-faixa mais folga) e 10px à direita.

Na tela Agora, a partir de 1100px, o quadro é uma grade de três baias (carga 0.95fr, fila 1.55fr, movimentações 1fr) sob a faixa única de cinco contadores, ocupando exatamente a altura da janela: a página não rola, cada baia rola por dentro. Abaixo disso as baias empilham. A tela Pessoa usa grade auto-fit de colunas de 380px, com baias que crescem até a altura útil e só então rolam. A Mensal é de duas colunas e vira uma abaixo de 800px. A Card limita-se a 1200px.

Abaixo de 700px: some o que é só de tela larga (teclas de atalho, colunas secundárias, botão Modo TV), o selo de coleta desce para linha própria, os contadores ficam em duas colunas (o último ímpar ocupa a linha), e a linha do tempo do card vira uma coluna.

## Elevation & Depth

O sistema não tem elevação para fora. A profundidade é de encaixe: o trilho é o plano de referência, a baia é rebaixada nele com uma sombra interna curta, e o controle ativo afunda no trilho. As faixas são planas, separadas por fio de 1px. O tooltip dos gráficos é a única superfície que se sobrepõe, e é uma faixa com filete, sem sombra.

### Shadow Vocabulary
- **Baia** (`box-shadow: inset 0 1px 2px rgb(27 31 37 / 0.08)`; escuro `inset 0 1px 2px rgb(0 0 0 / 0.4)`): baias, trilho da barra de carga, caixa do controle segmentado.
- **Afundado** (`box-shadow: inset 0 1px 2px rgb(27 31 37 / 0.14)`; escuro `inset 0 1px 3px rgb(0 0 0 / 0.55)`): aba atual, botão e chip pressionados.
- **Porta-faixa** (`box-shadow: inset 4px 0 0 <cor>`): a borda esquerda de estado; neutra em n4 quando não há estado.
- **Relevo do segmentado** (`box-shadow: 0 1px 0 var(--filete)`): as opções inativas do segmentado ficam um fio acima da caixa.

### Named Rules
**A Regra do Afundar.** O que está selecionado desce para o trilho (fundo --trilho mais sombra afundada, texto em tinta 1); não ganha cor, contorno colorido nem elevação.

## Shapes

Faixas, baias, KPIs, tabelas e fichas têm cantos retos (0). Controles (abas, botões, campos, segmentado, chips, teclas, a marca "QA", tooltip) têm 2px no máximo. Marcadores de estado e o ponto do selo são quadrados de 7px, legendas 9px, nunca círculos. As barras de rolagem são finas (8px), de polegar reto em n5. Linhas são sempre de 1px; a única borda grossa do sistema é o porta-faixa de 4px. Ícones são de traço 2px em 24×24, currentColor, desenhados à mão e só os usados.

## Components

### Buttons
Controles quietos, de borda fina, que afundam quando ligados.
- **Shape:** quase reto (2px), 28px de altura.
- **Primary:** fundo de faixa, borda de 1px em n5, 13px/500, padding 0 12px, ícone de 16px com 6px de vão.
- **Hover / Focus:** hover passa para faixa realce; foco é contorno de 2px em Azul Entrada com 1px de afastamento (global).
- **Leve:** borda em filete e texto em tinta 2.
- **Pressionado** (aria-pressed): fundo de trilho com sombra afundada, texto em tinta 1.

### Chips
- **Style:** faixa com filete de 1px, 2px de canto, 12px em tinta 2, padding 1px 8px.
- **State:** pressionado afunda no trilho como o botão.

### Cards / Containers
- **Baia:** fundo --baia, cantos retos, sombra de baia, cabeça com título em Label e contagem em mono tinta 1; rola por dentro.
- **Faixa:** fundo --faixa, cantos retos, porta-faixa de 4px à esquerda, padding 6–7px por 10px com 14px à esquerda, hover em faixa realce. Título e meta numa linha cada, cortados com reticências; o texto completo fica no title.
- **Ficha** (detalhe do card): grade auto-fit de campos de 140px sobre fundo de faixa, separados por filetes de 1px, rótulo em Label 11px e valor numérico em mono 16px.

### Inputs / Fields
- **Style:** 28px de altura, borda de 1px em filete, 2px de canto, fundo de faixa, 13px; select nativo com o mesmo tratamento; cursor de texto em Azul Entrada.
- **Focus:** contorno global de 2px em Azul Entrada. Hover escurece a borda para n5.
- **Checkbox:** accent-color em tinta 1.

### Navigation
- **Barra do topo:** faixa com filete inferior; marca "QA" em bloco tinta 1 invertido de 2px de canto seguida de "SETEC" em Label; abas de 30px com a tecla do atalho (mono 10px, caixa de filete, 2px) antes do nome. Aba atual afunda no trilho; hover vai para faixa realce. Abaixo de 700px as teclas somem.
- **Filtros:** segmentado (Todos/DEV/WEB/MOB/Demandas) numa caixa de baia com opções em relevo; a ativa perde o relevo, fica no fundo da caixa e vai a 600. Selects de projeto e mês ao lado; Modo TV à direita.
- **Selo de coleta:** quadrado de 7px em n7 (atrasado: n6 com contorno em tinta 2), horário da coleta e idade em tinta 3. Falha de atualização aparece escrita.

### Contador (KPI)
Faixa única de cinco contadores em grade auto-fit (mín. 160px), separados por fio de 1px em filete. Cada contador tem porta-faixa na cor do que o número é (não de se é bom ou ruim), rótulo em Label, valor em Numeral e comparação à direita em 12px tinta 3 com o valor anterior em mono tinta 2.

### Tabela como pilha de faixas
Linhas separadas por 1px (border-spacing), cada linha é uma faixa com porta-faixa na primeira célula, hover em faixa realce. Cabeçalho fixo no fundo da baia, em Label 11px sans. Colunas de estado levam o quadradinho de 7px da cor no cabeçalho; os números da coluna ficam em tinta. Zeros e pessoas inativas em tinta 3. Rodapé de total em 600 sobre fundo transparente.

### Barra de carga
Trilho rebaixado de 10px com segmentos de no mínimo 3px separados por 1px: A iniciar, Em andamento (neutros), Teste/QA (Azul Entrada), Correções (Vermelho Correção). Largura proporcional ao maior total; legenda escrita acima. Linha de carga: nome (116px) · barra · total em mono.

### Feed de movimentações e linha do tempo
Faixas agrupadas por dia (Label-sm), com horário em mono tinta 3 à esquerda, rótulo do evento com marcador quadrado, #card e título, e "pessoa · por quem moveu" em meta. A faixa que chegou na última coleta entra uma vez deslizando 10px da esquerda a partir de faixa realce (560ms, cubic-bezier(0.16, 1, 0.3, 1)); com movimento reduzido, nada anima.

### Gráficos
ECharts em canvas, lendo as cores dos tokens em tempo de execução e redesenhando quando o tema do sistema muda. Sem animação, legenda de quadrados 10×10 no topo, eixos e grade em filete, rótulos de eixo em mono 11px tinta 3, tooltip de faixa com filete e 2px de canto, ponteiro de eixo em sombra leve. Barras com no máximo 28px. Desenhados sobre uma faixa larga dentro da baia.

## Do's and Don'ts

### Do:
- **Do** tirar todo cinza da escala --n0..--n10 e usar os papéis (--trilho, --baia, --faixa, --faixa-realce, --filete, --tinta-1..3) em vez do degrau cru quando o papel existe.
- **Do** marcar estado com o porta-faixa de 4px (inset 4px 0 0) ou com o quadrado de 7px, e escrever o nome do estado ao lado.
- **Do** usar cada matiz só no seu significado: azul entrou/em QA, verde aprovado, vermelho reprovado, violeta sem QA, ocre devolvido.
- **Do** abrir toda tabela de pessoas em ordem alfabética; ordenar por coluna é escolha de quem olha.
- **Do** colocar a cor de estado de uma coluna só no quadradinho do cabeçalho e manter os números da coluna em tinta.
- **Do** representar grupos (DEV, QA, estagiários, gestão) com degraus da escala neutra, alternando claro e escuro, com legenda escrita.
- **Do** escrever números, #card, horários e períodos em JetBrains Mono tabular; cabeçalhos, rótulos e frases em Public Sans.
- **Do** mostrar o selecionado afundando no trilho (fundo --trilho + sombra afundada).
- **Do** manter faixas com altura fixa: uma linha por campo, reticências, texto completo no title.
- **Do** mostrar o que não foi medido como não medido ("—", lacunas de coleta, saídas sem autor).

### Don't:
- **Don't** criar ranking de pessoas: sem pódio, sem destaque do "melhor" ou "pior", sem cor de julgamento sobre nome de pessoa ou sobre número.
- **Don't** colorir "dias em QA" com cor de alerta, nem fazer nada piscar ou tocar som.
- **Don't** usar matiz de estado para grupo de pessoas ou para qualquer coisa que não seja o estado.
- **Don't** deixar uma cor sozinha, sem rótulo, legenda ou nome escrito.
- **Don't** arredondar faixas, baias ou KPIs, nem passar de 2px de canto em controle.
- **Don't** usar sombra projetada ou elevação para fora; a profundidade só afunda.
- **Don't** usar mono em cabeçalho, rótulo ou frase.
- **Don't** trazer de volta o fliperama CRT (brilho, fósforo, textura, retrô) nem virar fantasia de aeroporto (avião, papel, cantos redondos).
- **Don't** montar o dashboard genérico de cartões de KPI flutuantes com gráficos soltos.
