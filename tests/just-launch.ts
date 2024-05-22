import fs from 'fs';
import path from 'path';
import { processFileIs, processCalls } from '../src';

const pathOfCodeForPreprocess = path.resolve(path.join(__dirname, '..', 'code-for-preprocess'));
const pathOfCodeAfterPreprocess = path.resolve(path.join(__dirname, '..', '..', 'preprocessed-code'));
if (!fs.existsSync(pathOfCodeAfterPreprocess)) fs.mkdirSync(pathOfCodeAfterPreprocess, { mode: 0o775 });

const showErr = <Func extends () => void>(err: NodeJS.ErrnoException | null, callback?: Func) => {
  if (err) console.error(err);
  else if (callback) callback();
};

const forRun = [
  [processFileIs, ['is', 'is-with-regular-callback']],
  [processCalls, ['calls', 'file-not-contains-is-or-replacing-func']],
] as const;
forRun.forEach(([func, files]) => {
  files.forEach(file => {
    const pathOfFile = path.join(pathOfCodeForPreprocess, `${file}.js`);
    fs.readFile(pathOfFile, 'utf-8', (err, content) => {
      showErr(err, () => {
        fs.writeFile(path.join(pathOfCodeAfterPreprocess, `${file}.js`), func(content), (err) => {
          showErr(err);
        });
      });
    });
  });
});
