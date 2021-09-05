// the home page

import './boot';
import {attachDemo} from './demo';
const demo = document.getElementById('demo');

if (demo) {
  attachDemo(demo);
}
