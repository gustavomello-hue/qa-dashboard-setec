# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Equipe de QA da SETEC** (usuário principal: quem mantém o painel). Sucesso é saber em segundos o que está parado em Teste/QA, o que voltou para correção e quem está com carga demais.
- **Gestão** (coordenação e chefia). Sucesso é ter números do mês e números por pessoa confiáveis, para acompanhamento, conversa individual e relatório, sem virar ranking.
- **Desenvolvedores**, de forma secundária: ver os próprios cards reprovados e abertos.

O site é público no GitHub Pages, mas é acessado na prática só pela equipe de QA e pela gestão (decisão do usuário, 30/09/2026).

## Product Purpose

É o painel das métricas de QA do Kanboard da Secretaria (SETEC) da Prefeitura de Itajaí. Substituiu a planilha `painel_qa.xlsx`. Mostra:

- o estado de agora: fila de QA, carga por pessoa e movimentações recentes;
- as métricas por pessoa (DEV, QA, estagiários): entregues, aprovados, reprovados, devolvidos, concluídos sem QA, testados e criados;
- a evolução mensal da equipe;
- a história de cada card.

Os dados são coletados a cada 10 minutos, das 7h às 19h.

## Positioning

É o único lugar que sabe **quantas vezes um card voltou para correção**, **quanto tempo ficou em QA**, **quem testou** e **com quem o card estava no momento de cada evento**. O Kanboard não guarda isso: sobrescreve a data de movimentação e mantém só os últimos 50 eventos por projeto. O painel reconstrói essa história a partir de um histórico próprio (o ledger). Também é honesto sobre o que não mediu: lacunas de coleta, saídas de QA sem autor e meses com amostra incompleta aparecem como tais.

## Operating Context

- **Cenas de uso:**
  - uma aba aberta no monitor da mesa **o dia todo**, ao lado do Kanboard, consultada várias vezes ao dia (cena principal: pede conforto visual);
  - reunião de acompanhamento com a gestão, com números do mês e fichas por pessoa.
- **Modo TV:** existe (`?tv`), mas é secundário; o design é otimizado para leitura de perto.
- **Reunião projetada:** a aba Reunião serve à reunião mensal e à conversa individual (só projetar; impressão fora do escopo).
- **Coleta:** o PC da SETEC coleta pelo Agendador de Tarefas e publica o `dashboard.json` no branch `dados`. O site busca o JSON a cada 10 min, só com a aba visível.
- **Links:** os links dos cards abrem o Kanboard interno, que só funciona na VPN ou na rede da prefeitura.
- **Idioma:** pt-BR.
- **Volume típico:**
  - cerca de 60 cards em QA ao mesmo tempo;
  - 72 projetos em quatro prefixos (DEV, WEB, MOB, Demandas);
  - cerca de 300 entradas em QA por mês;
  - 22 pessoas classificadas no `equipe.json` (14 DEV, 3 QA sendo 2 estagiários, 5 estagiários DEV), mais gestão e outros.

## Capabilities and Constraints

- **Telas:**
  - **Agora** (inicial): cabe numa tela sem rolar. Tem 5 KPIs do dia comparados com o último dia útil (em QA, entraram, aprovados, reprovados, concluídos sem QA), carga por pessoa em barras empilhadas por coluna, fila de QA e movimentações recentes.
  - **Equipe:** uma tabela por grupo, em ordem alfabética, ordenável por clique no cabeçalho, com tendência semanal.
  - **Pessoa:** ficha individual com comparação com o período anterior, gráfico semanal, cards abertos, reprovados e concluídos sem QA.
  - **Mensal:** volume, % de reprovação, tempo médio em QA e entregas por grupo.
  - **Card:** linha do tempo.
  - **Reunião:** apresentação para projetar (lâminas em sequência, teclado), em dois tipos. A mensal da equipe tem números do mês, volume e grupos, tabelas por pessoa e o que não foi medido. A conversa individual mostra só a pessoa: três números e os cards para conversar.
- **Filtros:** prefixo, projeto e período (mês ou últimos 7 dias). Tudo fica na URL.
- **Regras de métrica:**
  - O crédito vai ao responsável **no momento** do evento.
  - A reprovação conta como evento e como card distinto; a taxa é por card.
  - "Testou" = quem moveu o card para fora de QA, se for do grupo QA.
  - Sem autor → balde próprio, nunca estimado.
  - A regra mora no Python (`metricas_pessoa.py`); o site só conta.
- **"Dias em QA":** dias corridos, sem cores de alerta.
- **Stack:** React 19, Vite, TypeScript, Apache ECharts. Contrato em `src/data/contrato.ts`.
- **Vocabulário:** Teste/QA, Correções, Concluídas, entregue para QA, aprovado (QA → Concluídas), reprovado (QA → Correções), devolvido (QA → outra coluna), concluído sem QA, testou, carga, lacuna de coleta, prefixo.
- **Depois:** visão anual das métricas.

## Brand Commitments

Nenhuma identidade institucional obrigatória. Régua de acabamento escolhida pelo usuário: **Linear / GitHub**, ou seja, ferramenta de trabalho sóbria, tipografia caprichada e pouca cor. O visual não pode ser cansativo de olhar (aba aberta o dia todo), genérico de SaaS, nem enfeitado ou pouco sério (vai para reunião com a chefia).

## Evidence on Hand

Os dados são reais e estão no `dashboard.json`, publicado no branch `dados` (cópia local de desenvolvimento em `public/dados-local.json`). Traz nomes reais de servidores, títulos de cards e projetos, publicados em claro por decisão do usuário. Não há depoimentos nem números de "impacto": não inventar.

## Product Principles

1. **Fiel antes de bonito.** Um número que não foi medido não aparece como medido.
2. **O que precisa de atenção vem primeiro:** o que está parado e quem está sobrecarregado.
3. **Pessoas não são ranking.** As tabelas abrem em ordem alfabética, sem pódio, sem "melhor/pior", sem cor de julgamento sobre pessoas.
4. **Confortável para o dia todo.** Pouco contraste de ruído, cor só com significado, nada pisca.
5. **Cada visão cabe num link.**
