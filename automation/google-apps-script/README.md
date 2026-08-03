# Sincronização automática do feed

Esta automação procura o ZIP mais recentemente atualizado na pasta do Drive do projeto ou em suas subpastas, extrai `check_in_media.csv` e adiciona somente URLs inéditas à aba pública usada pelo carrossel. O arquivo é reconhecido tanto pela extensão `.zip` quanto pelo MIME type informado pelo Drive.

Cada importação com fotos novas recebe um `batch_id`. O dashboard exibe somente as fotos do lote mais recente; as URLs antigas permanecem na aba como histórico e não são exibidas novamente.

## Configuração usada

- Pasta do Drive: `1OOkdotxiwf_j00SGuG0ynhxCRqHQW32o`
- Planilha: `1wQ9ZJFRSN4LObgyWpxXQX3hNP-5thKoGCJDWenuBxMM`
- Aba do feed: `gid=1605139045`
- Intervalo: 1 hora

O CSV do export possui `url` em todos os registros, enquanto `thumbnail_url` pode estar vazio. O script usa `thumbnail_url` quando disponível e utiliza `url` como fallback.

## Ativação

1. Acesse [script.google.com](https://script.google.com/) com uma conta que tenha acesso à pasta e à planilha.
2. Crie um projeto e copie `Code.gs` para o editor.
3. Em **Configurações do projeto**, habilite a exibição do manifesto e substitua-o por `appsscript.json`.
4. Execute `createMediaSyncTrigger` uma vez e autorize o acesso solicitado.
5. Confira a execução inicial e a aba do feed. As próximas verificações acontecerão automaticamente.

O script guarda o ID e a versão do último ZIP processado. Um ZIP novo é importado de forma incremental, sem apagar URLs anteriores e sem inserir duplicatas. O dashboard não precisa mudar: ele já consulta essa aba a cada dois minutos.
