import fs from 'fs';
import path from 'path';
import { processFileIs } from '../src';

const pathOfCodeForPreprocess = path.resolve(path.join(__dirname, '..', 'code-for-preprocess'));
const pathOfCodeAfterPreprocess = path.resolve(path.join(__dirname, '..', '..', 'preprocessed-code'));
if (!fs.existsSync(pathOfCodeAfterPreprocess)) fs.mkdirSync(pathOfCodeAfterPreprocess, { mode: 0o775 });

const pathOfIs = path.join(pathOfCodeForPreprocess, 'is.js');
const processedIs = processFileIs(fs.readFileSync(pathOfIs, 'utf-8'));
fs.writeFileSync(path.join(pathOfCodeAfterPreprocess, 'is.js'), processedIs);
