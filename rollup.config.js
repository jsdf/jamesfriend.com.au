// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import styles from 'rollup-plugin-styles';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import {terser} from 'rollup-plugin-terser';

import nested from 'postcss-nested';
import cssnano from 'cssnano';

const DEV = process.env.NODE_ENV !== 'production';

export default {
  input: {
    // boot: './client/boot.js',
    // home: './client/home.js',
    // post: './client/post.js',
    // 'post-react-test': './build/tempassets/react-test.js',
  },

  output: {
    dir: 'build/assets/generated',
    format: 'system',
    assetFileNames: false ? '[name][extname]' : '[name]-[hash][extname]',
    entryFileNames: false ? '[name].js' : '[name]-[hash].js',
    manualChunks: {
      react: ['react', 'react-dom'],
      boot: ['./client/boot.js'],
    },
  },

  plugins: [
    styles({
      plugins: [nested(), DEV ? null : cssnano()].filter(Boolean),
      mode: 'extract',
    }),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
    alias({
      entries: [
        {
          find: 'react',
          replacement: DEV
            ? 'react/cjs/react.development.js'
            : 'react/cjs/react.production.min.js',
        },
        {
          find: 'react-dom',
          replacement: DEV
            ? 'react-dom/cjs/react-dom.development.js'
            : 'react-dom/cjs/react-dom.production.min.js',
        },
        // {
        //   find: 'three',
        //   replacement: 'three/src/Three.js',
        // },
      ],
    }),

    resolve({}),
    commonjs(),

    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),

    DEV ? null : terser(), // minify
  ].filter(Boolean),
};
