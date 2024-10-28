import { copyFileSync, existsSync } from 'fs';
import { basename, join } from 'path';
const __dirname = import.meta.dirname;

const platforms = ['hashnode'];
const functionDirectoyNames = ['add-index'];
const targetFilePaths = [
  join(__dirname, './helpers.js'),
  join(__dirname, '../package.json'),
  join(__dirname, '../../.env') // TODO: remove this once we decide how to handle env vars on DO's platform
];

platforms.forEach((platform) => {
  functionDirectoyNames.forEach((functionName) => {
    targetFilePaths.forEach((targetPath) => {
      if (!existsSync(targetPath)) {
        // TODO: Consider throwing an error here instead of logging a warning once we
        // have a way to handle env vars on DO's platform
        console.warn(`
----------------------------------------------------
Warning: File not found
----------------------------------------------------
The file following file was not found:
${targetPath}

Please make sure the file exists and try again.
----------------------------------------------------
`);
        return;
      }

      copyFileSync(
        targetPath,
        join(
          __dirname,
          `../packages/${platform}/${functionName}/${basename(targetPath)}`
        )
      );
    });
  });
});
