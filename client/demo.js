import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  FogExp2,
  Group,
  Raycaster,
  Vector2,
  MeshBasicMaterial,
  BoxGeometry,
  Mesh,
  IcosahedronGeometry,
} from 'three';
import Scroller from './demo/Scroller';
import {Noise} from 'noisejs';
import throttle from './throttle';

const noise = new Noise(Math.random());

const VIEWPORT_HEIGHT = 800;

let stats = null;
if (process.env.NODE_ENV !== 'production') {
  import('stats.js').then(({default: Stats}) => {
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
  });
}

function createRenderLoop(draw) {
  let run = true;
  function step() {
    if (run) {
      stats?.begin();
      requestAnimationFrame(() => {
        draw();
        stats?.end();
        step();
      });
    }
  }

  step();

  return {
    stop() {
      run = false;
    },
    start() {
      if (!run) {
        run = true;
        step();
      }
    },
  };
}

function dpr() {
  return window.devicePixelRatio || 1;
}

export function attachDemo(canvas) {
  const scene = new Scene();

  const camera = new PerspectiveCamera(
    75,
    canvas.width / canvas.height,
    0.1,
    1000
  );

  const renderer = new WebGLRenderer({canvas, antialias: true});
  renderer.setClearColor(0xffffff, 1);

  function updateCanvasSize() {
    canvas;
    canvas.height = VIEWPORT_HEIGHT;
    canvas.width = window.innerWidth;
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
    // renderer.setPixelRatio(dpr()); // retina
  }

  updateCanvasSize();

  let cube = makeCube();

  scene.add(cube);
  cube.material.opacity = 0;
  camera.position.x = 10;
  camera.lookAt(cube.position);

  scene.fog = new FogExp2(0xffffff, 0.012);
  const particleObj = new Group();
  const particlesMap = new Map();

  particleObj.position.y = 0;
  particleObj.position.x = 100;
  particleObj.position.z = 0;
  particleMaterial.wireframe = true;

  const particleScroller = new Scroller({
    rowSize: 1,
    windowSize: 200,
    startOffset: 0,
    enter: (pos, index) => {
      const particle = makeParticle(index);
      particlesMap.set(index, particle);
      particleObj.add(particle);
    },
    exit: (pos, index) => {
      const particle = particlesMap.get(index);
      if (particle) {
        particle.geometry.dispose();
        particle.material.dispose();
        particleObj.remove(particle);
        particlesMap.delete(index);
      }
    },
  });

  scene.add(particleObj);

  let raycaster = new Raycaster();

  let isTouching = false;
  let mousePos = new Vector2(2, 2); // start outside -1 to +1 range

  let frame = 0;
  const renderLoop = createRenderLoop(() => {
    frame++;
    // fade in
    const intensity = frame / 300 < Math.PI / 2 ? Math.sin(frame / 300) : 1;

    if (isTouching) {
      // update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mousePos, camera);
      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects([...particlesMap.values()]);

      for (const intersect of intersects) {
        intersect.object.material = particleSelectMaterial;
      }
    }

    particleObj.position.x += 0.1;
    particleScroller.update(-particleObj.position.x);
    // particleMaterial.color.setHex(getColor(gradient, 1));
    // particleMaterial.wireframe = intensity < 0.7;
    particleMaterial.opacity = intensity;
    renderer.render(scene, camera);
  });

  function onMouseMove(event) {
    let rect = canvas.getBoundingClientRect();
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mousePos.x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
    mousePos.y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;
  }

  const onResize = throttle(() => {
    updateCanvasSize();
  }, 50);

  function onScroll(e) {
    if (window.scrollY > VIEWPORT_HEIGHT) {
      renderLoop.stop();
    } else {
      renderLoop.start();
    }
  }

  window.addEventListener('pointermove', onMouseMove, false);
  window.addEventListener('mousemove', () => {
    isTouching = true;
  });
  window.addEventListener('touchstart', () => {
    isTouching = true;
  });
  window.addEventListener('touchend', () => {
    isTouching = false;
  });
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll);
}

const particleMaterial = new MeshBasicMaterial({
  color: 0x03efba,
  transparent: true,
  wireframe: true,
});

const particleSelectMaterial = new MeshBasicMaterial({
  color: 0x03efba,
  transparent: true,
  wireframe: false,
});

function makeCube() {
  let geometry = new BoxGeometry(3, 3, 3);

  let material = new MeshBasicMaterial({
    color: 0xffe259,
    transparent: true,
  });
  return new Mesh(geometry, material);
}

function makeSphere(customMaterial) {
  const geometry = new IcosahedronGeometry(3, 0);

  const material =
    customMaterial ||
    new MeshBasicMaterial({
      color: 0xffe259,
      transparent: true,
    });
  return new Mesh(geometry, material);
}

function makeParticle(x) {
  const particle = makeSphere(particleMaterial);
  const y = Math.random();

  const height = Math.abs(noise.perlin2(x / 100, y) * 100);
  particle.position.set(x - 50, height - 10, y * 100 - 50);

  return particle;
}
