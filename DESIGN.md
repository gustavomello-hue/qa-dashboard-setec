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
  n7: "#5f6874"
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
- Teclado de primeira classe: 1–6 trocam de tela (a 5ª é Reunião, a 6ª Projetos), # ou / vai para a busca de card; na apresentação, setas, espaço, Home/End, F e Esc.

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
- **Borda de campo** (--borda-campo → n6): contorno de busca, select e chip de filtro, para o campo se distinguir do fundo (WCAG 1.4.11). A tinta 3 (n7 #5f6874 no claro) passa 4,5:1 sobre faixa, trilho e baia.
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

Na tela Agora, a partir de 1100px, o quadro é uma grade de três baias (carga minmax(270px, 0.8fr), fila minmax(0, 1.7fr), movimentações minmax(300px, 1fr)) sob a faixa única de sete contadores, ocupando exatamente a altura da janela: a página não rola, cada baia rola por dentro. Abaixo disso as baias empilham. A tela Pessoa usa grade auto-fit de colunas de 380px, com baias que crescem até a altura útil e só então rolam. A Mensal é de duas colunas e vira uma abaixo de 800px. A Card ocupa a largura toda: a partir de 1300px, linha do tempo à esquerda e ficha em painel lateral de 320px.

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

Faixas, baias, KPIs, tabelas e fichas têm cantos retos (0). Controles (abas, botões, campos, segmentado, chips, teclas, a marca "QA", tooltip) têm 2px no máximo. Marcadores de estado, o ponto do selo e o marcador do aviso de coleta são quadrados de 7px, legendas 9px, nunca círculos. As barras de rolagem são finas (8px), de polegar reto em n5. Linhas são sempre de 1px; as únicas bordas grossas são o porta-faixa (4px; 6px nos números grandes projetados do modo Reunião). Ícones são de traço 2px em 24×24, currentColor, desenhados à mão e só os usados.

## Components

### Buttons
Controles quietos, de borda fina, que afundam quando ligados.
- **Shape:** quase reto (2px), 28px de altura.
- **Padrão:** fundo de faixa, borda de 1px em n5, 13px/500, padding 0 12px, ícone de 16px com 6px de vão.
- **Primário** (só "Começar a apresentação"): cheio em tinta 1 com texto na cor da faixa, 34px de altura, 600; hover em n9. É o único botão cheio do sistema.
- **Mini** (tentar de novo no selo): 22px de altura, 12px.
- **Hover / Focus:** hover passa para faixa realce; foco é contorno de 2px em Azul Entrada com 1px de afastamento (global).
- **Leve:** borda em filete e texto em tinta 2.
- **Pressionado** (aria-pressed): fundo de trilho com sombra afundada, texto em tinta 1.

### Chips
- **Style:** faixa com filete de 1px, 2px de canto, 12px em tinta 2, padding 1px 8px.
- **State:** pressionado afunda no trilho como o botão.

### Cards / Containers
- **Baia:** fundo --baia, cantos retos, sombra de baia; rola por dentro. A cabeça é uma placa: título em Label tinta 1, a contagem num campo próprio (caixa de filete, fundo de faixa, mono 12px, 2px de canto) e um filete de 1px separando a placa do conteúdo.
- **Faixa:** fundo --faixa, cantos retos, porta-faixa de 4px à esquerda, padding 6–7px por 10px com 14px à esquerda, hover em faixa realce. Título e meta numa linha cada, cortados com reticências; o texto completo fica no title.
- **Ficha** (detalhe do card): campos sobre fundo de faixa separados por filetes de 1px, rótulo em Label 11px e valor numérico em mono 16px. A partir de 1300px vira painel lateral de 320px (um campo por linha) e a linha do tempo ocupa o resto da largura; abaixo disso, grade auto-fit de 140px acima da linha do tempo. A tela do Card não tem largura máxima.

### Inputs / Fields
- **Style:** 28px de altura, borda de 1px em --borda-campo (n6), 2px de canto, fundo de faixa, 13px; select nativo e chip de filtro com o mesmo contorno; cursor de texto em Azul Entrada.
- **Focus:** contorno global de 2px em Azul Entrada. Hover escurece a borda para tinta 3.
- **Checkbox:** accent-color em tinta 1.

### Navigation
- **Barra do topo:** faixa com filete inferior; marca "QA" em bloco tinta 1 invertido de 2px de canto seguida de "SETEC" em Label; abas de 30px com a tecla do atalho (mono 11px, caixa de filete, 2px) antes do nome. Aba atual afunda no trilho; hover vai para faixa realce. Abaixo de 700px as teclas somem.
- **Filtros:** segmentado (Todos/DEV/WEB/MOB/Demandas) numa caixa de baia com opções em relevo; a ativa perde o relevo, fica no fundo da caixa e vai a 600. Selects de projeto e mês ao lado; Modo TV à direita.
- **Selo de coleta:** quadrado de 7px em n7 (atrasado: n6 com contorno em tinta 2), horário da coleta e idade em tinta 3. Falha de atualização aparece escrita.

### Contador (KPI)
Faixa de sete contadores separados por fio de 1px em filete: uma linha de 7 a partir de 1100px, 4+3 entre 701 e 1099px (o sétimo ocupa duas células, sem vão), duas colunas abaixo disso. Os contadores são Em QA, Entraram, Aprovados, Reprovados, Concluídos sem QA, Criados e Movimentados. Cada contador tem porta-faixa na cor do que o número é (não de se é bom ou ruim; Criados e Movimentados não são estado de QA e ficam neutros), rótulo em Label, valor em Numeral e comparação à direita em 12px tinta 3 com o valor anterior em mono tinta 2.

### Tabela como pilha de faixas
Linhas separadas por 1px (border-spacing), cada linha é uma faixa com porta-faixa na primeira célula, hover em faixa realce. Na fila de QA, os campos da faixa (#card · título · dias · retornos) ficam em caixas separadas por filete vertical de 1px, como a faixa de controle de voo. Na Equipe, sob cada número, a diferença para o período anterior em 11px tinta 3, sem cor; zero contra zero fica em branco. Cabeçalho fixo no fundo da baia, em Label 11px sans. Colunas de estado levam o quadradinho de 7px da cor no cabeçalho; os números da coluna ficam em tinta. Zeros e pessoas inativas em tinta 3. Rodapé de total em 600 sobre fundo transparente.

### Fila de QA: cards fora do painel
Os cards que o painel do Kanboard não mostra (muitas vezes sem título e sem responsável) ficam num grupo recolhido no fim da fila, "N fora do painel do Kanboard", aberto por um botão em Label sobre a baia. O topo da fila é sempre de cards em que alguém age. Título e responsável ausentes usam um texto único: "Título não registrado" e "Sem responsável".

### Tabelas largas no celular
Na Equipe, a coluna com o nome da pessoa fica fixa (sticky) quando a tabela rola para o lado. As abas do topo rolam na horizontal com a borda direita esmaecida, e o seletor de frente tem 40px de altura abaixo de 700px.

### Barra de carga
Trilho rebaixado de 10px com segmentos de no mínimo 3px separados por 1px: A iniciar, Em andamento (neutros), Teste/QA (Azul Entrada), Correções (Vermelho Correção). Largura proporcional ao teto da escala (o maior total, ou 1,2× o segundo maior quando o maior passa de 1,5× o segundo); a barra que passa do teto enche e ganha um corte de 3px perto do fim, com o número inteiro ao lado. Legenda escrita acima. Linha de carga em campos com filete: nome · barra · total em mono. QA vem primeiro na lista.

### Feed de movimentações e linha do tempo
Faixas agrupadas por dia (Label-sm), com horário em mono tinta 3 à esquerda, rótulo do evento com marcador quadrado, #card e título, e "pessoa · por quem moveu" em meta. A faixa que chegou na última coleta leva a marca "novo" (quadrado Azul Entrada + texto) e, na primeira vez que aquela coleta aparece na aba, entra deslizando 10px da esquerda a partir de faixa realce (560ms, cubic-bezier(0.16, 1, 0.3, 1)); voltar à tela não repete o gesto, e dado de coleta parada não é "novo". Com movimento reduzido, nada anima. Na linha do tempo do Card, os campos (quando · evento · de→para · tempo na coluna) ficam em caixas de filete, e o tempo em Teste/QA vem em tinta 1.

### Número clicável
Os números principais abrem a lista dos cards que eles contam: os KPIs da Agora e da Pessoa e as células da Equipe.
- **Em repouso:** sublinhado pontilhado de 1px em n6 (~2,9:1), afastado do número 0,2em: discreto, mas perceptível. O peso e a cor do número não mudam. Nome acessível: "77 Em QA agora: ver os cards".
- **Área de toque:** cobre a célula do número (pseudo-elemento), sem mudar o desenho.
- **Hover e foco:** o sublinhado fica contínuo em tinta 3, e o KPI vai para faixa realce.
- **Não viram link:** zero, "—", linha de total e números do modo TV e da Reunião.
- **"ver fila":** texto pequeno sublinhado no rodapé do KPI "Em QA", com a seta desenhada. Só aparece abaixo de 1100px, quando a fila sai da tela.

### Lista de cards (#/cards)
- **Chips de filtro:** ficam no trilho, com rótulo em Label-sm tinta 3, o valor e um × de 20px.
  - A métrica e o período se trocam por select embutido no chip.
  - O período aceita um dia (campo de data em mono).
- **Baia:** a placa leva o quadrado de 7px da cor do estado contado e a frase "N eventos em M cards" (só "M cards" quando N = M).
- **Ações:** busca, ordenação e "Copiar números", que confirma em tinta 3.
- **Linhas:** pilha de faixas como a Fila de QA.
  - O porta-faixa tem a cor do estado contado; em "Concluídos" e "Testados", a do desfecho de cada card, com o nome escrito.
  - Projeto e coluna cortam em 18ch, para o título ficar com a largura.
  - A coluna "Vezes" só aparece quando algum card repete.
- **Celular:** projeto, pessoa, data e coluna descem para a linha de apoio, que quebra em vez de cortar.

### Descrição do card
- **Posição:** a linha do tempo vem primeiro (é o que o Kanboard não guarda); a seção "Descrição" vem depois, recolhida em ~8 linhas com o botão "Mostrar a descrição inteira" quando o texto passa disso. Os títulos do Markdown descem para h4–h6, abaixo do h3 da seção.
- **Texto:** Public Sans 14px com entrelinha 1,6 e medida de 75ch, para ler.
  - Títulos do Markdown em 16px/600 (h1 e h2) e 14px/600 (h3 em diante).
  - `code` e `pre` em mono 12px sobre o trilho, com 2px de canto; tabelas com filetes e rolagem lateral.
  - Links sublinhados em n5.
- **O que não entra:** imagens somem e HTML cru vira texto.
- **Estados:** "Descrição não coletada", "Sem descrição no Kanboard" e "… continua no Kanboard", como nota.
- **Ficha:** ganha os campos do Kanboard antes dos de QA (coluna atual, responsável, datas, tempos, categoria, referência). A cor do Kanboard só aparece escrita ("vermelho"), nunca pintada: cor no quadro é só estado.

### Gráficos
ECharts em canvas, lendo as cores dos tokens em tempo de execução e redesenhando quando o tema do sistema muda. Sem animação, legenda de quadrados 10×10 no topo, eixos e grade em filete, rótulos de eixo em mono 11px tinta 3, tooltip de faixa com filete e 2px de canto, ponteiro de eixo em sombra leve. Barras com no máximo 28px. Desenhados sobre uma faixa larga dentro da baia. Linha de tendência só com 4 meses ou mais; antes disso, % e tempo médio aparecem como mini-barras neutras (4px, n6 sobre o trilho) dentro do Resumo. O mês corrente leva "*" no eixo e na tabela.

### Estados do painel
- **Aviso de coleta:** faixa inteira entre a barra e o quadro, com porta-faixa n6 e marcador quadrado vazado; coleta parada no expediente escurece para tinta 1 (porta e marcador cheios), sem vermelho. Texto diz há quanto tempo, até que horas valem os números e o que conferir. Os contadores do dia passam a "até HH:MM" (ou o dia da coleta) em tinta 2.
- **Carga inicial:** o contorno do quadro parado (faixa de contadores e três baias vazias), sem animação.
- **Falha:** cartão em faixa com porta-faixa tinta 1, título, a mensagem em português do que falhou e "Tentar de novo".
- **Glossário:** "Como ler estes números" em `<details>`, lista de definições sobre faixa, vindo de `src/data/glossario.ts`.

### Modo reunião (aba Reunião)
Preparo dentro do quadro (tipo de reunião, mês, pessoa, frente) e apresentação em tela inteira, sem barra nem filtros: cabeça com o contexto em Label ("Reunião mensal · set/26") e o título da lâmina, corpo de uma ideia por lâmina, rodapé com "Esc · sair", dica de teclas e contador "3/7". A escala é a de projeção (`--r-*`, em vh: numeral 48–96px, título 26–44px, subtítulo 17–26px, dado 16–24px, rótulo 13–18px), lida a ~3 m. Números grandes são faixas com porta-faixa e o valor anterior embaixo; unidade ("h") em 0,45em. Tabelas por pessoa se dividem em lâminas de tamanho parecido pela altura da tela. Avança com → / espaço / PageDown / clique na metade direita; volta com ← / clique na esquerda; Home/End; F tela cheia; Esc volta ao preparo. A conversa individual nunca mostra outra pessoa nem média da equipe. Durante a apresentação os atalhos globais (1–5, /, #) ficam desligados, e o leitor de tela anuncia só "Lâmina N de M: título". Lâminas de números grandes centralizam o bloco na altura; cada número traz a comparação com sinal ("ago/26: 364 (−35)"). Nas tabelas projetadas a variação fica ao lado do número, uma linha por pessoa. Barras levam o valor escrito (ninguém passa o mouse num projetor). Listas cortadas dizem "e mais N"; títulos usam até duas linhas. Para quem desenvolve, "abertos há mais tempo" exclui cards parados em Teste/QA (espera do QA, não do dev).

**Base parcial.** Um mês com medição parcial (reconstruído) nunca é base de comparação cheia: em toda tela o rótulo vira "ago/26 (parcial)", o sinal de variação some e uma nota diz "serve de referência, não de comparação"; nos gráficos o mês aparece como "ago/26 (parcial)". Nos 5 primeiros dias do mês, Equipe e Pessoa abrem no último mês fechado e dizem isso.

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
