const path = require('path');
const util = require('util');
const rollup = require('rollup');
const loadRollupConfigFile = require('rollup/dist/loadConfigFile');
const {nullthrows} = require('./utils');

async function buildBundles(input, caches) {
  if (!caches) console.log('building from cold cache');
  const rollupConfig = await loadRollupConfigFile(
    path.resolve(__dirname, 'rollup.config.js'),
    {input}
  );
  let outputs = [];
  let rollupOptionsIndex = 0;
  for (const rollupOptions of rollupConfig.options) {
    rollupOptionsIndex++;
    // console.log({rollupOptions, output: rollupOptions.output});
    const bundle = await rollup.rollup({
      ...rollupOptions,
      cache: (caches || [])[rollupOptionsIndex],
    });
    const written = await Promise.all(
      rollupOptions.output.map((output) => bundle.write(output))
    );

    outputs = outputs.concat(
      written
        .map((bundle, outputsIndex) =>
          // take only the fields we need to reference from html
          bundle.output.map(({name, fileName, type, imports}, i) => ({
            ...bundle.output[i],
            code: null,
            source: null,
            name,
            fileName,
            fileExt: path.extname(fileName),
            fileBasename: path.basename(fileName, path.extname(fileName)),
            imports: imports || [],
            dir: rollupOptions.output[outputsIndex].dir,
            // type,
            // bundleFields: Object.keys(bundle.output[i]).join(),
          }))
        )
        .flat(Infinity)
    );
  }

  const jsOutputs = new Map(
    outputs.filter((o) => o.fileExt === '.js').map((o) => [o.name, o])
  );
  const cssOutputs = new Map(
    outputs
      .filter((o) => o.fileExt === '.css')
      .map((o) => {
        if (false) {
          // rollup-plugin-postcss doesn't generate a name for its extracted bundles,
          // fix that by finding the corresponding js output
          const correspondingJSFile = Array.from(jsOutputs.values()).find(
            (jsOutput) => jsOutput.fileBasename === o.fileBasename
          );
          if (!correspondingJSFile) {
            throw new Error(
              `couldn't find corresponding JS file for ${o.fileName}`
            );
          } else {
            o.name = correspondingJSFile.name;
          }
          return [o.name, o];
        } else {
          return [path.basename(o.name, '.css'), o];
        }
      })
  );
  const builtBundles = {jsOutputs, cssOutputs, caches};

  // console.log('buildBundles', builtBundles);
  // console.log('allOutputs', outputs);
  return builtBundles;
}

function getDepFilesRec(jsOutputsByName, filename) {
  const depFiles = nullthrows(jsOutputsByName.get(filename)).imports || [];

  if (depFiles.length === 0) return [];

  return [
    // subdepdencies first
    depFiles.map((depFileName) => getDepFilesRec(jsOutputsByName, depFileName)),
    depFiles, // this file's deps
  ];
}

function getRequiredBundleFiles(builtBundles, requiredBundleNames) {
  const jsOutputsByName = new Map(
    [...builtBundles.jsOutputs.values()].map((o) => [o.fileName, o])
  );

  const depTree = requiredBundleNames
    .map((name) => nullthrows(builtBundles.jsOutputs.get(name)))
    .map((o) => [getDepFilesRec(jsOutputsByName, o.fileName), o.fileName]);
  // find unique set of files, maintaining order, so dependencies come first
  const depSet = new Set(depTree.flat(Infinity));

  const js = [...depSet.values()].map((dep) =>
    nullthrows(jsOutputsByName.get(dep))
  );
  const css = js
    .map((jsBundle) => builtBundles.cssOutputs.get(jsBundle.name))
    .filter(Boolean); // not all js bundles have css

  // console.log(
  //   'getRequiredBundleFiles',
  //   util.inspect({requiredBundleNames, depSet, depTree}, {depth: Infinity})
  // );
  return {css, js};
}

module.exports = {
  buildBundles,
  getRequiredBundleFiles,
};
