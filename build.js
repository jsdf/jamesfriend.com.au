const exec = require('child_process').execSync;
const fs = require('fs');
const moment = require('moment');
const {
  getLines,
  loadTemplate,
  mergeDisjoint,
  renderTemplate,
} = require('./utils');
const marked = require('marked');
const cheerio = require('cheerio');

const postFullTemplate = loadTemplate('postFullTemplate');
const postShortTemplate = loadTemplate('postShortTemplate');
const listPageTemplate = loadTemplate('listPageTemplate');

function run() {
  exec('mkdir -p ./build/');
  exec('mkdir -p ./build/node');
  // exec('rsync -r --delete  ./html/ ./build/');

  // delete existing html files from root dir
  exec('file build/* --mime-type --no-pad')
    .toString()
    .split('\n')
    .map(line => line.split(': '))
    .filter(parts => parts[1] === 'text/html')
    .forEach(parts => exec(`rm ${parts[0]}`));

  const posts = require('./posts.json');

  const orderedPostIds = Object.keys(posts).sort(
    (a, b) => -(Number.parseInt(a) - Number.parseInt(b))
  );

  const options = {
    orderedPosts: orderedPostIds.map(id => posts[id]),
    host: 'https://jamesfriend.com.au',
  };

  const partials = require('./partials')(options);

  // post full view pages
  orderedPostIds.forEach(postId => {
    const post = posts[postId];
    if (post.slug.includes('/')) return;

    const page = renderTemplate(
      postFullTemplate,
      mergeDisjoint(partials, {
        post: mergeDisjoint(post, {
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

    const bodyHTML = marked(post.body_markdown, {gfm: true});
    const $ = cheerio.load(bodyHTML);
    const preview = $('p')
      .toArray()
      .slice(0, 3)
      .map(el => `<p>${$(el).html()}</p>`)
      .join('\n');

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

  // front page
  const frontpage = renderTemplate(
    listPageTemplate,
    mergeDisjoint(partials, {
      views_rows: postsShortTexts.join('\n'),
    })
  );
  fs.writeFileSync(`./build/index.html`, frontpage, {encoding: 'utf8'});
}

if (!module.parent) {
  run();
}
module.exports = run;
