/* eslint-disable no-console */

import fs from 'node:fs';
import axios from 'axios';

import {
  ISO_4217_CURRENCY_LIST_URL,
  ISO_4217_XML_FILE_PATH,
} from './constants';

async function download(url: string, fileName: string) {
  const writer = fs.createWriteStream(fileName);

  const response = await axios({
    method: 'GET',
    responseType: 'stream',
    url,
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function downloadIso() {
  try {
    await download(ISO_4217_CURRENCY_LIST_URL, ISO_4217_XML_FILE_PATH);

    console.log(`Downloaded ISO 4217 XML file to ${ISO_4217_XML_FILE_PATH}`);
  } catch (e) {
    console.error(`Error downloading ISO 4217 XML file: ${e}`);
    process.exit(1);
  }
}

downloadIso();
