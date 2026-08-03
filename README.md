# Gym Rats — Sprint 3

Dashboard individual da Sprint 3 do Gym Rats, desafio fitness interno da **TD Business**. A aplicação exibe ranking, evolução semanal, destaques e o feed de atividades a partir de dados publicados no Google Sheets.

**Produção:** [gymrats-sprint-3.vercel.app](https://gymrats-sprint-3.vercel.app)

## Sprint

- **Início:** 01/08/2026
- **Fim:** 14/09/2026
- **Duração:** 45 dias
- **Formato:** competição individual
- **Semana:** sábado a sexta-feira
- **Dia ativo:** 1 ponto, limitado a 6 dias por semana
- **Treino válido:** mínimo de 30 minutos e check-in no mesmo dia

As regras de modalidade, duração e validade são tratadas antes da consolidação da planilha. O dashboard não revalida atividades; ele consome os valores já calculados.

## Funcionalidades

- **Resumo:** Top 5 em formato de pódio e posições 6 a 10 na seção “Na cola do pódio”.
- **Ranking completo:** busca por competidor, filtro de pontuação, ordenação e detalhamento por semana e desafio.
- **Evolução:** pontos consolidados por semana e Top 5 da semana mais recente.
- **Destaques:** líderes de cada desafio, relâmpago e gincana.
- **Detalhes do competidor:** tooltip com semanas, desafios, extras e total.
- **Tendência semanal:** compara a pontuação da última semana preenchida com a semana anterior; não representa mudança de posição no ranking.
- **Feed de mídia:** carrossel contínuo, controles laterais e janela semanal com até 24 fotos recentes.
- **Quilômetros percorridos:** soma da coluna `distance_miles` da aba `Dataset`, já fornecida em quilômetros.
- **Calendário da Sprint:** percurso visual dos 45 dias, organizado em semanas de sábado a sexta-feira.
- **Curiosidades de treino:** destaques individuais rotativos de duração, distância, calorias e horários calculados a partir dos treinos válidos do `Dataset`.
- **Atualização automática:** ranking, feed e Dataset são consultados novamente a cada 2 minutos.
- **Layout responsivo:** tema claro da TD Business para desktop, tablet e celular.
- **Contagem regressiva:** acompanha os 45 dias da Sprint 3.

## Pontuação no dashboard

O total individual é calculado assim:

```text
TOTAL = CHECKIN
      + DESAFIO 1 ... DESAFIO 5
      + DESAFIO RELÂMPAGO
      + GINCANA
      + PTS EXTRAS
```

`CHECKIN` já corresponde à soma dos dias ativos das sete semanas. As colunas `SEMANA 1` a `SEMANA 7` são usadas como detalhamento e não são somadas novamente. O KPI de quilômetros soma diretamente `distance_miles`; apesar do nome original, essa coluna já chega convertida e não recebe um novo fator de conversão.

## Fontes de dados

Os dados são lidos de CSVs públicos do Google Sheets e processados com PapaParse.

### Ranking

Cabeçalhos esperados:

```text
NOME
SEMANA 1 ... SEMANA 7
DESAFIO 1 ... DESAFIO 5
DESAFIO RELÂMPAGO
GINCANA
PTS EXTRAS
CHECKIN
DATA
```

### Dataset

Cabeçalho usado para o KPI de distância:

```text
distance_miles
```

Valores vazios ou inválidos são ignorados. Uma falha nessa fonte mantém o KPI como `-` sem impedir o carregamento do restante do dashboard.

### Feed

Cabeçalhos usados:

```text
thumbnail_url
batch_id
imported_at
```

O frontend também aceita `url` como fallback. Os lotes importados entre sábado e sexta-feira são reunidos, os mais novos aparecem primeiro e o carrossel fica limitado a 24 URLs únicas. Ao virar a semana, as fotos anteriores continuam visíveis até chegar a primeira importação da semana nova. Para dados antigos sem `imported_at`, permanece o fallback de exibir somente o lote mais recente.

## Automação do feed

O export do Gym Rats é armazenado como ZIP no Google Drive. A automação em [`automation/google-apps-script`](automation/google-apps-script) executa o seguinte fluxo:

```text
ZIP mais recente no Drive
        ↓
check_in_media.csv
        ↓
thumbnail_url ou url
        ↓
URLs inéditas + batch_id na aba do feed
        ↓
Carrossel reúne os lotes da semana e mostra até 24 fotos
```

O script:

- procura o ZIP mais recente na pasta configurada e em suas subpastas;
- reconhece ZIP pela extensão ou pelo MIME type do Drive;
- utiliza `thumbnail_url` e recorre a `url` quando necessário;
- mantém histórico sem duplicar URLs;
- identifica cada importação com fotos novas por `batch_id`;
- usa `imported_at` para agrupar os lotes na semana de sábado a sexta;
- registra o ZIP já processado e executa de hora em hora.

Consulte as [instruções de instalação do Apps Script](automation/google-apps-script/README.md). A aba do feed pode permanecer oculta no Google Sheets, mas não deve ser excluída nem removida da publicação.

## Stack

| Tecnologia | Uso |
|---|---|
| React 18 | Interface e estado |
| Vite 5 | Desenvolvimento e build |
| Tailwind CSS 3 | Estilos e responsividade |
| PapaParse | Leitura dos CSVs |
| Lucide React | Ícones |
| Google Apps Script | Importação incremental do feed |

## Estrutura principal

```text
src/
├── App.jsx
├── config.js
├── components/
│   ├── OverviewPanel.jsx
│   ├── IndividualPanel.jsx
│   ├── InsightsPanel.jsx
│   ├── MemberTooltip.jsx
│   ├── MediaFeed.jsx
│   ├── MediaItem.jsx
│   └── ChallengeCountdown.jsx
├── hooks/
│   ├── useGoogleSheetsData.js
│   └── useCountdown.js
└── lib/
    ├── csv.js
    └── ranking.js

automation/google-apps-script/
├── Code.gs
├── appsscript.json
└── README.md
```

## Configuração

As URLs públicas já possuem valores padrão em [`src/config.js`](src/config.js). Elas podem ser substituídas por variáveis de ambiente:

```env
VITE_RANKING_CSV_URL=https://docs.google.com/spreadsheets/.../pub?output=csv
VITE_FEED_CSV_URL=https://docs.google.com/spreadsheets/.../pub?gid=...&single=true&output=csv
VITE_DATASET_CSV_URL=https://docs.google.com/spreadsheets/.../pub?gid=...&single=true&output=csv
VITE_REFRESH_INTERVAL_MS=120000
```

Use [`.env.example`](.env.example) como referência. A planilha precisa estar publicada para leitura anônima; apenas compartilhar o link de edição não é suficiente.

## Desenvolvimento

```bash
npm install
npm run dev
npm run build
npm run preview
```

O servidor de desenvolvimento fica disponível em `http://localhost:5173`.

## Licença

Projeto interno da TD Business.
