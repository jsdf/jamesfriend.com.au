I've been working on a [Nintendo 64 game](https://twitter.com/ur_friend_james/status/1198844583557435392). Making a new game for an old console like this seems like a pretty esoteric pursuit, but a lot of people have been diving into creating retrogames recently. I think a big part of the appeal (apart from nostalgia) is that making a AAA-quality game in 2020 is a massive undertaking; a much larger task than any one person can complete in a reasonable time frame. Building a game to the standards of complexity and visual fidelity of the 80s or 90s is a much more achievable goal for an individual.

Beyond that, most small games these days are built on top of pre-existing game engines. Building a game for an old console, on the other hand, generally requires writing a game engine from scratch. This is a pretty interesting area for learning: rendering, 3D mesh formats, texture formats, audio and music sequencing formats, visiblility determination, physics, collision detection and response are just a sample of the topics that you might need to learn to build a game from scratch.

The Nintendo 64 is an interesting console to work with, because you write code in C, with a 3D rendering API that strongly resembles OpenGL 1.0. That means not having to deal with the tedium of assembly, and that you get low level 3D rendering stuff like drawing triangles, texture mapping, and Gourad shading for free.

The project I've been working on is a [de-make](https://en.wikipedia.org/wiki/Video_game_remake#Demakes) of the most memorable and meme-worthy game of last year, [Untitled Goose Game](https://goose.game/). I chose to remake an existing game because creating an original game world and new game mechanics is a lot of work in and of itself, and I think getting a game up and running on the N64 is enough work as it is.

