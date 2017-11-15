// @flow
'use strict';

const S3 = require('aws-sdk/clients/s3');
const s3 = new S3({apiVersion: '2006-03-01'});
const util = require('util');
const fs = require('fs');
const exec = require('child_process').execSync;
const glob = require('glob');
const path = require('path');

const utilUntyped /*: any*/ = util;
const promisify /*: (Function) => Function */ = utilUntyped.promisify;

const readFile = promisify(fs.readFile);
const lstat = promisify(fs.lstat);


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


async function s3Upload(filepath, contentType) {
  if (process.env.DRYRUN != null) {
    console.log(`filepath:${filepath} contentType:${contentType}`);
  } else {
    const params = {
      Bucket: 'jamesfriend.com.au',
      Body: await readFile(path.resolve(filepath)),
      Key: filepath,
      ContentType: contentType,
    };
    console.log('s3Upload', params.Key, contentType);
    await new Promise((resolve, reject) => {
      s3.putObject(params, (err, data) => {
        if (err) {
          console.error('failed', params);
          reject(err);
        } else resolve(data);
      });
    });
  }
}

const exists = promisify(fs.exists);

const allowedExtensions = {
  '': 'text/html',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.img': 'application/vnd.ms-fontobject',
  '.rom': 'application/vnd.ms-fontobject',
};

async function s3Sync(filepath) {
  if ((await exists(filepath)) && !(await lstat(filepath)).isDirectory()) {
    const filename = path.basename(filepath);
    const extension = path.extname(filename);
    if (extension in allowedExtensions) {
      const mimetype = getMimeType(filepath);
      await s3Upload(filepath, mimetype);
    }
  }
}

async function main() {
  process.chdir('build');
  await Promise.all(
    []
      .concat(
        glob.sync('*'),
        glob.sync('files/*'),
        // glob.sync('assets/*'),
        // glob.sync('projects/**/*')
        glob.sync('projects/github-reason-react-tutorial/*')
        // glob.sync('projects/basiliskii/*'),
        // glob.sync('projects/basiliskii/BasiliskII-worker.html'),
      )
      .map(s3Sync)
  );
}

main().catch(err => console.error(err));
