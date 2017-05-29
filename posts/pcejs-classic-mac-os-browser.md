![PCE.js](/files/pcejs.png)


I've just completed porting Hampa Hug's excellent [PCE](http://www.hampa.ch/pce/) emulator to run in the browser, using Emscripten. I've mainly focused on the pce-macplus build. This is pretty awesome because it means you can run classic Mac OS in the browser. Check it out: [PCE.js - Classic Mac OS in the browser](/pce-js/).

I've also got the pce-ibmpc build working (emulating an IBM compatible, up to a 286 CPU), and and pce-atarist, an Atari ST emulator also, with browser demos coming soon for each.

A dump of the source is available [here](/pce-js/pcejs20131028.zip) but I'll try to clean it up and make it available on GitHub when I get the chance.

**Update: source on [GitHub](https://github.com/jsdf/pce), and I've added an [IBM PC Demo](/pce-js/ibmpc-games/).**