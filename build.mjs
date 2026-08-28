import {cp, mkdir, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const dist = join(root, 'dist');
await rm(dist, {recursive: true, force: true});
await mkdir(dist, {recursive: true});

for (const file of ['index.html', 'figma-import.html', 'manifest.webmanifest', 'sw.js', 'apple-touch-icon.png']) {
  await cp(join(root, file), join(dist, file));
}

await cp(join(root, 'src'), join(dist, 'src'), {recursive: true});
await writeFile(join(dist, '.nojekyll'), '');
console.log('Built static web app into dist/');
