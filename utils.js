const fs = require('fs');
const hogan = require('hogan.js');

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

function mergeDisjoint(...args) {
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

function renderTemplate(template, data) {
  return template.render(trapInvalidAccesses(data));
}

function loadTemplate(name) {
  const filepath = __dirname + `/${name}.mustache`;
  return hogan.compile(fs.readFileSync(filepath, {encoding: 'utf8'}));
}

module.exports = {
  loadTemplate,
  mergeDisjoint,
  renderTemplate,
};
