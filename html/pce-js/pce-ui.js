var Module = {
  preRun: [],
  postRun: [],
  printEnabled: true,
  print: (function() {
    var element = document.getElementById('output');
    element.value = ''; // clear browser cache
    return function(text) {
      if (!Module.printEnabled) return;
      return console.log(text);
    };
  })(),
  printErr: function(text) {
    text = Array.prototype.slice.call(arguments).join(' ');
    console.log(text);
  },
  canvas: document.getElementById('canvas'),
  setStatus: function(text) {
    if (Module.setStatus.interval) clearInterval(Module.setStatus.interval);
    var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
    var statusElement = document.getElementById('status');
    var progressElement = document.getElementById('progress');
    if (m) {
      text = m[1];
      progressElement.value = parseInt(m[2]) * 100;
      progressElement.max = parseInt(m[4]) * 100;
      progressElement.hidden = false;
    } else {
      progressElement.value = null;
      progressElement.max = null;
      progressElement.hidden = true;
    }
    statusElement.innerHTML = text;
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Module.setStatus(
      left
        ? 'Preparing... (' +
          (this.totalDependencies - left) +
          '/' +
          this.totalDependencies +
          ')'
        : 'All downloads complete.'
    );
    if (!left) {
      var a = document.getElementById('macstartup');
      if (a) {
        a.volume = 0.3;
        a.play();
      }
    }
  },
};
Module.setStatus('Downloading...');
