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

const readFile = utilUntyped.promisify(fs.readFile);
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

const exists = utilUntyped.promisify(fs.exists);

async function s3Sync(filepath) {
  if (await exists(filepath)) {
    const filename = path.basename(filepath);
    const extension = path.extname(filename);
    switch (extension) {
      case '':
        await s3Upload(filepath, 'text/html');
        break;
      case '.html':
        await s3Upload(filepath, 'text/html');
        break;
      case '.css':
        await s3Upload(filepath, 'text/css');
        break;
      case '.js':
        await s3Upload(filepath, 'application/javascript');
        break;
      case '.png':
        await s3Upload(filepath, 'image/png');
        break;
      case '.gif':
        await s3Upload(filepath, 'image/gif');
        break;
      case '.jpg':
        await s3Upload(filepath, 'image/jpeg');
        break;
    }
  }
}

async function main() {
  process.chdir('build');
  await Promise.all(glob.sync('*').map(s3Sync));
  await Promise.all(glob.sync('files/*').map(s3Sync));
  await Promise.all(glob.sync('assets/*').map(s3Sync));
  await Promise.all(glob.sync('projects/**/*').map(s3Sync));
}

main().catch(err => console.error(err));
