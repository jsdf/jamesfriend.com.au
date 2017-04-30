const exec = require('child_process').execSync;
const fs = require('fs');
const moment = require('moment');
const {
  getLines,
  loadTemplate,
  mergeWithNoDuplicateKeys,
  renderTemplate,
} = require('./utils');

const options = {};

const partials = require('./partials')(options);

const postFullTemplate = loadTemplate('postFullTemplate');
const postShortTemplate = loadTemplate('postShortTemplate');
const listPageTemplate = loadTemplate('listPageTemplate');

function run() {
  exec('mkdir -p ./build/');
  exec('mkdir -p ./build/node');
  // exec('rsync -r --delete  ./html/ ./build/');

  const posts = require('./posts.json');

  const orderedPostIds = Object.keys(posts).sort(
    (a, b) => -(Number.parseInt(a) - Number.parseInt(b))
  );

  // post full view pages
  orderedPostIds.forEach(postId => {
    const post = posts[postId];
    if (post.slug.includes('/')) return;

    const page = renderTemplate(
      postFullTemplate,
      mergeWithNoDuplicateKeys(partials, {
        post: mergeWithNoDuplicateKeys(post, {
          created_human: moment(post.created).format('MMMM D, YYYY'),
        }),
        meta_description: post.body_text.slice(0, 300),
      })
    );
    fs.writeFileSync(`./build/${post.slug}`, page, {encoding: 'utf8'});
  });

  // post previews
  const postsShortTexts = [];
  orderedPostIds.forEach(postId => {
    const post = posts[postId];
    if (post.slug.includes('/')) return;

    const postShortText = renderTemplate(
      postShortTemplate,
      mergeWithNoDuplicateKeys(partials, {
        post: mergeWithNoDuplicateKeys(post, {
          created_human: moment(post.created).format('MMMM D, YYYY'),
          body_short: post.body_preview,
        }),
      })
    );
    postsShortTexts.push(postShortText);
  });

  // front page
  const frontpage = renderTemplate(
    listPageTemplate,
    mergeWithNoDuplicateKeys(partials, {
      views_rows: postsShortTexts.join('\n'),
    })
  );
  fs.writeFileSync(`./build/index.html`, frontpage, {encoding: 'utf8'});
}

if (!module.parent) {
  run();
}
module.exports = run;
