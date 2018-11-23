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
  const res = exec(`node build.js ${skipRsync ? '--skip-rsync' : ''}`, {
    env: Object.assign({HOST: host}, process.env),
  });
  console.log(res.toString());
  console.timeEnd('build done');
}

const buildDebounced = lodash.debounce(() => {
  console.log('changes detected, rebuilding');
  build(false);
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
  const reqPath = req.url.replace(/\?.*/, '').replace(/_cb.*/, '');
  const reqPathFSPath = path.join(serveDir, reqPath);

  function errRes(err, code) {
    console.log(`${code} ${req.url} ${err}`);
    res.writeHead(code, {'Content-Type': 'text/plain'});
    res.write(err.stack);
    res.end();
  }

  // does the request point to a valid file or dir at all?
  let reqPathStat = null;
  try {
    reqPathStat = fs.lstatSync(reqPathFSPath);
  } catch (reqPathStatErr) {
    // nothing there
    return errRes(reqPathStatErr, 404);
  }

  try {
    // return file or index file contents
    const mightHaveIndexFile = reqPath[reqPath.length - 1] == '/';
    const filepath =
      reqPathStat.isDirectory() && mightHaveIndexFile
        ? path.join(reqPathFSPath, 'index.html')
        : reqPathFSPath;
    const mimeType = getMimeType(filepath);
    console.log(`200 ${req.url} ${mimeType}`);
    res.writeHead(200, {'Content-Type': mimeType});
    res.write(fs.readFileSync(filepath));
    res.end();
  } catch (fileReadErr) {
    if (reqPathStat.isDirectory()) {
      // render directory listing
      try {
        const filepath = path.join(serveDir, reqPath);
        const dirlinks = ['..', ...fs.readdirSync(filepath)]
          .map(file => {
            const fileStat = fs.lstatSync(path.join(reqPathFSPath, file));
            const filename = fileStat.isDirectory() ? `${file}/` : file;

            return `<li><a href="${path.join(
              reqPath,
              filename
            )}">${filename}</a></li>`;
          })
          .join('\n');
        console.log(`200 ${req.url} [dir listing] 'text/html'`);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(`<!DOCTYPE html>
  <html>
  <head>
    <title>Directory listing of ${reqPath}</title>
  </head>
  <body>
  <h1>Directory listing of ${reqPath}</h1>
  <ul>${dirlinks}</ul>
  </body>
  </html>`);
        res.end();
        return;
      } catch (dirlistErr) {
        // directory listing failed somehow
        return errRes(dirlistErr, 500);
      }
    } else {
      // there was a file or dir but we couldn't read it
      return errRes(fileReadErr, 500);
    }
  }
});
server.listen(port);

build(false);

setTimeout(() => {
  console.log(
    `
opening http://127.0.0.1:${port}/ in your browser

press CTRL-C to quit this program
`
  );
  exec(`open http://127.0.0.1:${port}/`);
}, 300);