There are basically two options for making an N64 game these days:
- the official Nintendo SDK from the 90s, which comes in Windows 95 and SGI IRIX flavours. Using this software is legally sketchy, but it's very old and I don't think there's much harm in hobbyists making non-commerical games with it. You can find it on [ultra64.ca](https://ultra64.ca/).
- the modern open source toolchain, which centers on the [libdragon](https://github.com/DragonMinded/libdragon) library and tools. The open source toolchain has come a long way, but at this stage it is still more low-level than the Nintendo SDK, and is especially limited in the area of 3D rendering.

As I wanted to build a game of similar quality to commercially released N64 games, I chose the N64 SDK. RetroReversing has a [pretty good tutorial for installing and using the SDK](https://www.retroreversing.com/n64-sdk-setup) under Wine. Interestingly it is probably easier to run on macOS or Linux using Wine than on a modern version of Windows, probably owing to the fact that this is Windows 95-era software. You can also find a lot of useful information on the [N64Brew Discord](https://discord.gg/KERXwaT).

The N64 SDK comes with a small framework for quickly starting a new game, called NuSystem. The N64 comes with an OS (really, a library that you link into your game binary and boot on the bare metal), which provides features like threads and I/O, but still requires a fair bit of boilerplate to get a game engine set up. NuSystem removes the need to think about threads and initializing the hardware, and just lets you provide the typical init(), update(), and draw() callbacks that form the core of many simple game engines.

## Rendering

On the N64, at a high level the procedure for rendering graphics looks something like this:

- start a new a 'display list' (a list of commands to draw stuff on screen, that is stored in memory)
- calculate projection and modelview matrices based on camera position and properties (type of projection, field of view, aspect ratio)
- build up the display list by iterating through world objects and adding commands to transform the current drawing position/rotation/scale using transformation matrices, and then draw model meshes, potentially with some texture and lighting settings
- send the display list off as a 'graphics task' to the RCP ('Reality Co-Processor', basically the GPU of the N64) to be rendered

Rendering on the N64 is a cooperative act between the main CPU, which runs the game logic and produces the list of things to draw, and the RCP, which performs the drawing of one frame while the main CPU moves on to running the logic and producing the display list for the next frame. To do this, we will need to allocate some structures to hold the displaylists and other data that will be shared between the code which runs on the main CPU (our program) and the code which runs on the RCP (called 'microcode', provided in binary form as part of the SDK). We need to allocate separate instances of this shared data for each frame, and switch which instance we're using when starting a new frame, like a circular buffer.

```c
#define MAX_GRAPHICS_TASKS 2
#define MAX_DISPLAY_LIST_COMMANDS 2048
#define MAX_OBJECTS 10

// a struct to hold graphics data used by the RCP when processing a task
typedef struct GraphicsTask {
  Mtx projection;
  Mtx modelview;
  Mtx objectTransforms[MAX_OBJECTS];
  Gfx displayList[MAX_DISPLAY_LIST_COMMANDS];
} GraphicsTask;

int graphicsTaskNum = 0;
GraphicsTask graphicsTasks[MAX_GRAPHICS_TASKS];

// Pointer to the end of the displaylist we are currently working on.
// A lot of the example code uses a global variable for this because otherwise
// you'd need to pass this around (by reference) a lot.
Gfx * displayListPtr;

// switch to the next graphics task
GraphicsTask * gfxSwitchTask() {
  GraphicsTask * nextTask;
  // switch the current graphics task
  graphicsTaskNum = (graphicsTaskNum + 1) % MAX_GRAPHICS_TASKS;
  nextTask = &graphicsTasks[graphicsTaskNum];
  displayListPtr = &nextTask->displayList[0];
  return nextTask;
}

```

For our 'game' code, we want to 

```c
// a 3d position, such as that of an object
typedef struct Vec3d {
  float x;
  float y;
  float z;
} Vec3d;

// the position and orientation of the camera
Vec3d cameraPos = {-200.0f, -200.0f, -200.0f};
Vec3d cameraTarget = {0.0f, 0.0f, 0.0f};
Vec3d cameraUp = {0.0f, 1.0f, 0.0f};

// the positions of the squares we're gonna draw
#define NUM_SQUARES 5
struct Vec3d squares[NUM_SQUARES] = {
  {0.0f, 0.0f, 0.0f},
  {0.0f, 0.0f, 0.0f},
  {0.0f, 0.0f, 0.0f},
  {0.0f, 0.0f, 200.0f},
  {0.0f, 0.0f, -100.0f},
};

int squaresRotations[NUM_SQUARES] = {
  0,
  20,
  40,
  40,
  40,
};

// this is a boolean but the older version of C used by the N64 compiler
// (roughly C89), doesn't have a bool type, so we just use integers
int squaresRotationDirection = 0;

```

## The Matrix Stack

Another concept that's worth understanding before we dive into the code is the 'matrix stack'. This concept comes directly from OpenGL 1.0 (which makes sense as both the Nintendo 64 hardware and OpenGL were developed by SGI). If you're put off by matrix math, don't worry, you don't need to understand it to make use of this feature. If you've used 2D drawing APIs like Turtle graphics or the Canvas2DContext in the HTML Canvas API, you'll be familiar with moving the drawing position by applying successive relative transformations such as translation, rotation and scaling, and this is very similar. The matrix stack is a stack data structure of matrices representing transformations of current drawing position in 3D space, which can be pushed onto and popped off. Pushing a matrix onto the stack effectively means applying a relative transformation to the drawing position which we can later undo by popping it back off. This allows rendering of hierarchical structures which might have transformations relative to some parent object, such as the positions and rotations of the wheels of a car relative to the car, and the car itself positioned and rotated in relation to the world. Modern OpenGL no longer includes this concept in its API, but for the N64 being able to offload the work of performing the matrix math (to transform objects in 3D space) to the RCP necessitated this sort of API.


```c

// the 'draw' function
void makeDL00() {
  // in our version of C, variables must be declared at the top of a function
  // or block scope
  unsigned short perspNorm;
  GraphicsTask * gfxTask;
  Gfx * displayListStart;
  
  // switch the current graphics task
  // also updates the displayListPtr global variable
  gfxTask = gfxSwitchTask();
  // keep track of start
  displayListStart = displayListPtr;


  // Prepare the RCP for rendering a graphics task.
  // This is part of the NuSystem boilerplate copied from one of the sample programs
  gfxRCPInit();
  // clear the color framebuffer and Z-buffer, similar to glClear()
  gfxClearCfb();
 
  // Initialize the projection matrix, similar to glPerspective() or glm::perspective()
  // This function is part of the N64 SDK. You can google 'guPerspective' if you
  // want to read about this or any other function in the original N64 SDK docs,
  // as they have been uploaded by various hobbyists and are well indexed by
  // search engines.
  guPerspective(&gfxTask->projection, &perspNorm, FOVY, ASPECT, NEAR_PLANE,
                FAR_PLANE, 1.0);

  // Our first actual displaylist command. This writes the command as a value at
  // the end of the current display list, and we increment the display list
  // pointer, ready for the next command to be written.
  // As for what this command does... it's just required when using a perspective
  // projection. 
  gSPPerspNormalize(displayListPtr++, perspNorm);

  // initialize the modelview matrix, similar to gluLookAt() or glm::lookAt()
  guLookAt(&gfxTask->modelview, cameraPos.x, cameraPos.y,
           cameraPos.z, cameraTarget.x, cameraTarget.y,
           cameraTarget.z, cameraUp.x, cameraUp.y, cameraUp.z);

  // load the projection matrix into the matrix stack.
  // given the combination of G_MTX_flags we provide, effectively this means
  // "replace the projection matrix with this new matrix"
  gSPMatrix(
    displayListPtr++,
    // we use the OS_K0_TO_PHYSICAL macro to convert the pointer to this matrix
    // from a virtual memory address into a real/physical address as required by the RCP 
    OS_K0_TO_PHYSICAL(&(gfxTask->projection)),
    // these flags tell the graphics microcode what to do with this matrix
    // documented here: http://n64devkit.square7.ch/tutorial/graphics/1/1_3.htm
    G_MTX_PROJECTION | // using the projection matrix stack...
    G_MTX_LOAD | // don't multiply matrix by previously-top matrix in stack
    G_MTX_NOPUSH // don't push another matrix onto the stack before operation
  );
  
  gSPMatrix(displayListPtr++,
    OS_K0_TO_PHYSICAL(&(gfxTask->modelview)),
    // similarly this combination means "replace the modelview matrix with this new matrix"
    G_MTX_MODELVIEW | G_MTX_NOPUSH | G_MTX_LOAD
  );

  // we can use block scope to declare variables in the middle of a function
  {
    int i;
    for (i = 0; i < NUM_SQUARES; ++i)
    {
      drawSquare(gfxTask, i);
    }
  }

  // mark the end of the display list
  gDPFullSync(displayListPtr++);
  gSPEndDisplayList(displayListPtr++);

  // assert that the display list isn't longer than the memory allocated for it,
  // otherwise we would have corrupted memory when writing it.
  // isn't unsafe memory access fun?
  assert(displayListPtr - displayListStart < MAX_DISPLAY_LIST_COMMANDS);

  // create a graphics task to render this displaylist and send it to the RCP
  nuGfxTaskStart(
    displayListStart,
    (int)(displayListPtr - displayListStart) * sizeof (Gfx),
    NU_GFX_UCODE_F3DEX, // load the 'F3DEX' version graphics microcode, which runs on the RCP to process this display list
    NU_SC_SWAPBUFFER // tells NuSystem to immediately display the frame on screen after the RCP finishes rendering it
  );
}
 
```


```c
// A static array of model vertex data.
// This include the position (x,y,z), texture U,V coords (called S,T in the SDK)
// and vertex color values in r,g,b,a form.
// As this data will be read by the RCP via direct memory access, which is
// required to be 16-byte aligned, it's a good idea to annotate it with the GCC
// attribute `__attribute__((aligned (16)))`, to force it to be 16-byte aligned.
Vtx squareVerts[] __attribute__((aligned (16))) = {
  //  x,   y,  z, flag, S, T,    r,    g,    b,    a
  { -64,  64, -5,    0, 0, 0, 0x00, 0xff, 0x00, 0xff  },
  {  64,  64, -5,    0, 0, 0, 0x00, 0x00, 0x00, 0xff  },
  {  64, -64, -5,    0, 0, 0, 0x00, 0x00, 0xff, 0xff  },
  { -64, -64, -5,    0, 0, 0, 0xff, 0x00, 0x00, 0xff  },
};

void drawSquare(GraphicsTask* gfxTask, int i) {
  Vec3d* square = &squares[i];
  // create a transformation matrix representing the position of the square
  guPosition(
    &gfxTask->objectTransforms[i],
    // rotation
    squaresRotations[i], // roll
    0.0f, // pitch
    0.0f, // heading
    1.0f, // scale
    // position
    square->x, square->y, square->z
  );

  // push relative transformation matrix
  gSPMatrix(displayListPtr++,
    OS_K0_TO_PHYSICAL(&(gfxTask->objectTransforms[i])),
    G_MTX_MODELVIEW | // operating on the modelview matrix stack...
    G_MTX_PUSH | // ...push another matrix onto the stack...
    G_MTX_MUL // ...which is multipled by previously-top matrix (eg. a relative transformation)
  );

  // load vertex data for the triangles
  gSPVertex(displayListPtr++, &(squareVerts[0]), 4, 0);
  // depending on which graphical features, the RDP might need to spend 1 or 2
  // cycles to render a primitive, and we need to tell it which to do
  gDPSetCycleType(displayListPtr++, G_CYC_1CYCLE);
  // use antialiasing, rendering an opaque surface
  gDPSetRenderMode(displayListPtr++, G_RM_AA_ZB_OPA_SURF, G_RM_AA_ZB_OPA_SURF2);
  // reset any rendering flags set when drawing the previous primitive
  gSPClearGeometryMode(displayListPtr++,0xFFFFFFFF);
  // enable smooth (gourad) shading and z-buffering
  gSPSetGeometryMode(displayListPtr++, G_SHADE | G_SHADING_SMOOTH | G_ZBUFFER);

  // actually the triangles, using the specified vertices
  gSP2Triangles(displayListPtr++,0,1,2,0,0,2,3,0);

  // Mark that we've finished sending commands for this particular primitive.
  // This is needed to prevent race conditions inside the rendering hardware in 
  // the case that subsequent commands change rendering settings.
  gDPPipeSync(displayListPtr++);

  // pop the matrix that we added back off the stack, to move the drawing position 
  // back to where it was before we rendered this object
  gSPPopMatrix(displayListPtr++, G_MTX_MODELVIEW);
}
```


The engine also supports rendering animated characters, playing back multiple keyframed animations for each.
 taking a 'scene' exported from Blender as a set of initial environment and entity object positions, and individual textured meshes imported from .OBJ files using [Wavefront64](https://github.com/tfcat/Wavefront64).