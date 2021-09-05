import './normalize.css';
import './typography.css';
import './boilerplate.css';
import './site.less';
import {addTooltip} from './tooltip';

// this bundle is included on every page

// don't dead-code eliminate this module, we need its css :'(
if (window.a) {
  console.log('hi');
}

// not using tooltips anymore
// function shouldShowTooltip() {
//   return window.innerWidth >= 800;
// }
// for (const tooltipEl of document.querySelectorAll('.tooltip')) {
//   addTooltip(tooltipEl, shouldShowTooltip);
// }
