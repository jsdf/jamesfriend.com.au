import './tooltip.less';

export function addTooltip(targetEl, shouldShow) {
  const textEl = document.createElement('span');
  const containerEl = document.createElement('span');
  containerEl.style.position = 'relative';
  containerEl.appendChild(textEl);
  containerEl.className = 'tooltip-outer';
  textEl.innerText = targetEl.title;
  targetEl.title = ''; //
  textEl.className = 'tooltip-content';
  targetEl.appendChild(containerEl);
  targetEl.addEventListener('mouseenter', () => {
    if (shouldShow()) {
      textEl.style.display = 'inline';
      textEl.classList.remove('tooltip-hidden');
    }
  });
  targetEl.addEventListener('mouseleave', () => {
    textEl.classList.add('tooltip-hidden');
  });
  textEl.classList.add('tooltip-hidden');
}
