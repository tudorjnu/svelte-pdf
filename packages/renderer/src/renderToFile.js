import fs from 'fs';

import { renderToStream } from './renderToStream.js';

export const renderToFile = async (Component, props, filePath, callback) => {
  const output = await renderToStream(Component, props);
  const stream = fs.createWriteStream(filePath);

  output.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      if (callback) callback(output, filePath);
      resolve(output);
    });
    stream.on('error', reject);
  });
};

export default renderToFile;
