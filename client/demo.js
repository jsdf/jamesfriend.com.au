import * as THREE from 'three';
import Scroller from './demo/Scroller';
import {Noise} from 'noisejs';

const noise = new Noise(Math.random());

function createRenderLoop(draw) {
  let run = true;
  function step() {
    if (run) {
      requestAnimationFrame(() => {
        draw();
        step();
      });
    }
  }

  step();

  return () => {
    run = false;
  };
}

let generateParticles = true;

export function attachDemo(canvas) {
  canvas.width = window.innerWidth;
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.width / canvas.height,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.setSize(canvas.width, canvas.height);
  renderer.setClearColor(0xffffff, 1);

  var cube = makeCube();

  scene.add(cube);
  cube.material.opacity = 0;
  camera.position.x = 10;
  camera.lookAt(cube.position);

  scene.fog = new THREE.FogExp2(0xffffff, 0.01);
  const particleObj = new THREE.Group();
  const particlesMap = new Map();

  particleObj.position.y = 0;
  particleObj.position.x = 100;
  particleObj.position.z = 0;
  particleMaterial.wireframe = true;

  const particleScroller = new Scroller({
    rowSize: 1,
    windowSize: 100,
    startOffset: 0,
    enter: (pos, index) => {
      if (generateParticles) {
        const particle = makeParticle(index);
        particlesMap.set(index, particle);
        particleObj.add(particle);
      }
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

  let frame = 0;
  return createRenderLoop(() => {
    frame++;
    // fade in
    const intensity = frame / 300 < Math.PI / 2 ? Math.sin(frame / 300) : 1;

    particleObj.position.x += 0.1;
    particleScroller.update(-particleObj.position.x);
    // particleMaterial.color.setHex(getColor(gradient, 1));
    // particleMaterial.wireframe = intensity < 0.7;
    particleMaterial.opacity = intensity;
    renderer.render(scene, camera);
  });
}

const particleMaterial = new THREE.MeshBasicMaterial({
  color: 0xffe259,
  transparent: true,
});

function makeCube() {
  var geometry = new THREE.BoxGeometry(3, 3, 3);

  var material = new THREE.MeshBasicMaterial({
    color: 0xffe259,
    transparent: true,
  });
  return new THREE.Mesh(geometry, material);
}

function makeSphere(customMaterial) {
  const geometry = new THREE.IcosahedronGeometry(3, 0);

  const material =
    customMaterial ||
    new THREE.MeshBasicMaterial({
      color: 0xffe259,
      transparent: true,
    });
  return new THREE.Mesh(geometry, material);
}

function makeParticle(x) {
  const particle = makeSphere(particleMaterial);
  const y = Math.random();

  const height = Math.abs(noise.perlin2(x / 100, y) * 100);
  particle.position.set(x - 50, height - 10, y * 100 - 50);

  return particle;
}
