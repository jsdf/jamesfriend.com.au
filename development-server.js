const spawn = require('child_process').spawn;
const exec = require('child_process').execSync;

const sane = require('sane');
const lodash = require('lodash');

function build() {
  exec('node build.js');
}

const buildDebounced = lodash.debounce(() => {
  console.log('changes detected, rebuilding');
  build();
}, 50);

var watcher = sane('./html/', {glob: ['**/*.js', '**/*.css', '**/*.html']});
watcher.on('ready', function () { console.log('watching for changes') });
watcher.on('change', buildDebounced);
watcher.on('add', buildDebounced);
watcher.on('delete', buildDebounced);

const port = 8081;
spawn('node_modules/.bin/http-server', ['./build', '-p', port]);

build();

setTimeout(() => {
  console.log(`
opening http://127.0.0.1:${port}/ in your browser

press CTRL-C to quit this program
`
  );
  exec(`open http://127.0.0.1:${port}/`);
}, 300);
