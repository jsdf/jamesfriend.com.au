import './normalize.css';
import './typography.css';
import './boilerplate.css';
import './site.less';
import {addTooltip} from './tooltip';

// this bundle is included on every page

console.log('hi');

function shouldShowTooltip() {
  return window.innerWidth >= 800;
}
for (const tooltipEl of document.querySelectorAll('.tooltip')) {
  addTooltip(tooltipEl, shouldShowTooltip);
}
