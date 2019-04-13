// @flow
'use strict';

const S3 = require('aws-sdk/clients/s3');
const s3 = new S3({apiVersion: '2006-03-01'});
const util = require('util');
const fs = require('fs');
const exec = require('child_process').execSync;
const glob = require('glob');
const path = require('path');
const crypto = require('crypto');
const cloudflare = require('cloudflare');

const utilUntyped /*: any*/ = util;
const promisify /*: <Args, Ret>(Function) => (...Args) => Promise<Ret> */ =
  utilUntyped.promisify;

const readFile /*: (string,?Object) => Promise<any> */ = promisify(fs.readFile);
const lstat /*: (string) => Promise<Object> */ = promisify(fs.lstat);
const putObject /*: (Object) => Promise<Object> */ = promisify(
  s3.putObject.bind(s3)
);
const copyObject /*: (Object) => Promise<Object> */ = promisify(
  s3.copyObject.bind(s3)
);
const headObject /*: (Object) => Promise<Object> */ = promisify(
  s3.headObject.bind(s3)
);
const exists /*: (string) => Promise<boolean> */ = promisify(fs.exists);

const cfCredentials = JSON.parse(
  fs.readFileSync(`${process.env.HOME || '~'}/.cfapi`, {encoding: 'utf8'})
);
const cf = cloudflare(cfCredentials);

const uploadConfig = require('./uploadConfig');

const maxAgeSecondsForever = 365 * 24 * 60 * 60;
const maxAgeSecondsEphemeral = 4 * 60 * 60;

const allowedExtensions = new Set([
  '',
  '.html',
  '.css',
  '.js',
  '.mem',
  '.wasm',
  '.png',
  '.gif',
  '.jpg',
  '.jpeg',
  ...uploadConfig.allowedExtensions,
]);

function md5(content) {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

const filesMimeTypesCache = {};
function getMimeType(filepath) {
  if (!filesMimeTypesCache[filepath]) {
    switch (path.extname(filepath)) {
      case '.css':
        filesMimeTypesCache[filepath] = 'text/css';
        break;
      case '.js':
        filesMimeTypesCache[filepath] = 'application/javascript';
        break;
      case '.map':
        filesMimeTypesCache[filepath] = 'application/octet-stream';
        break;
      case '.wasm':
        filesMimeTypesCache[filepath] = 'application/wasm';
        break;
      case '.img':
      case '.data':
      case '.rom':
      case '.mem':
        // make cloudflare compress this binary file
        filesMimeTypesCache[filepath] = 'application/vnd.ms-fontobject';
        break;
      default:
        filesMimeTypesCache[filepath] = exec(
          `file --mime-type --brief ${filepath}`
        )
          .toString()
          .trim();
    }
  }
  return filesMimeTypesCache[filepath];
}

async function cfPurge(filepath) {
  await cf.zones.purgeCache(uploadConfig.cfZone, {
    files: [`${uploadConfig.uribase}${filepath}`],
  });
}

function toCopyParams(uploadParams) {
  const params = {
    ...uploadParams,
    CopySource: `/${uploadParams.Bucket}/${uploadParams.Key}`,
    MetadataDirective: 'REPLACE',
  };

  delete params.Body;
  return params;
}

async function s3Upload(filepath, contentType) {
  let newFile = false;
  const content = await readFile(path.resolve(filepath));

  let contentUnchanged = false;

  try {
    const head = await headObject({
      Bucket: uploadConfig.s3Bucket,
      Key: filepath,
    });

    if (head.ETag.replace(/"/g, '') === md5(content)) {
      contentUnchanged = true;
    }
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.code === 'NotFound') {
      newFile = true;
    } else {
      throw err;
    }
  }

  let replaceMetadata = uploadConfig.replaceMetadata;

  if (contentUnchanged && !replaceMetadata) {
    // file exists in S3 and is unchanged
    console.log('s3Upload unchanged', filepath);
    return false;
  }

  const metadataOnlyUpdate = contentUnchanged && replaceMetadata;
  const maxAge =
    contentType === 'text/html' ? maxAgeSecondsEphemeral : maxAgeSecondsForever;

  const uploadParams = {
    Bucket: uploadConfig.s3Bucket,
    Body: content,
    Key: filepath,
    ContentType: contentType,
  };
  console.log(
    's3Upload',
    (newFile ? 'new' : metadataOnlyUpdate ? 'metadata' : 'updated').padEnd(9),
    uploadParams.Key,
    uploadParams.ContentType
  );
  if (process.env.DRYRUN != null) {
    // bail out before upload, and signal that no cache purge is needed either
    return false;
  }
  try {
    if (metadataOnlyUpdate) {
      await copyObject(toCopyParams(uploadParams));
    } else {
      await putObject(uploadParams);
    }
    return true;
  } catch (err) {
    console.error('failed', err, uploadParams);
    return false;
  }
}

async function s3Sync(filepath) {
  try {
    if ((await exists(filepath)) && !(await lstat(filepath)).isDirectory()) {
      const filename = path.basename(filepath);
      const extension = path.extname(filename);
      if (allowedExtensions.has(extension)) {
        const mimetype = getMimeType(filepath);
        const updated = await s3Upload(filepath, mimetype);

        if (updated) {
          await cfPurge(filepath);
          if (filepath.endsWith('index.html')) {
            await cfPurge(filepath.replace(/index\.html$/, ''));
          }
        }
      }
    }
  } catch (err) {
    console.error('error for file', filepath, err);
  }
}

async function main() {
  const excludedPathsPattern = uploadConfig.excludedPaths.length
    ? new RegExp(`(?:${uploadConfig.excludedPaths.join('|')})`)
    : null;

  process.chdir('build');

  const manifest /*: {host: string} */ = JSON.parse(
    await readFile('./manifest.json', {encoding: 'utf8'})
  );

  if (!manifest.host.includes(uploadConfig.s3Bucket)) {
    throw new Error(
      `This is probably not a build for prod, as manifest.host=${manifest.host}`
    );
  }

  await Promise.all(
    []
      .concat(...uploadConfig.paths.map(p => glob.sync(p)))
      .filter(
        filepath =>
          !(excludedPathsPattern && filepath.match(excludedPathsPattern))
      )
      .map(s3Sync)
  );
}

main().catch(err => console.error(err));
