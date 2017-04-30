const cheerio = require('cheerio');
const fs = require('fs');
const exec = require('child_process').execSync;
const diff = require('jest-diff');

function process(htmlText) {
  const $ = cheerio.load(htmlText);
  const postsData = transformPosts($);
  writePostsData(postsData);
  return $.html();
}

function nullthrows(value, name = 'value') {
  if (value == null) throw new Error(`${name} unexpectedly null`);
  return value;
}

function grep(regexp, text) {
  const match = text.match(regexp);
  if (match) return match[1];
  return null;
}

function transformPosts($) {
  const $posts = $('.node-article');
  const postsData = {};
  $posts.each((index, post) => {
    const $post = $(post);
    const nodeId = grep(/\-([0-9]+)$/, $post.attr('id'));
    console.log({nodeId});
    const created = $post
      .find('[property="dc:date dc:created"]')
      .attr('content');
    const author = {
      username: nullthrows($post.find('.username').text(), 'username'),
      id: nullthrows(
        grep(/\/(\w+)$/, $post.find('.username').attr('about')),
        'user id'
      ),
    };

    const slug = $post.attr('about').slice(1);
    const title = $post.find('h2 a').text();

    const body = $post.find('.field-name-body .field-items').html();
    const bodyText = $post.find('.field-name-body .field-items').text();

    postsData[nodeId] = {
      id: nullthrows(nodeId, 'id'),
      slug: nullthrows(slug, 'slug'),
      title: nullthrows(title, 'title'),
      author: nullthrows(author, 'author'),
      body: nullthrows(body, 'body'),
      bodyText: nullthrows(bodyText, 'bodyText'),
    };

    $post.parent().html(`{{#node}}${nodeId}{{/node}}`);
  });
  return postsData;
}

function writePostsData(newPostsData) {
  const filepath = __dirname + '/posts.json';
  const prevPostsData = JSON.parse(fs.readFileSync(filepath), {
    encoding: 'utf8',
  });
  console.error(`loaded ${Object.keys(prevPostsData).length} existing posts`);

  const mergedPostsData = Object.assign({}, prevPostsData);
  Object.keys(newPostsData).forEach(key => {
    if (key in prevPostsData) {
      if (
        Object.keys(prevPostsData[key]).length > 0 &&
        Object.keys(prevPostsData[key]).length !==
          Object.keys(
            Object.assign({}, prevPostsData[key], newPostsData[key])
          ).length
      ) {
        console.error('merging post data with different fields');
        console.error(diff(prevPostsData[key], newPostsData[key]));
      }
      console.error(`overwriting data for ${key}`);
    }
    mergedPostsData[key] = newPostsData[key];
  });

  console.error(`writing ${Object.keys(mergedPostsData).length} posts`);
  fs.writeFileSync(filepath, JSON.stringify(mergedPostsData, null, 2), {
    encoding: 'utf8',
  });
}

module.exports = (fileInfo, api, options) => {
  console.log('processing', fileInfo.path);
  return process(fileInfo.source);
};
