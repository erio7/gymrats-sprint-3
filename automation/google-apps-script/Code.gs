const MEDIA_SYNC_CONFIG = Object.freeze({
  driveFolderId: '1OOkdotxiwf_j00SGuG0ynhxCRqHQW32o',
  spreadsheetId: '1wQ9ZJFRSN4LObgyWpxXQX3hNP-5thKoGCJDWenuBxMM',
  feedSheetGid: 1605139045,
  mediaCsvName: 'check_in_media.csv',
  feedHeader: 'thumbnail_url',
  lastZipVersionProperty: 'GYMRATS_LAST_MEDIA_ZIP_VERSION',
});

/**
 * Importa URLs inéditas do check_in_media.csv contido no ZIP mais recente.
 * Pode ser executada manualmente ou por um gatilho de tempo.
 */
function syncLatestCheckInMedia() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { status: 'busy', added: 0 };
  }

  try {
    const latestZip = findLatestZip_();
    if (!latestZip) throw new Error('Nenhum arquivo ZIP foi encontrado na pasta configurada.');

    const zipVersion = `${latestZip.getId()}:${latestZip.getLastUpdated().getTime()}`;
    const properties = PropertiesService.getScriptProperties();
    if (properties.getProperty(MEDIA_SYNC_CONFIG.lastZipVersionProperty) === zipVersion) {
      return { status: 'unchanged', file: latestZip.getName(), added: 0 };
    }

    const mediaBlob = Utilities.unzip(latestZip.getBlob()).find(blob => {
      const fileName = blob.getName().split('/').pop().toLowerCase();
      return fileName === MEDIA_SYNC_CONFIG.mediaCsvName;
    });
    if (!mediaBlob) {
      throw new Error(`${MEDIA_SYNC_CONFIG.mediaCsvName} não foi encontrado em ${latestZip.getName()}.`);
    }

    const mediaUrls = readMediaUrls_(mediaBlob);
    const sheet = getFeedSheet_();
    const added = appendNewUrls_(sheet, mediaUrls);

    properties.setProperties({
      [MEDIA_SYNC_CONFIG.lastZipVersionProperty]: zipVersion,
      GYMRATS_LAST_MEDIA_ZIP_NAME: latestZip.getName(),
      GYMRATS_LAST_MEDIA_SYNC_AT: new Date().toISOString(),
    });

    const result = { status: 'synced', file: latestZip.getName(), found: mediaUrls.length, added };
    console.log(JSON.stringify(result));
    return result;
  } finally {
    lock.releaseLock();
  }
}

/** Cria um único gatilho que verifica a pasta uma vez por hora. */
function createMediaSyncTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'syncLatestCheckInMedia')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('syncLatestCheckInMedia')
    .timeBased()
    .everyHours(1)
    .create();

  return syncLatestCheckInMedia();
}

function findLatestZip_() {
  const files = DriveApp.getFolderById(MEDIA_SYNC_CONFIG.driveFolderId).getFiles();
  let latest = null;

  while (files.hasNext()) {
    const file = files.next();
    if (!file.getName().toLowerCase().endsWith('.zip')) continue;
    if (!latest || file.getLastUpdated().getTime() > latest.getLastUpdated().getTime()) {
      latest = file;
    }
  }

  return latest;
}

function readMediaUrls_(mediaBlob) {
  const csv = mediaBlob.getDataAsString('UTF-8').replace(/^\uFEFF/, '');
  const rows = Utilities.parseCsv(csv);
  if (rows.length < 2) return [];

  const headers = rows[0].map(header => header.trim().toLowerCase());
  const urlIndex = headers.indexOf('url');
  const thumbnailIndex = headers.indexOf('thumbnail_url');
  if (urlIndex < 0 && thumbnailIndex < 0) {
    throw new Error('O CSV não possui as colunas url ou thumbnail_url.');
  }

  const uniqueUrls = new Set();
  rows.slice(1).forEach(row => {
    const thumbnail = thumbnailIndex >= 0 ? String(row[thumbnailIndex] || '').trim() : '';
    const original = urlIndex >= 0 ? String(row[urlIndex] || '').trim() : '';
    const resolvedUrl = thumbnail || original;
    if (/^https?:\/\//i.test(resolvedUrl)) uniqueUrls.add(resolvedUrl);
  });

  return [...uniqueUrls];
}

function getFeedSheet_() {
  const spreadsheet = SpreadsheetApp.openById(MEDIA_SYNC_CONFIG.spreadsheetId);
  const sheet = spreadsheet.getSheets().find(item => item.getSheetId() === MEDIA_SYNC_CONFIG.feedSheetGid);
  if (!sheet) throw new Error(`A aba gid=${MEDIA_SYNC_CONFIG.feedSheetGid} não foi encontrada.`);
  return sheet;
}

function appendNewUrls_(sheet, mediaUrls) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1).setValue(MEDIA_SYNC_CONFIG.feedHeader);
  }

  const currentHeader = String(sheet.getRange(1, 1).getValue()).trim();
  if (currentHeader !== MEDIA_SYNC_CONFIG.feedHeader) {
    throw new Error(`Cabeçalho esperado: ${MEDIA_SYNC_CONFIG.feedHeader}. Encontrado: ${currentHeader}.`);
  }

  const existingValues = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().flat()
    : [];
  const knownUrls = new Set(existingValues.map(value => value.trim()).filter(Boolean));
  const newUrls = mediaUrls.filter(url => !knownUrls.has(url));

  if (newUrls.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newUrls.length, 1)
      .setValues(newUrls.map(url => [url]));
  }

  return newUrls.length;
}
