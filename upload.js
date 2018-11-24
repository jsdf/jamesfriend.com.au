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
const promisify /*: (Function) => Function */ = utilUntyped.promisify;

const readFile = promisify(fs.readFile);
const lstat = promisify(fs.lstat);
const putObject = promisify(s3.putObject.bind(s3));
const headObject = promisify(s3.headObject.bind(s3));
const exists = promisify(fs.exists);

const cfCredentials = JSON.parse(
  fs.readFileSync(`${process.env.HOME || '~'}/.cfapi`, {encoding: 'utf8'})
);
const cf = cloudflare(cfCredentials);

const uploadConfig = require('./uploadConfig');

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
      case '.wasm':
        filesMimeTypesCache[filepath] = 'application/wasm';
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

async function s3Upload(filepath, contentType) {
  let newFile = false;
  const content = await readFile(path.resolve(filepath));

  try {
    const head = await headObject({
      Bucket: uploadConfig.s3Bucket,
      Key: filepath,
    });

    if (head.ETag.replace(/"/g, '') === md5(content)) {
      // file exists in S3 and is unchanged
      console.log('s3Upload unchanged', filepath);
      return false;
    }
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.code === 'NotFound') {
      newFile = true;
    } else {
      throw err;
    }
  }

  const uploadParams = {
    Bucket: uploadConfig.s3Bucket,
    Body: content,
    Key: filepath,
    ContentType: contentType,
  };
  console.log(
    's3Upload',
    newFile ? 'new      ' : 'updated  ',
    uploadParams.Key,
    uploadParams.ContentType
  );
  if (process.env.DRYRUN != null) {
    // bail out before upload, and signal that no cache purge is needed either
    return false;
  }
  try {
    await putObject(uploadParams);
    return !newFile;
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
