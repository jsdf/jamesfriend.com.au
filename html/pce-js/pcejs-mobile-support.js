(function() {
  if ('ontouchstart' in window) {
    // hacks for mobile browsers
    var metaViewport = document.querySelector('meta[name=viewport]');
    if (metaViewport) {
      metaViewport.setAttribute(
        'content',
        // width: 512px emulator + 2 * 8px margin
        'width=528, user-scalable=0'
      );
    } else {
      console.error('couldnt find viewport meta tag');
    }
    var canvasEl = document.querySelector('canvas');

    var lastTouchStart = null;
    canvasEl.addEventListener('touchstart', function(event) {
      lastTouchStart = event;
      SDL.receiveEvent(event);
    });
    canvasEl.addEventListener('touchmove', function(event) {
      SDL.receiveEvent(event);
    });
    canvasEl.addEventListener('touchend', function(event) {
      if (lastTouchStart && Date.now() < lastTouchStart.timeStamp + 200) {
        setTimeout(function() {
          SDL.receiveEvent(event);
        }, 200);
      } else {
        SDL.receiveEvent(event);
      }
    });

    var keyboardEl = document.createElement('input');
    Object.assign(keyboardEl, {
      placeholder: 'tap here to show keyboard',
    });
    Object.assign(keyboardEl.style, {
      width: '150px',
    });
    canvasEl.parentNode.insertBefore(keyboardEl, canvasEl.nextSibling);

    var styleTag = document.createElement('style');
    styleTag.appendChild(
      document.createTextNode(`
      body {
        margin: 0 8px;
        padding: 0;
        background: none;
        box-shadow: none;
      }
      canvas {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      #pcejs small {
        display: none;
      }
      .title {
        display: none;
      }
      ::-webkit-input-placeholder, ::placeholder {
        color: black;
      }

      #titlebar {
        height: initial;
      }
      #titlebar h1 {
        padding-bottom: 8px;
      }

      #titlebar .description {
        position: static;
        width: initial;
      }

      .container {
        background: none;
        width: auto;
        padding: 0;
      }
  `)
    );
    document.head.appendChild(styleTag);

    // for debugging only
    function addEventLogging() {
      var logEl = document.createElement('pre');
      Object.assign(logEl.style, {
        fontFamily: 'monospace',
        fontSize: '8px',
        paddingTop: '8px',
      });
      document.body.appendChild(logEl);

      function logAppend(msg) {
        logEl.textContent = `${msg}\n` + logEl.textContent;
      }

      function throttle(fn, time) {
        var timeout = null;
        return function() {
          if (timeout == null) {
            setTimeout(function() {
              timeout = null;
              fn();
            }, time);
          }
        };
      }

      var logAsync = (function() {
        var messages = [];
        var throttledFlush = throttle(function() {
          if (messages.length) {
            logAppend(messages.reverse().join('\n'));
          }
          messages = [];
        }, 300);

        return function(msg) {
          messages.push(msg);
          throttledFlush();
        };
      })();

      var oldMakeCEvent = SDL.makeCEvent;
      SDL.makeCEvent = function(event, ptr) {
        logAsync(
          `${Math.floor(performance.now())}ms: ${event.type} button=${
            event.button
          }`
        );
        return oldMakeCEvent(event, ptr);
      };
    }
  }
})();
