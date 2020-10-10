// @flow

'use strict';

const exec = require('child_process').execSync;
const spawn = require('child_process').spawnSync;
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
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
  nullthrows,
} = require('./utils');
const rimraf = require('rimraf');

const {buildBundles, getRequiredBundleFiles} = require('./staticResources');

async function run({DEV, HOST, skipRsync, buildCache}) {
  const allPosts = JSON.parse(
    fs.readFileSync(require.resolve('./posts.json'), {encoding: 'utf8'})
  );
  const publishedPosts = allPosts.filter((p) => p.published !== false);

  const options = {
    posts: publishedPosts,
    host: HOST || 'https://jamesfriend.com.au',
  };

  // force reload of partials
  delete require.cache[require.resolve('./partials')];
  const getPartials = ({builtBundles, requiredBundleNames} = {}) => {
    return require('./partials')({
      options,
      getPublicPath: (assetLocalPath) => {
        return assetLocalPath.replace('build/', '');
      },
      getJS: () => {
        return getRequiredBundleFiles(
          nullthrows(builtBundles),
          nullthrows(requiredBundleNames)
        ).js;
      },
      getCSS: () => {
        return getRequiredBundleFiles(
          nullthrows(builtBundles),
          nullthrows(requiredBundleNames)
        ).css;
      },
    });
  };

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
    .map((line) => line.split(': '))
    .filter((parts) => parts[1] === 'text/html')
    .forEach((parts) => exec(`rm ${parts[0]}`));

  // clean up assets from prev build
  rimraf.sync('./build/assets/generated');
  mkdirp.sync('./build/assets/generated');

  console.log('\nbuilding post content');

  // create dir for generated JS (eg. react in post markdown)
  const jsTempDir = path.join('build', JS_TEMP_DIR);
  rimraf.sync(jsTempDir);
  mkdirp.sync(jsTempDir);

  const postFullTemplate = loadTemplate('postFullTemplate');
  const postShortTemplate = loadTemplate('postShortTemplate');
  const listPageTemplate = loadTemplate('listPageTemplate');
  const rssTemplate = loadTemplate('rssTemplate');

  const renderedPosts = publishedPosts.map((post) => {
    const rendered = renderPostBody(post);

    const postJSCode = generatePostJSCode(post, rendered.reactComponents);
    let postGeneratedJSFile = null;
    if (postJSCode) {
      postGeneratedJSFile = {
        filepath: path.join(jsTempDir, `post-${post.slug}.js`),
        name: `post-${post.slug}`,
      };
      fs.writeFileSync(postGeneratedJSFile.filepath, postJSCode, {
        encoding: 'utf8',
      });
    }

    return {
      post,
      rendered,
      postGeneratedJSFile,
    };
  });

  console.log('\nbundling assets');
  buildCache = buildCache || {};
  let builtBundles = await buildBundles(
    mergeDisjoint(
      Object.fromEntries(
        // js files for posts
        renderedPosts
          .filter(
            (renderedPost) =>
              renderedPost.post.published !== false &&
              renderedPost.postGeneratedJSFile
          )
          .map(({postGeneratedJSFile}) => [
            postGeneratedJSFile.name,
            postGeneratedJSFile.filepath,
          ])
      ),
      // bundles for specific page types
      {
        home: './client/home.js',
        post: './client/post.js',
      }
    ),
    buildCache.caches
  );
  buildCache.caches = builtBundles.caches;

  console.log('\nrebuilding pages');
  // post full view pages
  renderedPosts.forEach(({post, rendered, postGeneratedJSFile}) => {
    const html = renderTemplate(
      postFullTemplate,
      mergeDisjoint(
        getPartials({
          builtBundles,
          requiredBundleNames: [
            'post',
            postGeneratedJSFile ? postGeneratedJSFile.name : null,
          ].filter(Boolean),
        }),
        {
          post: mergeDisjoint(Object.assign(post, {body: rendered.postHTML}), {
            created_human: moment(post.created).format('MMMM D, YYYY'),
          }),
          meta_description: getPostMarkdown(post)
            .replace(/<[^>]*>/g, '') // best effort to strip tags
            .replace(/\n+/g, ' ')
            .slice(0, 155),
        }
      )
    );
    fs.writeFileSync(`./build/${post.slug}`, html, {encoding: 'utf8'});
  });

  // post previews
  const postsShortTexts = [];
  renderedPosts
    .filter((p) => p.published !== false)
    .forEach(({post, postGeneratedJSFile}) => {
      const preview = renderPostPreview(post);

      const postShortText = renderTemplate(
        postShortTemplate,
        mergeDisjoint(getPartials(), {
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
    mergeDisjoint(getPartials(), {
      posts: publishedPosts.map((post) =>
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
    mergeDisjoint(
      getPartials({
        builtBundles,
        requiredBundleNames: ['home'],
      }),
      {
        views_rows: postsShortTexts.join('\n'),
      }
    )
  );
  fs.writeFileSync(`./build/index.html`, frontpage, {encoding: 'utf8'});

  if (process.argv.includes('--publish')) {
    spawn(`node upload`, {stdio: 'inherit'});
  }
  console.log('done at', new Date().toString());
}

if (!module.parent) {
  Error.stackTraceLimit = Infinity;

  run({
    DEV: process.env.NODE_ENV === 'development',
    HOST: process.env.HOST,
    skipRsync: process.argv.includes('--skip-rsync'),
  }).catch((err) => {
    console.error('build err:', err);
    process.exit(1);
  });
}
module.exports = run;
