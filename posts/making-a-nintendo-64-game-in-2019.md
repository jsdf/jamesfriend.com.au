I've been working on a [Nintendo 64 game](https://twitter.com/ur_friend_james/status/1198844583557435392). Making a new game for an old console like this seems like a pretty esoteric pursuit, but a lot of people have been diving into creating retrogames recently. I think a big part of the appeal (apart from nostalgia) is that making a AAA-quality game in 2019 is a massive undertaking, a much larger task than any one person can complete in a reasonable time frame. Building a game to the standards of complexity and visual fidelity of the 80s or 90s is a much more achievable goal.

Beyond that, most small games these days are built on top of pre-existing game engines. Building a game for an old console generally requires writing a game engine from scratch. This is a pretty interesting area for learning. Rendering, 3D mesh formats, texture formats, audio and music sequencing formats, visiblility determination, physics, collision detection and response are just a sample of the topics that you might need to learn to build a game from scratch.

Nintendo 64 is an interesting console to work with, because you write code in C, with a 3D rendering API that strongly resembles OpenGL 1.0. That means not having to deal with the tedium of assembly, and that you get low level 3D rendering stuff like triangle rasterization, shading and texture mapping for free. If you really want to you could take a crack at writing your own graphics 'microcode' [in MIPS assembly](https://github.com/pseudophpt/pseultra/blob/master/n64/ucode/src/psm3d.sx), which is basically like writing shaders directly in the language of the GPU. I don't have much appetite for this however.

The project I've been working on is a [de-make](https://en.wikipedia.org/wiki/Video_game_remake#Demakes) of the most memorable and meme-worthy game of the year, [Untitled Goose Game](https://goose.game/). I chose to remake an existing game because creating an original game world and new game mechanics is a lot of work in and of itself, and I think getting a game up and running on the N64 is enough work as it is.


To get started, I wanted to get some existing code successfully compiling and running in an emulator or on an [EverDrive 64](https://n64today.com/2017/01/29/everdrive-64-guide/) cartridge. On [ultra64.ca](https://ultra64.ca/) you can find the original Software development kit

I started by building a 3D game engine which uses a typical GameObject pattern, rendering one or more textured meshes associated with each GameObject, with the position and rotation associated with the GameObject. On the N64, that looks something like this:




The engine also supports rendering animated characters, playing back multiple keyframed animations for each.
 taking a 'scene' exported from Blender as a set of initial environment and entity object positions, and individual textured meshes imported from .OBJ files using [Wavefront64](https://github.com/tfcat/Wavefront64).