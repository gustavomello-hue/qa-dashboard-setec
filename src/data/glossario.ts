// Definições das métricas: fonte única para os cabeçalhos das tabelas e para
// o bloco "Como ler estes números". Mudou a regra no Python
// (metricas_pessoa.py), muda aqui.

export const DEFINICAO = {
  credito: "Cada número vai para quem era o responsável pelo card no momento do evento, não para o responsável de hoje.",
  entregues: "Cards que entraram em Teste/QA com a pessoa como responsável.",
  aprovados: "Cards que saíram de Teste/QA para Concluídas.",
  reprovacoes: "Voltas de Teste/QA para Correções. Um card reprovado 2 vezes conta 2.",
  cardsReprovados:
    "Dos cards julgados no período (aprovados ou reprovados), quantos foram reprovados ao menos uma vez. É a mesma conta na equipe e em cada pessoa. Só entram quadros com coluna de Correções: onde não há como reprovar, a taxa não é medida.",
  devolvidos: "Cards que saíram de Teste/QA para outra coluna que não Correções nem Concluídas (ex.: Interrompidas).",
  concluidos: "Aprovados em Teste/QA mais concluídos sem QA.",
  semQa: "Cards que foram para Concluídas vindos de outra coluna, sem passar por Teste/QA.",
  criados: "Cards criados pela pessoa no Kanboard.",
  abertos: "Cards com a pessoa agora em A iniciar, Em andamento, Teste/QA ou Correções.",
  testados: "Saídas de Teste/QA feitas pela pessoa: aprovou mais reprovou.",
  aprovou: "Moveu o card de Teste/QA para Concluídas.",
  reprovou: "Moveu o card de Teste/QA para Correções.",
  cardsReprovouQa: "Dos cards que a pessoa testou no período, quantos ela reprovou ao menos uma vez.",
  devolveu: "Moveu o card de Teste/QA para outra coluna.",
  semAutor: "Saídas de Teste/QA em que o Kanboard não registrou quem moveu o card. Não são atribuídas a ninguém.",
  naoQa: "Saídas de Teste/QA feitas por quem não está no grupo QA.",
  diasEmQa: "Dias corridos desde que o card entrou em Teste/QA pela última vez.",
  retornos: "Quantas vezes o card voltou de Teste/QA para Correções, em todo o histórico.",
  tempoEmQa: "Horas corridas entre a entrada em Teste/QA e a saída, em média por passagem.",
} as const;

/** Termos do bloco "Como ler", na ordem em que aparecem nas telas. */
export const GLOSSARIO: { termo: string; definicao: string }[] = [
  { termo: "Crédito", definicao: DEFINICAO.credito },
  { termo: "Entregues para QA", definicao: DEFINICAO.entregues },
  { termo: "Aprovados", definicao: DEFINICAO.aprovados },
  { termo: "Reprovações", definicao: DEFINICAO.reprovacoes },
  { termo: "% cards reprovados", definicao: DEFINICAO.cardsReprovados },
  { termo: "Devolvidos", definicao: DEFINICAO.devolvidos },
  { termo: "Concluídos sem QA", definicao: DEFINICAO.semQa },
  { termo: "Testados (QA)", definicao: DEFINICAO.testados },
  { termo: "Abertos", definicao: DEFINICAO.abertos },
  { termo: "Dias em QA", definicao: DEFINICAO.diasEmQa },
  { termo: "Retornos", definicao: DEFINICAO.retornos },
  { termo: "Sem autor", definicao: DEFINICAO.semAutor },
];

/** Termos da tela Projetos (etapa 4): fluxo de todos os projetos do Kanboard. */
export const GLOSSARIO_PROJETOS: { termo: string; definicao: string }[] = [
  { termo: "Abertos", definicao: "Cards fora da coluna de concluído e não fechados no Kanboard." },
  { termo: "Parado", definicao: "Card aberto sem nenhuma movimentação há 15 dias ou mais. Backlog e Interrompidas não contam: esperar ali é o papel dessas colunas." },
  { termo: "Entradas", definicao: "Cards criados no mês." },
  { termo: "Saídas", definicao: "Cards que chegaram à coluna de concluído ou foram fechados no Kanboard no mês." },
  { termo: "Tempo de ciclo", definicao: "Dias corridos da criação do card à saída. A mediana é o meio da fila; o P85 é o tempo que 85% dos cards não passaram. Na lista, vale para as saídas dos últimos 90 dias." },
  { termo: "Não medido", definicao: "O quadro não tem coluna de concluído e nunca fechou cards: não há como saber quando um card saiu." },
  { termo: "Poucos dados", definicao: "Menos de 5 saídas no período: uma mediana de 1 ou 2 cards pareceria medida sem ser." },
  { termo: "Limitações", definicao: "O histórico anterior a 02/10/2026 é reconstruído pelo estado atual dos cards: um card movido de novo depois de concluído perde a data de saída original, e um card excluído no Kanboard some da série. Os cards fechados são lidos uma vez por dia." },
];
