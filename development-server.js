// @flow

'use strict';

const spawn = require('child_process').spawn;
const exec = require('child_process').execSync;
const util = require('util');
const path = require('path');
const fs = require('fs');
const useHTTPS = true;

const sane = require('sane');
const lodash = require('lodash');

const runBuild = require('./build');

const port = 8081;
const host = `${useHTTPS ? 'https' : 'http'}://localhost:${port}`;
const DEV = process.env.NODE_ENV != 'production';
const useCache = false;

Error.stackTraceLimit = Infinity;

let currentBuild = Promise.resolve();

let buildCache = null;
if (useCache) {
  buildCache = {caches: []};
}
async function rebuild({skipRsync}) {
  console.time('build done');

  await runBuild(
    Object.assign({}, process.env, {DEV, HOST: host, skipRsync, buildCache})
  );
  console.timeEnd('build done');
}

const buildDebounced = lodash.debounce(async () => {
  console.log('changes detected');
  await currentBuild;
  console.log('rebuilding');
  currentBuild = rebuild({skipRsync: true});
}, 50);

const watcher = sane('./', {
  glob: [
    'html/**/*.js',
    'html/**/*.css',
    'html/**/*.html',
    'templates/*.mustache',
    'partials.js',
    'posts.json',
    'posts/*.md',
    'components/*.js',
    'client/**/*.*',
    'client/*.*',
  ],
  watchman: true,
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

async function handler(req, res) {
  const reqPath = req.url.replace(/\?.*/, '').replace(/_cb.*/, '');
  const reqPathFSPath = path.join(serveDir, reqPath);

  function errRes(err, code) {
    console.log(`${code} ${req.url} ${err}`);
    res.writeHead(code, {'Content-Type': 'text/plain'});
    res.write(err.stack || String(err));
    res.end();
  }

  try {
    // don't send response until build is complete
    await currentBuild;
  } catch (err) {
    return errRes(err, 503);
  }

  // does the request point to a valid file or dir at all?
  let reqPathStat = null;
  try {
    reqPathStat = fs.lstatSync(reqPathFSPath);
  } catch (reqPathStatErr) {
    // nothing there
    return errRes(reqPathStatErr, 404);
  }

  function successRes(content, mimeType) {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.writeHead(200, {'Content-Type': mimeType});
    res.write(content);
    res.end();
  }

  try {
    // return file or index file contents
    const filepath = reqPathStat.isDirectory()
      ? path.join(reqPathFSPath, 'index.html')
      : reqPathFSPath;
    const mimeType = getMimeType(filepath);
    successRes(fs.readFileSync(filepath), mimeType);
  } catch (fileReadErr) {
    if (reqPathStat.isDirectory()) {
      // render directory listing
      try {
        const filepath = path.join(serveDir, reqPath);
        const dirlinks = ['..', ...fs.readdirSync(filepath)]
          .map((file) => {
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
  ${reqPathFSPath}
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
}

let server;
if (useHTTPS) {
  const https = require('https');

  const httpsOptions = {
    key: fs.readFileSync('localhost.key'),
    cert: fs.readFileSync('localhost.crt'),
  };

  server = https.createServer(httpsOptions, handler);
} else {
  const http = require('http');
  server = http.createServer(handler);
}
server.listen(port);

currentBuild = rebuild({skipRsync: false});

setTimeout(() => {
  console.log(
    `
opening ${host}/ in your browser

press CTRL-C to quit this program
`
  );
  exec(`open ${host}/`);
}, 300);
