[Emscripten](https://github.com/kripken/emscripten) is an awesome tool for porting existing native codebases to the browser. There are a bunch of cool projects using it to port graphical applications such as games and emulators, especially those which already use the [SDL library](http://www.libsdl.org/) as a cross-platform video, sound and I/O abstraction. Leveraging the fact that the SDL abstractions provide portability across different OS platforms means that by implementing of parts of SDL in Javascript and compiling the code via Emscripten, the browser can become (with some caveats) another SDL target platform. However, Emscripten's SDL 'shims' are still very much a work in progress, and in a current project of my own (porting a classic Mac OS emulator), I've run into some parts where I've had to fill in the gaps myself.

Specifically, if you're finding your SDL-based, Emscripten compiled app is failing to render to the canvas, the issue may be that the app is trying to use the incomplete `SDL_CreateRGBSurfaceFrom` method to create an SDL surface from a buffer of pixels.

The following log message appearing in the Javascript console is a possible giveaway:

```
TODO: Partially unimplemented SDL_CreateRGBSurfaceFrom called!

```

I've written a basic implementation of this method which you can add to Emscripten's `library_sdl.js`, to be included in your compiled app. It should work when supplied with a 24-bit colour pixel buffer (or 32-bit with alpha) provided the channels are in RGB (or RGBA) order.

```
SDL_CreateRGBSurfaceFrom: function(pixels, width, height, depth, pitch, rmask, gmask, bmask, amask) {
  // TODO: Take into account depth and pitch parameters.

  var surface = SDL.makeSurface(width, height, 0, false, 'CreateRGBSurfaceFrom', rmask, gmask, bmask, amask);

  var surfaceData = SDL.surfaces[surface];
  var surfaceImageData = surfaceData.ctx.getImageData(0, 0, width, height);
  var surfacePixelData = surfaceImageData.data;

  // Fill pixel data to created surface.
  // Supports SDL_PIXELFORMAT_RGBA8888 and SDL_PIXELFORMAT_RGB888
  var channels = amask ? 4 : 3; // RGBA8888 or RGB888
  for (var pixelOffset = 0; pixelOffset < width*height; pixelOffset++) {
    surfacePixelData[pixelOffset*4+0] = HEAPU8[pixels + (pixelOffset*channels+0)]; // R
    surfacePixelData[pixelOffset*4+1] = HEAPU8[pixels + (pixelOffset*channels+1)]; // G
    surfacePixelData[pixelOffset*4+2] = HEAPU8[pixels + (pixelOffset*channels+2)]; // B
    surfacePixelData[pixelOffset*4+3] = amask ? HEAPU8[pixels + (pixelOffset*channels+3)] : 0xff; // A
  };

  surfaceData.ctx.putImageData(surfaceImageData, 0, 0);

  return surface;
},

```

You can paste in the above function to replace the existing partial implementation in the `src/library_sdl.js` file under wherever you've installed Emscripten.

I chose to support those specific pixel formats because `SDL_PIXELFORMAT_RGBA8888` is the one which Emscripten currently sets on all surfaces, and `SDL_PIXELFORMAT_RGB888` seems like a common choice also (as not all apps are likely to use an alpha channel). It's also the format which was necessary for the application I'm working on.