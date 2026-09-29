# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Analistas de QA da SETEC** (usuário principal: quem mantém o painel). Sucesso é saber em
  segundos o que está parado em Teste/QA e o que voltou para correção.
- **Desenvolvedores** das equipes DEV, WEB, MOB e Demandas. Sucesso é ver os próprios cards
  reprovados ou na fila sem abrir o Kanboard.
- **Gestores e chefia.** Sucesso é ter números do mês confiáveis (taxa de aprovação, tempo em
  QA) para decisão e relatório.

## Product Purpose

É o painel das métricas de QA do Kanboard da Secretaria (SETEC) da Prefeitura de Itajaí.
Substitui a planilha `painel_qa.xlsx`, que precisava ser gerada à mão. Mostra:

- o que está em Teste/QA agora;
- o que entrou, foi aprovado e foi reprovado hoje;
- a evolução mensal;
- a história de cada card.

Os dados são atualizados de hora em hora.

## Positioning

É o único lugar que sabe **quantas vezes um card voltou para correção** e **quanto tempo ele
ficou em QA**. O Kanboard não guarda isso: ele sobrescreve a data de movimentação e mantém só
os últimos 50 eventos por projeto. O painel reconstrói essa história a partir de um histórico
próprio (o ledger), gravado a cada coleta. Também é honesto sobre o que não mediu: lacunas
de coleta e meses com amostra incompleta aparecem como tais.

## Operating Context

- Três cenas de uso, todas confirmadas:
  - uma aba aberta no monitor da mesa, ao lado do Kanboard, consultada várias vezes ao dia;
  - uma TV ou monitor na sala da equipe, visto de longe e sem interação;
  - reunião ou apresentação dos números do mês para a chefia.
- **Coleta:** um PC da SETEC coleta os dados de hora em hora (Agendador de Tarefas,
  expediente real de 12h a 18h em dias úteis) e publica o `dashboard.json`.
- **Site:** fica no GitHub Pages e lê esse JSON direto do branch `dados`.
- **Links:** os links dos cards abrem o Kanboard interno, que só funciona na VPN ou na rede
  da prefeitura.
- **Idioma:** pt-BR.
- **Volume típico:**
  - cerca de 60 cards em QA ao mesmo tempo;
  - 72 projetos em quatro prefixos: DEV 31, WEB 26, MOB 8, Demandas 7;
  - por volta de 300 entradas em QA por mês;
  - cerca de 1.400 eventos por mês.

## Capabilities and Constraints

- **MVP com três telas:**
  - **Hoje:**
    - 5 KPIs, cada um comparado com o último dia útil;
    - fila de QA ordenada do mais parado para o mais recente, com "dias em QA" em **dias
      corridos**, sem cores de alerta;
    - distribuição atual sem Concluídas;
    - selo de lacunas.
  - **Mensal:** a partir de ago/2026, com entradas, aprovados, reprovados, taxa e tempo
    médio em QA.
  - **Card:** linha do tempo das movimentações.
- **Filtros:** prefixo e projeto, guardados na URL para poder compartilhar a visão por link.
- **Atualização automática:** a cada 15 min, só com a aba visível.
- **Aviso de dado atrasado:** mais de 2h sem coleta dentro do expediente.
- **Métricas calculadas em Python** pelas mesmas funções da planilha. O site só filtra,
  soma e desenha.
- **Formato dos dados:** `src/data/contrato.ts`, versão 1.
- **Stack:** React 19, Vite, TypeScript e Apache ECharts.
- **Vocabulário:** Teste/QA, Correções, Concluídas, "entrou em QA", "reprovado"
  (QA → Correções), "aprovado" (QA → Concluídas), retornos, lacuna de coleta, prefixo.
- **Depois do MVP:** retrabalho, visão por responsável, levantamento anual (criados ×
  concluídos, lead time) e heatmap.

## Brand Commitments

Nenhuma identidade institucional obrigatória. O visual é livre.

## Evidence on Hand

Os dados são reais e estão no `dashboard.json`, publicado no branch `dados` (cópia local de
desenvolvimento em `public/dados-local.json`). Traz nomes reais de servidores, títulos de
cards e projetos, e foi publicado em claro por decisão do usuário. O painel não tem
depoimentos nem números de "impacto": não inventar.

## Product Principles

1. **Fiel antes de bonito.** Um número que não foi medido não aparece como medido. Lacunas,
   amostras e meses parciais se mostram como são.
2. **O que precisa de atenção vem primeiro.** A pergunta mais frequente é "o que está parado
   em QA?".
3. **Legível de longe e de perto.** A mesma tela serve à mesa, à TV da sala e à reunião.
4. **Números batem com a planilha.** Uma divergência é um defeito, nunca uma interpretação.
5. **Cada visão cabe num link.** Filtro e aba vão junto.
