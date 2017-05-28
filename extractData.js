const cheerio = require('cheerio');
const fs = require('fs');
const exec = require('child_process').execSync;
const diff = require('jest-diff');
const leftPad = require('left-pad');
const toMarkdown = require('to-markdown');

function nullthrows(value, name = 'value') {
  if (value == null) throw new Error(`${name} unexpectedly null`);
  return value;
}

function invariant(value) {
  if (!value) throw new Error(`invariant violation`);
}

function grep(regexp, text) {
  const match = text.match(regexp);
  if (match) return match[1];
  return null;
}

function fixDrupalISODate(datestring) {
  const parts = datestring.split('-');
  parts[1] = leftPad(parts[1], 2, '0');
  parts[2] = leftPad(parts[2], 2, '0');
  return parts.join('-');
}

function extractDataFromPosts(htmlText) {
  const $ = cheerio.load(htmlText);
  const $page = $('#main');
  invariant($page.length === 1);

  const postsData = {};
  const nodeId = grep(/\-([0-9]+)$/, $page.find('.node-article').attr('id'));

  const created = fixDrupalISODate(
    $page.find('[property="dc:date dc:created"]').attr('content')
  );
  const author = {
    username: nullthrows($page.find('.username').text(), 'username'),
    id: nullthrows(
      grep(/\/(\w+)$/, $page.find('.username').attr('about')),
      'user id'
    ),
  };

  const slug = $page.find('.node-article').attr('about').slice(1);
  const title = $page.find('.title').text();

  const body = $page.find('.field-name-body .field-items .field-item').html();

  const bodyMarkdown = toMarkdown(body, {gfm: true});

  const bodyText = $page.find('.field-name-body .field-items').text();

  postsData[nodeId] = {
    id: nullthrows(nodeId, 'id'),
    slug: nullthrows(slug, 'slug'),
    title: nullthrows(title, 'title'),
    author: nullthrows(author, 'author'),
    body: nullthrows(body, 'body'),
    body_markdown: nullthrows(bodyMarkdown, 'bodyMarkdown'),
    body_text: nullthrows(bodyText, 'bodyText'),
    created: nullthrows(created, 'created'),
  };
  return postsData;
}

function mergeNewPostsData(mergedPostsData, newPostsData) {
  Object.keys(newPostsData).forEach(key => {
    if (key in mergedPostsData) {
      if (
        Object.keys(mergedPostsData[key]).length > 0 &&
        Object.keys(mergedPostsData[key]).length !==
          Object.keys(
            Object.assign({}, mergedPostsData[key], newPostsData[key])
          ).length
      ) {
        console.error('merging post data with different fields');
      }

      console.error(diff(mergedPostsData[key], newPostsData[key]));
      console.error(`overwriting data for ${key}`);
    }
    mergedPostsData[key] = newPostsData[key];
  });
}

const dataFilepath = __dirname + '/posts.json';
const mergedPostsData = JSON.parse(fs.readFileSync(dataFilepath), {
  encoding: 'utf8',
});
console.log(`loaded ${Object.keys(mergedPostsData).length} existing posts`);

process.argv.slice(2).forEach(filepath => {
  const newPostsData = extractDataFromPosts(
    fs.readFileSync(filepath, {encoding: 'utf8'})
  );
  mergeNewPostsData(mergedPostsData, newPostsData);
});

console.log(`writing ${Object.keys(mergedPostsData).length} posts`);
fs.writeFileSync(dataFilepath, JSON.stringify(mergedPostsData, null, 2), {
  encoding: 'utf8',
});
