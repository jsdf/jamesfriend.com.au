I decided to install and play around with Pygame today, mainly as an excuse to write some Python for a minor departure from all the Javascript/Coffeescript I've been writing lately. Unfortunately the process wasn't entirely frictionless, due to Pygame not yet accounting for Apple's move to XQuartz as the recommended X11 implementation for Mac OS as of 10.8 Mountain Lion. As a result I ran into some compilation errors while Pygame was building it's native extensions, which fortunately were not too hard to fix as I had some familiarity with changes to X11 on Mountain Lion.

**TL;DR** [you need to set some environment variables before installing Pygame](https://jamesfriend.com.au/installing-pygame-python-mac-os-108-mountain-lion#node_6_tldr)

### What didn't work

Running `pip install pygame` would fail as follows:

```
building 'pygame.display' extension
cc -fno-strict-aliasing -fno-common -dynamic -I/usr/local/include -DNDEBUG -g -O3 -Wall -Wstrict-prototypes -Ddarwin -I/Library/Frameworks/SDL.framework/Versions/Current/Headers -I/usr/local/Cellar/python/2.7.3/Frameworks/Python.framework/Versions/2.7/include/python2.7 -c src/display.c -o build/temp.macosx-10.8-x86_64-2.7/src/display.o
In file included from src/display.c:30:
/Library/Frameworks/SDL.framework/Versions/Current/Headers/SDL_syswm.h:58:10: fatal error: 'X11/Xlib.h' file not found
#include <X11/Xlib.h>
             ^
1 error generated.
error: command 'cc' failed with exit status 1

```

While building the native extention 'pygame.display', Xlib.h (a particular X11 header, required by SDL) is not found, as XQuartz's `/opt/X11/include` directory has not been specified to search for headers.

By setting some environment variables, we can configure the Pygame build process to build correctly. I found these in a few other blog posts, but they specified only `-arch i386` for CFLAGS, LDFLAGS and ARCHFLAGS, which allowed the build process to complete, but `import pygame` fails (when running 64bit Python):

```
>>> import pygame
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/usr/local/lib/python2.7/site-packages/pygame/__init__.py", line 95, in <module>
    from pygame.base import *
ImportError: dlopen(/usr/local/lib/python2.7/site-packages/pygame/base.so, 2): no suitable image found.  Did find:
/usr/local/lib/python2.7/site-packages/pygame/base.so: mach-o, but wrong architecture

```

### <a id="node_6_tldr"></a>What actually got Pygame working

The environment variables (gcc flags) required to allow Pygame to correctly build fat binaries (for both 32bit and 64bit Python) are:

```
export CC='/usr/bin/gcc'
export CFLAGS='-isysroot /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.8.sdk -I/opt/X11/include -arch i386 -arch x86_64'
export LDFLAGS='-arch i386 -arch x86_64'
export ARCHFLAGS='-arch i386 -arch x86_64'

```

Then `pip install pygame` and `python -c 'import pygame'`. If no error is returned by Python, then you should now have a working installation of Pygame.

### Additional details

I'm using homebrew-installed Python/pip, and I've set my $PATH with `/usr/local/bin` before the system-installed Python.

If you haven't installed Python/pip via homebrew (you're using the system-installed Python), you would likely need to run `sudo pip install pygame`.

If you're using another install method, such as easy_install, this fix should still work.

Before running `pip install pygame`, I had also installed [Command Line Tools for XCode](https://developer.apple.com/downloads/index.action) ([walkthrough](http://docwiki.embarcadero.com/RADStudio/XE4/en/Installing_the_Xcode_Command_Line_Tools_on_a_Mac)), as well as [XQuartz](http://xquartz.macosforge.org/landing/), and the following homebrew packages: `brew install sdl sdl_image sdl_mixer sdl_ttf smpeg portmidi`.

If homebrew fails to install `smpeg` you might need to do the following:

```
brew tap homebrew/headonly
brew install --HEAD smpeg

```