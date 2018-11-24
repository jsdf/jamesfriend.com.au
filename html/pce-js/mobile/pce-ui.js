// var o_canvas = document.getElementById('canvas')
// var o_context = o_canvas.getContext('2d');
// o_canvas.width = 512;
// o_canvas.height = 384;

// var m_canvas = document.createElement('canvas');
// var m_context = m_canvas.getContext('2d');

var t_canvas = document.getElementById('canvas')
var t_context = t_canvas.getContext('2d');
t_canvas.width = 512;
t_canvas.height = 384;

var emscriptenPrintEnabled = false;

// connect to canvas
var Module = {
  "arguments": ['-c','roms/pce-config.cfg'],
  preRun: [],
  postRun: [],
  print: (function() {
    if (!emscriptenPrintEnabled) return function() {};
    return function(text) {
      return console.log(text);
    };
  })(),
  printErr: (function() {
    if (!emscriptenPrintEnabled) return function() {};
    return function(text) {
      return console.warn(text);
    };
  })(),
  // canvas: m_canvas,
  // canvasFront: o_canvas,
  canvas: t_canvas,
  setStatus: function(text) {
    if (Module.setStatus.interval) clearInterval(Module.setStatus.interval);
    var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
    var statusElement = document.getElementById('status');
    var progressElement = document.getElementById('progress');
    if (m) {
      text = m[1];
      progressElement.value = parseInt(m[2])*100;
      progressElement.max = parseInt(m[4])*100;
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
    Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
  }
};
Module.setStatus('Downloading...');

var touchCurrentFirst = null;

function touchHandler(event) {
  console.log(event);
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
         switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type="mousemove"; break;        
        case "touchend":   type="mouseup"; break;
        default: return;
    }

    if (event.type == 'touchstart') {
      touchCurrentFirst = first;
    }

    if (event.type == 'touchmove') {
      event.preventDefault();
      return false;
    }
    if (
      event.type == 'touchmove'
      && touchCurrentFirst
      && !(
        Math.abs(first.screenX - touchCurrentFirst.screenX) > 30
        || Math.abs(first.screenY - touchCurrentFirst.screenY) > 30
      )
    ) {
      console.log('drag less than 10px');
      return;
    }

    console.log('proxying event of type',event.type,'to type',type)

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                              first.screenX, first.screenY, 
                              first.clientX, first.clientY, false, 
                              false, false, false, 0/*left*/, null);

   first.target.dispatchEvent(simulatedEvent);
}

[
'touchstart'
,'touchend'
, 'touchmove'
].forEach(function(event) {
  var mainCanvas = Module.canvasFront || Module.canvas;
  mainCanvas.addEventListener(event, touchHandler, true);
});


// proxy events from front canvas to back canvas
// ['mousedown', 'mouseup', 'mousemove', 'mouseout'].forEach(function(event) {
//   Module["canvasFront"].addEventListener(event, function(e) {
//     try {
//       Module["canvas"].dispatchEvent(e);
//     } catch (e) {
//       // console.warn('failed to dispatch '+event, e);
//     }
//   }, true);
// });

// function render() {
//   o_context.drawImage(m_canvas, 0, 0);
//   requestAnimationFrame(render);
// }

// render();

