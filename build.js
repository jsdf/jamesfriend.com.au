// @flow

'use strict';

const exec = require('child_process').execSync;
const spawn = require('child_process').spawnSync;
const mkdirp = require('mkdirp');
const fs = require('fs');
const moment = require('moment');
const purify = require('purify-css');
const {
  loadTemplate,
  mergeDisjoint,
  renderTemplate,
  renderPostBody,
  renderPostPreview,
  getPostMarkdown,
} = require('./utils');

const postFullTemplate = loadTemplate('postFullTemplate');
const postShortTemplate = loadTemplate('postShortTemplate');
const listPageTemplate = loadTemplate('listPageTemplate');
const rssTemplate = loadTemplate('rssTemplate');

const skipRsync = process.argv.includes('--skip-rsync');
const verbosePurifyCSS = process.argv.includes('--verbose-purifycss');
function run() {
  const posts = require('./posts.json').filter(p => p.published !== false);

  const options = {
    posts: posts,
    host: process.env.HOST || 'https://jamesfriend.com.au',
  };

  const partials = require('./partials')(options);

  mkdirp.sync('./build/');
  mkdirp.sync('./build/files');

  if (!skipRsync) {
    // sync static files
    console.log('rsync', process.cwd());
    const out = exec('rsync -rvWi --delete  ./html/ ./build/');
    console.log(out.toString());
  }

  // delete existing html files from root dir
  exec('file --mime-type --no-pad build/*')
    .toString()
    .split('\n')
    .map(line => line.split(': '))
    .filter(parts => parts[1] === 'text/html')
    .forEach(parts => exec(`rm ${parts[0]}`));

  console.log('rebuilding pages');

  // post full view pages
  posts.forEach(post => {
    const bodyHTML = renderPostBody(post);
    const page = renderTemplate(
      postFullTemplate,
      mergeDisjoint(partials, {
        post: mergeDisjoint(Object.assign(post, {body: bodyHTML}), {
          created_human: moment(post.created).format('MMMM D, YYYY'),
        }),
        meta_description: getPostMarkdown(post).slice(0, 300),
      })
    );
    fs.writeFileSync(`./build/${post.slug}`, page, {encoding: 'utf8'});
  });

  // post previews
  const postsShortTexts = [];
  posts.forEach(post => {
    const preview = renderPostPreview(post);

    const postShortText = renderTemplate(
      postShortTemplate,
      mergeDisjoint(partials, {
        post: mergeDisjoint(post, {
          created_human: moment(post.created).format('MMMM D, YYYY'),
          body_short: preview,
        }),
      })
    );
    postsShortTexts.push(postShortText);
  });

  // rss
  const rss = renderTemplate(
    rssTemplate,
    mergeDisjoint(partials, {
      posts: posts.map(post =>
        mergeDisjoint(post, {
          created_rss: moment(post.created).format(
            'ddd, DD MMM YYYY HH:mm:ss ZZ'
          ),
          body_short: renderPostPreview(post),
        })
      ),
    })
  );
  fs.writeFileSync(`./build/rss.xml`, rss, {encoding: 'utf8'});

  // front page
  const frontpage = renderTemplate(
    listPageTemplate,
    mergeDisjoint(partials, {
      views_rows: postsShortTexts.join('\n'),
    })
  );
  fs.writeFileSync(`./build/index.html`, frontpage, {encoding: 'utf8'});

  {
    const content = ['build/index.html', 'html/assets/main.js'].concat(
      posts.map(p => `build/${p.slug}`)
    );
    const css = ['./html/assets/main.css'];

    const options = {
      output: './build/assets/main.css',

      info: verbosePurifyCSS,

      // Logs out removed selectors.
      rejected: verbosePurifyCSS,
    };

    purify(content, css, options);
  }

  fs.writeFileSync(
    './build/manifest.json',
    JSON.stringify({host: options.host}, null, 2)
  );

  if (process.argv.includes('--publish')) {
    spawn(`node upload`, {stdio: 'inherit'});
  }
}

if (!module.parent) {
  run();
}
module.exports = run;
