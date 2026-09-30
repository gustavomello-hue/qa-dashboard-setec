// Definições das métricas: fonte única para os cabeçalhos das tabelas e para
// o bloco "Como ler estes números". Mudou a regra no Python
// (metricas_pessoa.py), muda aqui.

export const DEFINICAO = {
  credito: "Cada número vai para quem era o responsável pelo card no momento do evento, não para o responsável de hoje.",
  entregues: "Cards que entraram em Teste/QA com a pessoa como responsável.",
  aprovados: "Cards que saíram de Teste/QA para Concluídas.",
  reprovacoes: "Voltas de Teste/QA para Correções. Um card reprovado 2 vezes conta 2.",
  cardsReprovados:
    "Dos cards julgados no período (aprovados ou reprovados), quantos foram reprovados ao menos uma vez. É a mesma conta na equipe e em cada pessoa.",
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
