// @flow

const fs = require('fs');
const hogan = require('hogan.js');
const marked = require('marked');
const cheerio = require('cheerio');
const matchAll = require('match-all');

function die(msg) {
  throw new Error(msg);
}

function trapInvalidAccesses(obj) {
  const objWithSubObjectsWrapped = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] == 'object') {
      if (Array.isArray(obj[key])) {
        objWithSubObjectsWrapped[key] = obj[key] = obj[key].map((v) =>
          trapInvalidAccesses(v)
        );
      } else {
        objWithSubObjectsWrapped[key] = trapInvalidAccesses(obj[key]);
      }
    }

    objWithSubObjectsWrapped[key] = obj[key];
  });

  const handler = {
    get: (target, name) => {
      return name in target
        ? target[name]
        : die(
            `invalid access of property '${name}' in object {${Object.keys(
              target
            ).join(', ')}}`
          );
    },
  };

  return new Proxy(objWithSubObjectsWrapped, handler);
}

function mergeDisjoint(...args /*:Array<Object>*/) {
  const target = {};
  for (var i = 0; i < args.length; i++) {
    const source = args[i];
    Object.keys(source).forEach((key) => {
      if (key in target) die(`tried to merge duplicate key ${key} into object`);
      target[key] = source[key];
    });
  }
  return target;
}

function renderTemplate(template /*:Object*/, data /*:Object*/) {
  // use named wrapper function for debugging ease
  function render() {
    return template.render(trapInvalidAccesses(data));
  }
  Object.defineProperty(render, 'name', {value: `render ${template.name}`});

  return render();
}

function loadTemplate(name /*: string*/) {
  console.log('loadTemplate', name);
  const filepath = __dirname + `/templates/${name}.mustache`;
  const template = hogan.compile(fs.readFileSync(filepath, {encoding: 'utf8'}));
  template.name = name;
  return template;
}

function getPostMarkdown(post /*: Object*/) {
  return fs.readFileSync(`${__dirname}/posts/${post.slug}.md`, {
    encoding: 'utf8',
  });
}

/* ::
type RenderedPostReactComponent = {
  jsx: string,
  id: string,
};
type RenderedPost = {
  postHTML: string,
  reactComponents: Array<RenderedPostReactComponent>
};
*/

const JS_TEMP_DIR = 'tempassets';
function getPostJSCodeFilepath(post /*:Object*/) {
  return `./${JS_TEMP_DIR}/${post.slug}.js`;
}

function generatePostJSCode(
  post,
  reactComponents /*: Array<RenderedPostReactComponent>*/
) /*: ?string*/ {
  if (reactComponents.length === 0) {
    return null;
  }
  const componentClasses = new Set();

  reactComponents.forEach(({id, jsx}) => {
    matchAll(jsx, /\<([A-Z]\w+)/g)
      .toArray()
      .forEach((componentClass) => {
        componentClasses.add(componentClass);
      });
  });

  const componentImports = Array.from(componentClasses)
    .map((c) => `import ${c} from '../../components/${c}';`)
    .join('\n');

  return `
import React from 'react';
import renderComponent from '../../components/renderComponent';
${componentImports}
${post.require ? `require('../../${post.require}');` : ''}

${reactComponents
  .map(({id, jsx}) => `renderComponent(${jsx}, '${id}');`)
  .join('\n')}
`;
}

function renderPostBody(post /*: Object*/) /*: RenderedPost*/ {
  const postMarkdown = getPostMarkdown(post);

  const renderer = new marked.Renderer();

  const reactComponents = [];

  let nextID = 0;
  renderer.html = function(html /*: string*/) /*:string*/ {
    const id = `react_component_${nextID++}`;
    const jsx = html
      .replace(/<react>/, '')
      .replace(/<\/react>/, '')
      .trim();
    reactComponents.push({
      jsx,
      id,
    });
    return `<div id="${id}"></div>`;
  };
  const postHTML = marked(postMarkdown, {gfm: true, renderer});
  return {postHTML, reactComponents};
}

function renderPostPreview(post /*: Object*/) {
  const bodyHTML = renderPostBody(post).postHTML;
  const $ = cheerio.load(bodyHTML);
  const preview = $('p')
    .toArray()
    .slice(0, 3)
    .map((el) => `<p>${$(el).html()}</p>`)
    .join('\n');
  return preview;
}

function nullthrows(v) {
  if (v == null) {
    throw new Error('unexpected null');
  }
  return v;
}

module.exports = {
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
};
