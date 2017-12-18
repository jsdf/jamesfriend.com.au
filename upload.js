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
  fs.readFileSync(`${process.env.HOME}/.cfapi`, {encoding: 'utf8'})
);
const cf = cloudflare(cfCredentials);

const s3Bucket = 'jamesfriend.com.au';
const uribase = 'https://jamesfriend.com.au/';

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
  await cf.zones.purgeCache('4cbdffb3471921b6561420416bf05b61', {
    files: [`${uribase}${filepath}`],
  });
}

async function s3Upload(filepath, contentType) {
  if (process.env.DRYRUN != null) {
    console.log(`filepath:${filepath} contentType:${contentType}`);
  } else {
    let newFile = false;
    const content = await readFile(path.resolve(filepath));

    const uploadParams = {
      Bucket: s3Bucket,
      Body: content,
      Key: filepath,
      ContentType: contentType,
    };
    try {
      const head = await headObject({
        Bucket: s3Bucket,
        Key: filepath,
      });

      if (head.ETag.replace(/"/g, '') === md5(content)) {
        // file exists in S3 and is unchanged
        console.log('s3Upload unchanged', filepath);
        return false;
      }
    } catch (err) {
      if (err.code === 'NoSuchKey') {
        newFile = true;
      } else {
        throw err;
      }
    }
    try {
      console.log(
        's3Upload',
        newFile ? 'new      ' : 'updated  ',
        uploadParams.Key,
        uploadParams.ContentType
      );
      await putObject(uploadParams);
      return !newFile;
    } catch (err) {
      console.error('failed', err, uploadParams);
      return false;
    }
  }
}

const allowedExtensions = {
  '': 'text/html',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.img': 'application/vnd.ms-fontobject',
  '.rom': 'application/vnd.ms-fontobject',
};

async function s3Sync(filepath) {
  if ((await exists(filepath)) && !(await lstat(filepath)).isDirectory()) {
    const filename = path.basename(filepath);
    const extension = path.extname(filename);
    if (extension in allowedExtensions) {
      const mimetype = getMimeType(filepath);
      return await s3Upload(filepath, mimetype);
    }
  }
  return false;
}

async function main() {
  process.chdir('build');
  const syncResult = await Promise.all(
    []
      .concat(
        glob.sync('*'),
        glob.sync('files/*'),
        // glob.sync('assets/*'),
        // glob.sync('projects/**/*')
        glob.sync('projects/github-reason-react-tutorial/*')
        // glob.sync('projects/basiliskii/*'),
        // glob.sync('projects/basiliskii/BasiliskII-worker.html'),
        // glob.sync('pce-js/**/*')
      )
      .map(async filepath => {
        const updated = await s3Sync(filepath);

        if (updated) {
          await cfPurge(filepath);
        }
      })
  );
}

main().catch(err => console.error(err));
