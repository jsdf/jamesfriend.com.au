const exec = require('child_process').execSync;
const fs = require('fs');
const hogan = require('hogan.js');

function die(msg) {
  throw new Error(msg);
}

const options = {
  submitHost: process.env.SUBMIT_HOST || die('missing env var SUBMIT_HOST'),
};

const partials = require('./partials')(options);

function subtitute(input) {
  const template = hogan.compile(input);
  return template.render(partials);
}

function run() {
  exec('mkdir -p ./build/');
  exec('rsync -r --delete  ./html/ ./build/')

  const files = fs.readdirSync('./html').filter(file => file.endsWith('.html'));

  files.forEach(file => {
    const input = fs.readFileSync(`./html/${file}`, {encoding: 'utf8'});
    const output = subtitute(input);
    fs.writeFileSync(`./build/${file}`, output, {encoding: 'utf8'});
  });
}

if (!module.parent) {
  run();
}
module.exports = run;
