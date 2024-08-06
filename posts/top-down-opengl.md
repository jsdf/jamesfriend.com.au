# Learning OpenGL from the Top Down

I've tried and failed to learn OpenGL (and WebGL) several times before really 'getting it'. I attribute this to the way that OpenGL tutorials are typically structured, which is to attempt to teach you about every piece of the OpenGL API that is needed for each step of the tutorial. This is a lot of things to throw at you all at once, and gets very far into the weeds of OpenGL's design when you probably just want to know how to render a 3D scene.

This is sometimes referred to as 'bottom-up learning', where all of the building blocks of a concept or system are taught before they are utilitzed. I find this learning style is difficult for me because it often involves memorizing a lot of boring details before actually seeing the bigger picture of how they are applied to something that I actually find interesting, or that I can see will achieve the outcome that I'm looking for.

The contrasting approach is referred to as 'top-down learning', where first some larger pieces are presented without immediately fully explaining how they work, but simply showing how they can acheive some useful (and hopefully, interesting) outcome. Then, more complexity is progressively introduced to break down each of the larger pieces, until you understand things to the desired level of depth. In this post I'm going to try to present an essential core understanding of OpenGL in this manner.

Let's start with a typical, flexible set of abstractions for building a 3D scene. You will find abstractions such as these in most modern game engines and realtime 3D software, like Blender, Godot Game Engine and Three.js.


- Scene
	- Object
		- Transform
		- Geometry
		- Material

You can see a natural hierarchy forming here. A Scene is a collection of Objects. Objects are things which can be rendered (drawn on the screen). Objects have some properties:

- a Transform: a position, rotation and scale applied to the object
- a Geometry: a set of points in 3D space called vertices which can be connected by edges to form faces. This geometry can be rendered, either by filling in the faces, or, in the case of wireframe rendering, simply drawing the edges as lines
- a Material: information about how the surface of faces should be filled in, or 'shaded' using Shaders. Shaders are programs you write which run on the GPU.

