# QA SETEC: dashboard

Painel das métricas de QA do Kanboard. Uso interno.

**Site:** https://gustavomello-hue.github.io/qa-dashboard-setec/

## Como os dados chegam aqui

```
PC SETEC, tarefa "Monitor QA" do Agendador, de hora em hora
  1. rodar_monitor.bat       → coleta do Kanboard (ledger + snapshot)
  2. publicar_dashboard.bat  → dashboard.json → branch `dados` deste repo
                             → backup do ledger → repo privado qa-monitor-setec
                                        │
navegador ◄── raw.githubusercontent.com/…/dados/dashboard.json
```

- **`main`**: este código. Cada push aqui recompila e publica o site
  (`.github/workflows/pages.yml`).
- **`dados`**: só o `dashboard.json`, com um único commit sobrescrito a cada
  hora. Não edite à mão.

As métricas são calculadas em Python pelas mesmas funções da planilha
`painel_qa.xlsx`. O site só filtra, soma e desenha. O formato do JSON está
em `src/data/contrato.ts`.

## Desenvolvimento

```bash
npm install
npm run dados:local   # copia o último dashboard.json gerado nesta máquina
npm run dev
npm test
npm run build
```

Para gerar um JSON novo sem publicar nada:
`..\scripts\publicar_dashboard.bat --sem-push --forcar`.

## Estrutura

```
src/
  data/        contrato do JSON, carregamento, cálculos (com testes) e rota na URL
  telas/       Hoje, Mensal, Card
  componentes/ gráficos (ECharts) e peças compartilhadas
```

## Configuração única no GitHub

Em *Settings → Pages → Build and deployment → Source*, escolha **GitHub Actions**.
