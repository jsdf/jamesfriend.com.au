// @flow
'use strict';

// non-secret config used by upload.js
module.exports = {
  s3Bucket: 'jamesfriend.com.au',
  uribase: 'https://jamesfriend.com.au/',
  cfZone: '4cbdffb3471921b6561420416bf05b61',
  paths: ['**/*'],
  excludedPaths: [],
  allowedExtensions: [
    '.img',
    '.rom',
    '.dat',
    '.qed',
    '.dsk',
    '.cfg',
    '.data',
    '.wav',
    '.m4a',
    '.map',
  ],
  // when true, will rewrite metadata even for unchanged files
  // useful for updating headers such as content-type and cache-control
  replaceMetadata: false,
};
