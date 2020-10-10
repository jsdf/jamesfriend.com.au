export default function throttle(fn, time, {leading} = {}) {
  let timeout = null;
  return (...args) => {
    if (timeout == null) {
      if (leading) {
        // call on first occurrence, with no delay
        fn(...args);
      }
      timeout = setTimeout(() => {
        timeout = null;
        fn(...args);
      }, time);
    }
  };
}
