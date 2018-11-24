(function() {
  var browserPrefixes;

  browserPrefixes = ['-webkit-', '-moz-', '-ms-', ''];

  window.PCEJS = {
    containerSel: '#pcejs',
    canvasId: 'canvas',
    doubleBuffer: true,
    printEnabled: true,
    touchCurrentFirst: null,
    canvasWidth: 512,
    canvasHeight: 342,
    canvasScale: 1,
    canvasOffset: 0,
    zoomControls: false,
    argv: ['-c', 'pce-config.cfg', '-r'],
    init: function(config) {
      this.config = config != null ? config : {};
      _.extend(this, this.config);
      this.preInit();
      this.moduleInit();
      return this.postInit();
    },
    preInit: function() {
      this.container = $(this.containerSel);
      this.container.html(this.containerHTML());
      if (this.doubleBuffer) {
        this.frontCanvas = document.getElementById(this.canvasId);
        this.frontContext = this.frontCanvas.getContext('2d');
        this.backCanvas = document.createElement('canvas');
        this.backContext = this.backCanvas.getContext('2d');
      } else {
        this.frontCanvas = this.backCanvas = document.getElementById(this.canvasId);
        this.frontContext = this.backContext = this.backCanvas.getContext('2d');
      }
      return this.layoutFrontCanvas();
    },
    moduleInit: function() {
      return this.module = {
        'arguments': this.argv,
        preRun: [],
        postRun: [],
        print: !this.printEnabled ? (function() {}) : console.log.bind(console),
        printErr: !this.printEnabled ? (function() {}) : (function(text) {
          return console.warn(text);
        }),
        canvas: this.backCanvas,
        canvasFront: this.doubleBuffer ? this.frontCanvas : null,
        totalDependencies: 0,
        setStatus: function(text) {
          var m, progressElement, statusElement;
          if (this.setStatus.interval) {
            clearInterval(this.setStatus.interval);
          }
          m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
          statusElement = $('#status').get(0);
          progressElement = $('#progress').get(0);
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
          return statusElement.innerHTML = text;
        },
        monitorRunDependencies: function(remainingDependencies) {
          this.totalDependencies = Math.max(this.totalDependencies, remainingDependencies);
          this.setStatus(remainingDependencies ? 'Preparing... (' + (this.totalDependencies - remainingDependencies) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
          if (!remainingDependencies) {
            return $(document).trigger('dependenciesLoaded');
          }
        }
      };
    },
    postInit: function() {
      this.bindTouchEventHandlers();
      if (this.doubleBuffer) {
        this.initDoubleBuffer();
      }
      $('#gofullscreen').click(function() {
        return this.module.requestFullScreen($('#pointerLock').get(0).checked, $('#resize').get(0).checked);
      });
      this.module.setStatus('Downloading...');
      if (this.zoomControls) {
        this.addZoomControls();
      }
      this.addAboutLink();
      return window.Module = this.module;
    },
    mountPersistentFS: function() {
      FS.mkdir('/data');
      FS.mount(IDBFS, {}, '/data');
      return FS.syncfs(true, function(err) {
        return console.error(err);
      });
    },
    syncPersistentFS: function() {
      return FS.syncfs(function(err) {
        return console.error(err);
      });
    },
    initDoubleBuffer: function() {
      var _this = this;
      _.each(['mousedown', 'mouseup', 'mousemove', 'mouseout'], function(event) {
        return _this.module["canvasFront"].addEventListener(event, function(e) {
          try {
            return _this.module["canvas"].dispatchEvent(e);
          } catch (_error) {
            e = _error;
          }
        }, true);
      });
      return this.renderToFrontCanvas();
    },
    renderToFrontCanvas: function() {
      this.frontContext.drawImage(this.backCanvas, 0, 0);
      return window.requestAnimationFrame(this.renderToFrontCanvas.bind(this));
    },
    touchToMouseEvent: function(event) {
      var firstTouch, mouseEventType, simulatedEvent;
      firstTouch = event.changedTouches[0];
      mouseEventType = "";
      switch (event.type) {
        case "touchstart":
          mouseEventType = "mousedown";
          break;
        case "touchmove":
          mouseEventType = "mousemove";
          break;
        case "touchend":
          mouseEventType = "mouseup";
          break;
        default:
          return;
      }
      if (event.type === 'touchstart') {
        this.touchCurrentFirst = firstTouch;
      }
      if (event.type === 'touchmove') {
        event.preventDefault();
        return false;
      }
      if (event.type === 'touchmove' && this.touchCurrentFirst && !(Math.abs(firstTouch.screenX - this.touchCurrentFirst.screenX) > 30 || Math.abs(firstTouch.screenY - this.touchCurrentFirst.screenY) > 30)) {
        return;
      }
      simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent(mouseEventType, true, true, window, 1, firstTouch.screenX, firstTouch.screenY, firstTouch.clientX, firstTouch.clientY, false, false, false, false, 0, null);
      firstTouch.target.dispatchEvent(simulatedEvent);
      if (Browser) {
        return Browser.step_func();
      }
    },
    layoutFrontCanvas: function() {
      var _this = this;
      this.container.find('.emscripten_border').height(this.canvasHeight * this.canvasScale);
      this.frontCanvas.width = this.canvasWidth;
      this.frontCanvas.height = this.canvasHeight;
      return $(this.frontCanvas).css(_.reduce(browserPrefixes, function(css, prefix) {
        css["" + prefix + "transform"] = "scale(" + _this.canvasScale + ")";
        css["" + prefix + "transform-origin"] = "center top";
        return css;
      }, {}));
    },
    bindTouchEventHandlers: function() {
      var _this = this;
      return _.each(['touchstart', 'touchend', 'touchmove'], function(event) {
        var mainCanvas;
        mainCanvas = _this.module.canvasFront || _this.module.canvas;
        return mainCanvas.addEventListener(event, (function() {
          return this.touchToMouseEvent;
        }), true);
      });
    },
    addAboutLink: function() {
      return this.container.append($('<small><a href="https://github.com/jsdf/pce/blob/pcejs/README.md">about pce.js emulator</a></small>'));
    },
    addZoomControls: function() {
      var _this = this;
      this.container.append($('<div class="zoom-controls"></div>').append($('<label>Scale:</label>')).append(_.map([1, 1.5, 2], function(zoom) {
        return $('<input />', {
          'type': 'button',
          'value': zoom + "x",
          'data-scale': zoom
        }).get(0);
      })));
      return $(document).on('click', '.zoom-controls input[type=button]', function(event) {
        console.log($(event.target));
        console.log($(event.target).attr('data-scale'));
        _this.canvasScale = parseFloat($(event.target).attr('data-scale'), 10);
        return _this.layoutFrontCanvas();
      });
    },
    containerHTML: function() {
      return "<div class=\"emscripten\" id=\"status\">Downloading...</div>\n<div class=\"emscripten\">\n  <progress value=\"0\" max=\"100\" id=\"progress\" hidden=1></progress>\n</div>\n<div class=\"emscripten_border\">\n  <canvas class=\"emscripten\" id=\"" + this.canvasId + "\" oncontextmenu=\"event.preventDefault()\"></canvas>\n</div>\n<div class=\"emscripten\" id=\"fullscreencontrols\">\n  <input type=\"checkbox\" id=\"resize\">Resize canvas\n  <input type=\"checkbox\" id=\"pointerLock\" checked>Lock/hide mouse pointer\n  &nbsp&nbsp&nbsp\n  <input type=\"button\" value=\"Fullscreen\" id=\"gofullscreen\">\n</div>\n<textarea class=\"emscripten\" id=\"output\" rows=\"8\"></textarea>";
    }
  };

}).call(this);
