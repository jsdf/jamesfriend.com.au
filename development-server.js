// @flow

'use strict';

const spawn = require('child_process').spawn;
const exec = require('child_process').execSync;
const http = require('http');
const util = require('util');
const path = require('path');
const fs = require('fs');

const sane = require('sane');
const lodash = require('lodash');

const port = 8081;
const host = `http://127.0.0.1:${port}`;
function build(skipRsync) {
  console.time('build done');
  exec(`node build.js ${skipRsync ? '--skip-rsync' : ''}`, {
    env: Object.assign({HOST: host}, process.env),
  });
  console.timeEnd('build done');
}

const buildDebounced = lodash.debounce(() => {
  console.log('changes detected, rebuilding');
  build(true);
}, 50);

const watcher = sane('./', {
  glob: [
    'html/**/*.js',
    'html/**/*.css',
    'html/**/*.html',
    '*.mustache',
    'partials.js',
    'posts.json',
    'posts/*.md',
  ],
});
watcher.on('ready', function() {
  console.log('watching for changes');
});
watcher.on('change', buildDebounced);
watcher.on('add', buildDebounced);
watcher.on('delete', buildDebounced);

const serveDir = path.join(__dirname, 'build');

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

const server = http.createServer(function(req, res) {
  try {
    const serverpath = req.url[req.url.length - 1] == '/'
      ? req.url + 'index.html'
      : req.url;
    const filepath = path.join(serveDir, serverpath);
    const mimeType = getMimeType(filepath);
    console.log(`200 ${req.url} ${mimeType}`);
    res.writeHead(200, {'Content-Type': mimeType});
    res.write(fs.readFileSync(filepath));
    res.end();
  } catch (err) {
    console.log(`404 ${req.url} ${err}`);
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write(err.stack);
    res.end();
  }
});
server.listen(port);

build();

setTimeout(() => {
  console.log(
    `
opening http://127.0.0.1:${port}/ in your browser

press CTRL-C to quit this program
`
  );
  exec(`open http://127.0.0.1:${port}/`);
}, 300);
