// @flow

'use strict';

const exec = require('child_process').execSync;
const spawn = require('child_process').spawnSync;
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const purify = require('purify-css');
const {
  loadTemplate,
  mergeDisjoint,
  renderTemplate,
  renderPostBody,
  renderPostPreview,
  generatePostJSCode,
  getPostJSCodeFilepath,
  JS_TEMP_DIR,
  getPostMarkdown,
} = require('./utils');
const rimraf = require('rimraf');

const postFullTemplate = loadTemplate('postFullTemplate');
const postShortTemplate = loadTemplate('postShortTemplate');
const listPageTemplate = loadTemplate('listPageTemplate');
const rssTemplate = loadTemplate('rssTemplate');

const skipRsync = process.argv.includes('--skip-rsync');
const verbosePurifyCSS = process.argv.includes('--verbose-purifycss');
function run() {
  const allPosts = require('./posts.json');
  const publishedPosts = allPosts.filter(p => p.published !== false);

  const options = {
    posts: publishedPosts,
    host: process.env.HOST || 'https://jamesfriend.com.au',
  };

  const partials = require('./partials')(options);

  mkdirp.sync('./build/');
  mkdirp.sync('./build/files');

  if (!skipRsync) {
    // sync static files
    console.log('rsync', process.cwd());
    exec('rsync -rvWi --delete  ./html/ ./build/', {stdio: 'inherit'});
  }

  // delete existing html files from root dir
  exec('file --mime-type --no-pad build/*')
    .toString()
    .split('\n')
    .map(line => line.split(': '))
    .filter(parts => parts[1] === 'text/html')
    .forEach(parts => exec(`rm ${parts[0]}`));

  console.log('\nrebuilding pages');

  const jsTempDir = path.join('build', JS_TEMP_DIR);
  mkdirp.sync(jsTempDir);
  const postJSFiles = [];

  // post full view pages
  allPosts.forEach(post => {
    const result = renderPostBody(post);
    const page = renderTemplate(
      postFullTemplate,
      mergeDisjoint(partials, {
        post: mergeDisjoint(Object.assign(post, {body: result.postHTML}), {
          created_human: moment(post.created).format('MMMM D, YYYY'),
        }),
        meta_description: getPostMarkdown(post)
          .replace(/<[^>]*>/g, '') // best effort to strip tags
          .replace(/\n+/g, ' ')
          .slice(0, 155),
      })
    );
    fs.writeFileSync(`./build/${post.slug}`, page, {encoding: 'utf8'});
    const jsCode = generatePostJSCode(result.reactComponents);
    if (jsCode != null) {
      const jsTempFilePath = path.join(jsTempDir, `${post.slug}.js`);
      postJSFiles.push(jsTempFilePath);
      fs.writeFileSync(jsTempFilePath, jsCode, {
        encoding: 'utf8',
      });
    }
  });

  // bundle js modules for posts
  console.log('\nrunning parcel');
  const parcelResult = exec(
    `yarn parcel build ./${jsTempDir}/*.js --out-dir build`
  );
  console.log(parcelResult.toString());

  rimraf.sync(jsTempDir);

  // post previews
  const postsShortTexts = [];
  publishedPosts.forEach(post => {
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
      posts: publishedPosts.map(post =>
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
      publishedPosts.map(p => `build/${p.slug}`)
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
