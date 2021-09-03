![Hypercard running in the SheepShaver emulator](/files/sheepshaver.png)

**Updated for macOS Big Sur**

A bunch of people have emailed me about getting Hypercard stacks running under emulation. Here is a pretty easy guide to running a Hypercard stack on a recent Mac:

Place the Hypercard stack you want to access somewhere within your user folder: eg. Documents, or Desktop.

Download [this zip file](/hypercard/hypercard2021.zip) [95mb] containing the [SheepShaver](http://sheepshaver.cebix.net/) classic Mac emulator bundled with Mac OS 9 and Hypercard.

Extract the zip file. It contains an app called SheepShaver, and a file called `hypercard.sheepvm`. Double click the `hypercard.sheepvm` file. This should open a window containing Mac OS 9, which will boot up. If it doesn't work (SheepShaver immediately quits) you can try dragging and dropping `hypercard.sheepvm` onto the SheepShaver app.

On the Mac OS 9 desktop there should be a disk called "Unix". This is a virtual disk which actually lets you access files on your computer (eg. outside the emulator). Opening it is equivalent to opening your OS X `/Users/` directory.

From there, navigate to your user folder (eg. your macOS username) and then to the folder you placed your Hypercard stack (in the first step).

Copy your Hypercard stack from the 'Unix' disk to somewhere on the OS 9 'Macintosh HD' disk.

Double-click the Hypercard stack in the location you placed it on the OS 9 'Macintosh HD' disk (or open it from within Hypercard).