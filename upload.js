// @flow
'use strict';

const S3 = require('aws-sdk/clients/s3');
const s3 = new S3({apiVersion: '2006-03-01'});
const util = require('util');
const fs = require('fs');
const childProcess = require('child_process');
const glob = require('glob');
const path = require('path');

const utilUntyped /*: any*/ = util;
const promisify /*: (Function) => Function */ = utilUntyped.promisify;

const readFile = promisify(fs.readFile);
const lstat = promisify(fs.lstat);

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
    console.log('s3Upload', params.Key);
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

const mimeTypes = {
  '': 'text/html',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
};

async function s3Sync(filepath) {
  if ((await exists(filepath)) && !(await lstat(filepath)).isDirectory()) {
    const filename = path.basename(filepath);
    const extension = path.extname(filename);
    const contentType = mimeTypes[extension];
    if (contentType) {
      await s3Upload(filepath, contentType);
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
        glob.sync('assets/*'),
        glob.sync('projects/**/*')
      )
      .map(s3Sync)
  );
}

main().catch(err => console.error(err));
