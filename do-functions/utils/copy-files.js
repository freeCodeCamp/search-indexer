// import { copyFileSync, readdirSync } from 'fs';
import { copyFileSync } from 'fs';
import { basename, join } from 'path';
const __dirname = import.meta.dirname;

// const hashnodeFunctionDirectoryNames = readdirSync(
//   join(__dirname, '../packages/hashnode')
// ).filter((directoryName) => !/(^|\/)\.[^\/\.]/g.test(directoryName));

const platforms = ['hashnode'];
const functionDirectoyNames = ['add-index'];
const targetFilePaths = [
  join(__dirname, './helpers.js'),
  join(__dirname, '../package.json'),
  join(__dirname, '../../.env')
];

platforms.forEach((platform) => {
  functionDirectoyNames.forEach((functionName) => {
    targetFilePaths.forEach((targetPath) => {
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
