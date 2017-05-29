It's somewhat difficult to find instructions on how to successfully install Pygame for Python 3 on Yosemite. The front page of the Pygame website has a link which appears to point to installation instructions, but it is broken.

Fortunately, someone posted [these instructions](http://pygame.org/wiki/macintosh) on the Pygame wiki:

Firstly, ensure you have the Apple Xcode command line tools installed:

```
xcode-select --install

```

Install XQuartz from [http://xquartz.macosforge.org/landing/](http://xquartz.macosforge.org/landing/). Restart your computer so the newly installed XQuartz is used.

Make sure you have [homebrew](http://brew.sh/) installed:

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

```

Ensure the homebrew-installed binaries take precedence over system binaries in your `$PATH`

```
# in ~/.bash_profile
# Homebrew binaries now take precedence over Apple defaults
export PATH=/usr/local/bin:$PATH

```

Use homebrew to install Python3 and Pygame dependencies, as well as Mercurial (`hg`), which we need to install Pygame from Bitbucket:

```
brew install python3 hg sdl sdl_image sdl_mixer sdl_ttf portmidi

```

Install Pygame from Bitbucket:

```
pip3 install hg+https://bitbucket.org/pygame/pygame

```