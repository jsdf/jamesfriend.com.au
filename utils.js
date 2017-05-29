// @flow

const fs = require('fs');
const hogan = require('hogan.js');
const marked = require('marked');

function die(msg) {
  throw new Error(msg);
}

function trapInvalidAccesses(obj) {
  const objWithSubObjectsWrapped = {};
  Object.keys(obj).forEach(key => {
    objWithSubObjectsWrapped[key] = obj[key] && typeof obj[key] == 'object'
      ? trapInvalidAccesses(obj[key])
      : obj[key];
  });

  const handler = {
    get: (target, name) => {
      return name in target
        ? target[name]
        : die(
            `invalid access of property '${name}' in object {${Object.keys(target).join(', ')}}`
          );
    },
  };

  return new Proxy(objWithSubObjectsWrapped, handler);
}

function mergeDisjoint(...args /*:Array<Object>*/) {
  const target = {};
  for (var i = 0; i < args.length; i++) {
    const source = args[i];
    Object.keys(source).forEach(key => {
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
  const filepath = __dirname + `/${name}.mustache`;
  const template = hogan.compile(fs.readFileSync(filepath, {encoding: 'utf8'}));
  template.name = name;
  return template;
}

function getPostMarkdown(post /*: Object*/) {
  return fs.readFileSync(`${__dirname}/posts/${post.slug}.md`, {
    encoding: 'utf8',
  });
}
function renderPostBody(post /*: Object*/) {
  const postMarkdown = getPostMarkdown(post);
  return marked(postMarkdown, {gfm: true});
}
module.exports = {
  loadTemplate,
  mergeDisjoint,
  renderTemplate,
  renderPostBody,
  getPostMarkdown,
};
