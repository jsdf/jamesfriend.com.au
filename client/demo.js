import throttle from './throttle';

const VIEWPORT_HEIGHT = 800;

// vec3 helpers
function C(a) {
  a.x = 0;
  a.y = 0;
  a.z = 0;
}
function D(a = 0, b = 0, c = 0) {
  return {x: a, y: b, z: c};
}
function E(a, b) {
  a.x = b.x;
  a.y = b.y;
  a.z = b.z;
}
function G(a) {
  const b = D();
  return (b.x = a.x), (b.y = a.y), (b.z = a.z), b;
}
function J(a) {
  let b;
  0 == a.x && 0 == a.y && 0 == a.z ||
    ((b = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)),
    (a.x /= b),
    (a.y /= b),
    (a.z /= b));
}
function L(a) {
  return a.x * a.x + a.y * a.y + a.z * a.z;
}
function M(a, b) {
  return (a.x += b.x), (a.y += b.y), (a.z += b.z), a;
}
function N(a, b) {
  return (a.x -= b.x), (a.y -= b.y), (a.z -= b.z), a;
}
function O(a, b) {
  return (a.x *= b), (a.y *= b), (a.z *= b), a;
}
function P(a, b, c) {
  c.x = a.y * b.z - a.z * b.y;
  c.y = a.z * b.x - a.x * b.z;
  c.z = a.x * b.y - a.y * b.x;
}
function R(a, b) {
  return N(a, O(G(b), 2 * (a.x * b.x + a.y * b.y + a.z * b.z)));
}

let fa = 1 / 60;

function S(a, b, c, g, e = []) {
  return {
    id: g,
    l: a,
    W: 1 / a,
    I: b,
    na: b * b,
    A: 1,
    enabled: true,
    v: true,
    position: c,
    H: c,
    o: D(),
    m: D(),
    acceleration: D(),
    Y: D(),
    Z: D(),
    D: e,
  };
}

function ha(a, b, c) {
  let g = D();
  O(a.acceleration, a.W);
  E(a.Y, a.acceleration);
  O(a.acceleration, b);
  M(a.m, a.acceleration);
  E(a.o, a.m);
  O(a.o, b);
  O(a.o, c);
  E(g, a.position);
  M(g, a.o);
  E(a.H, a.position);
  E(a.position, g);
  E(a.Z, a.acceleration);
  C(a.acceleration);
}

let A = {
  width: 0,
  height: 0,
  cr: 190,
  ch: 60,
  cd: 25,
  time: 0,
  normalMode: 0,
  bls: [],
  mou: [0, 0, 0],
  mou2: [0, 0, 0],
  msz: 2,
};

for (let U = 0; 15 > U; U++) {
  A.bls[3 * U] = 4 * Math.random();
  A.bls[3 * U + 1] = 4 * Math.random();
  A.bls[3 * U + 2] = 4 * Math.random();
}

let da = {bls: '3fv'};
let V = false;

function W(a, b) {
  for (let c = 0; c < a.length; c++) M(b, a[c].position);
  a = a.length;
  b.x /= a;
  b.y /= a;
  b.z /= a;
  return b;
}

let ia = D(0, 1, 0),
  ja = D();

function X(a, b, c, g = false, e) {
  let f = D();
  E(f, a.position);
  N(f, c);
  c = Math.sqrt(L(f));
  null != e && c > e || (J(f), O(f, g ? 1 / c : c), O(f, b), M(a.acceleration, f));
}

let ka = D(),
  la = D(),
  T = D(),
  Y = D();

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl, uniforms) {
  const vert = createShader(
    gl,
    35633,
    'precision lowp float;attribute vec2 vposndc;const vec2 a=vec2(0.5,0.5);void main(){gl_Position=vec4(vposndc,0.0,1.0);}'
  );
  const frag = createShader(
    gl,
    35632,
    'precision highp float;uniform float width;uniform float height;uniform float cr;uniform float ch;uniform float cd;uniform vec3 bls[15];uniform vec3 mou;uniform vec3 mou2;uniform float msz;uniform float time;uniform float normalMode;const int a=50;float b(vec2 c){float d=dot(c,vec2(127.1,311.7));return fract(sin(d)*43758.5453123);}float e(in vec2 c){vec2 f=floor(c);vec2 g=fract(c);vec2 h=g*g*(3.0-2.0*g);return -1.0+2.0*mix(mix(b(f+vec2(0.0,0.0)),b(f+vec2(1.0,0.0)),h.x),mix(b(f+vec2(0.0,1.0)),b(f+vec2(1.0,1.0)),h.x),h.y);}float i(vec3 c,float j){return sin(j+1.1*c.x)*sin(j+1.1*c.y)*cos(j+1.1*c.z);}float k(vec3 c,float l){return length(c)-l;}float m(float n,float o,float p){vec2 h=max(vec2(p-n,p-o),vec2(0));return max(p,min(n,o))-length(h);}float q(float n,float o,float p){return min(n,o);}float r(vec3 c,float p){float j=time/1000.;return k(c,p)+i(c,j);}vec2 s(vec3 c){float t=4.;vec3 u=bls[0];float v=k(c+u,1.);for(int w=1;w<15;w++){vec3 x=bls[w];v=m(k(c+x,1.),v,t);}return vec2(v,0.0);}vec2 y(vec3 z,vec3 A,float B,float C){float D=C*2.0;float E=+0.0;float F=-1.0;vec2 G=vec2(-1.0,-1.0);for(int f=0;f<a;f++){if((D)<C||E>B) break;vec2 H=s(z+A*E);D=H.x;F=H.y;E+=D;}if(E<B){G=vec2(E,F);}return G;}vec2 I(vec3 z,vec3 A){return y(z,A,200.0,0.0001);}vec3 J(vec3 K,float L){const vec3 M=vec3(1.0,-1.0,-1.0);const vec3 N=vec3(-1.0,-1.0,1.0);const vec3 O=vec3(-1.0,1.0,-1.0);const vec3 P=vec3(1.0,1.0,1.0);return normalize(M*s(K+M*L).x+N*s(K+N*L).x+O*s(K+O*L).x+P*s(K+P*L).x);}vec3 Q(vec3 K){return J(K,0.001);}mat3 R(vec3 S,vec3 T,float U){vec3 V=vec3(sin(U),cos(U),0.0);vec3 W=normalize(T-S);vec3 X=normalize(cross(W,V));vec3 Y=normalize(cross(X,W));return mat3(X,Y,W);}vec3 Z(mat3 ba,vec2 bb,float bc){return normalize(ba*vec3(bb,bc));}vec3 Z(vec3 S,vec3 T,vec2 bb,float bc){mat3 ba=R(S,T,0.0);return Z(ba,bb,bc);}vec2 bd(vec2 be){vec2 bf=2.0*(gl_FragCoord.xy/be.xy)-1.0;bf.x*=be.x/be.y;return bf;}void bg(in float bh,in float bi,in float bj,in vec2 bk,out vec3 z,out vec3 bl){vec2 bb=bd(bk);vec3 bm=vec3(0.0);float bn=3.1415;z=vec3(bj*sin(bh*bn/360.0)*cos(bi*bn/360.0),bj*sin(bi*bn/360.0),bj*cos(bh*bn/360.0)*cos(bi*bn/360.0));bl=Z(z,bm,bb,2.0);}void main(){vec3 bo=vec3(0.0);vec3 bp,bq;bg(cr,ch,cd,vec2(width,height),bp,bq);vec2 j=I(bp,bq);if(j.x>-0.5){vec3 K=bp+bq*j.x;vec3 br=Q(K);if(normalMode>0.5){bo=br*0.5+0.5;}else{bo=vec3(1.,1.,1.)*(1./((j.x/10.0)-0.5));}gl_FragColor.rgb=bo;gl_FragColor.a=1.0;}else{gl_FragColor.rgb=vec3(normalMode>0.5?1.0:0.0);gl_FragColor.a=1.0;}}'
  );
  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  return {
    $: program,
    C: Object.fromEntries(
      ['vposndc'].map((d) => [d, gl.getAttribLocation(program, d)])
    ),
    fa: Object.fromEntries(
      Object.keys(uniforms).map((d) => [d, gl.getUniformLocation(program, d)])
    ),
  };
}

function drawScene(state, gl, prog) {
  gl.useProgram(prog.$);
  if (null == state.B) {
    state.B = gl.createBuffer();
    gl.bindBuffer(34962, state.B);
    gl.bufferData(
      34962,
      new Float32Array([1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1]),
      35044
    );
  }
  gl.bindBuffer(34962, state.B);
  gl.enableVertexAttribArray(prog.C.vposndc);
  gl.vertexAttribPointer(prog.C.vposndc, 2, 5126, false, 0, 0);

  Object.entries(A).forEach(([f, d]) => {
    let h = prog.fa[f];
    if (da && da[f]) gl[`uniform${da[f]}`](h, d);
    else if ('number' == typeof d) gl.uniform1f(h, d);
    else if (Array.isArray(d)) gl[`uniform${d.length}fv`](h, d);
  });
  gl.drawArrays(4, 0, 6);
  gl.bindBuffer(34962, null);
}

export function attachDemo(canvas) {
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

  function updateColorMode() {
    const isLight = prefersLight.matches;
    A.normalMode = isLight ? 1 : 0;
    gl.clearColor(isLight ? 1 : 0, isLight ? 1 : 0, isLight ? 1 : 0, 1);
  }
  updateColorMode();
  prefersLight.addEventListener('change', updateColorMode);

  const F = {width: 0, height: 0};

  function updateCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    F.width = window.innerWidth;
    F.height = VIEWPORT_HEIGHT;
    canvas.width = F.width * dpr;
    canvas.height = F.height * dpr;
    canvas.style.width = F.width + 'px';
    canvas.style.height = F.height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  updateCanvasSize();

  const prog = createProgram(gl, A);
  const renderState = {B: null};

  // physics state
  const physicsState = {
    G: {g: 0, h: 0, ca: 1, J: 1, N: true, ia: {ka: -9.8, ga: 0.9}, T: ha},
    u: [],
  };
  physicsState.G.A = 0.99;

  const forces = [
    function (d) {
      let h = D();
      E(h, ka);
      N(h, d.position);
      let m = L(h);
      J(h);
      m = Math.sqrt(m);
      O(h, m);
      O(h, 0.5);
      6 < m && M(d.acceleration, h);
    },
    function (d) {
      X(d, 10, Y, true);
    },
  ];

  const particles = physicsState.u;
  for (let d = 0; 15 > d; d++) {
    particles[d] = S(
      1,
      1,
      {x: 4 * Math.random() - 2, y: 4 * Math.random() - 2, z: 4 * Math.random() - 2},
      d,
      forces
    );
  }
  const savedParticles = particles.slice();

  // mouse sphere (U is a unique id beyond the 15 particles)
  const mouseParticle = S(50, A.msz, {x: 0, y: 0, z: 0}, 15, [
    function (d) {
      E(d.position, T);
      E(d.H, T);
    },
  ]);
  mouseParticle.v = false;
  particles.push(mouseParticle);

  let dragState = null;

  function updateMouseRay(event) {
    const h = F;
    const m = A.cr;
    const k = A.ch;
    const p = A.cd / 2;
    let lx = (event.clientX / h.width) * 2 - 1;
    let ly = (event.clientY / h.height) * 2 - 1;
    const camPos = D(
      p * Math.sin((3.1415 * m) / 360) * Math.cos((3.1415 * k) / 360),
      p * Math.sin((3.1415 * k) / 360),
      p * Math.cos((3.1415 * m) / 360) * Math.cos((3.1415 * k) / 360)
    );
    const fovScale = p * Math.tan((90 * Math.PI) / 180 * 0.5);
    const aspectScale = (h.width / h.height) * fovScale;
    let v = G(ja);
    N(v, camPos);
    J(v);
    let t = D();
    P(ia, v, t);
    J(t);
    let w = D();
    P(v, t, w);
    v = G(v);
    O(v, p);
    const p2 = G(camPos);
    N(p2, v);
    const pw = G(w);
    O(pw, fovScale);
    const kt = G(t);
    O(kt, aspectScale);
    const hitPos = M(O(G(kt), lx), O(G(pw), ly));
    const rayDir = N(G(camPos), hitPos);
    const result = [M(O(G(rayDir), 0.5), camPos), hitPos];
    const [yy, B] = result;
    E(Y, B);
    E(T, B);
    A.mou2 = [yy.x, yy.y, yy.z];
  }

  canvas.style.cursor = 'none';
  canvas.addEventListener('pointerdown', (d) => {
    dragState = {K: d.clientX, L: d.clientY, ea: A.cr, da: A.ch, i: 0, j: 0};
    updateMouseRay(d);
  });
  canvas.addEventListener('pointermove', (d) => {
    if (dragState && 2 < Math.abs(dragState.i) + Math.abs(dragState.j)) {
      // dragging — update camera angles
    } else {
      updateMouseRay(d);
    }
    if (dragState) {
      dragState.i = dragState.K - d.clientX;
      dragState.j = dragState.L - d.clientY;
      if (2 < Math.abs(dragState.i) + Math.abs(dragState.j)) {
        A.cr = dragState.ea + dragState.i;
        A.ch = Math.min(180, Math.max(-180, dragState.da - dragState.j));
      }
    }
  });
  canvas.addEventListener('pointerup', () => {
    dragState = null;
  });
  document.body.addEventListener('keydown', (d) => {
    if (' ' === d.key) V = true;
  });
  document.body.addEventListener('keyup', (d) => {
    if (' ' === d.key) V = false;
  });

  let running = true;

  function frame() {
    if (!running) return;

    if (V) {
      const parts = savedParticles;
      const center = W(parts, D());
      for (let f = 0; f < parts.length; f++) X(parts[f], 3, center, false, 10);
    }

    A.time = performance.now();
    W(savedParticles, la);

    const a = physicsState.G;
    const f = physicsState.u;
    const e = f.length;
    let d = A.time;

    if (0 == a.h) a.h = d;
    let hTime = a.N ? d : a.h + 16.667 * a.J * a.ca;
    let mDelta = hTime - a.h;

    if (0 < mDelta) {
      const drag = 1 - a.ia.ga;
      a.h = hTime;
      1 > a.g && (a.g += 0.001 * mDelta);
      const stepSize = fa * a.J;

      while (a.g >= stepSize) {
        // apply forces
        for (let k = 0; k < e; k++) {
          const p = f[k];
          if (p.enabled) {
            for (let H = 0; H < p.D.length; H++) {
              p.D[H](p, stepSize, drag, f, e, a);
            }
          }
        }
        // integrate
        for (let k = 0; k < e; k++) {
          const p = f[k];
          if (p.enabled) a.T(p, stepSize, drag);
        }
        // collision
        for (let col = 0; 5 > col; col++) {
          let anyCollision = false;
          for (let l = 0; l < e; l++) {
            const k = f[l];
            if (k.enabled && k.v) {
              let w = D(),
                y = D(),
                B = D();
              let collided = false;
              for (let Q = 0; Q < e; Q++) {
                const t = f[Q];
                if (k != t && t.enabled && t.v) {
                  C(w);
                  C(y);
                  E(w, t.position);
                  N(w, k.position);
                  let z = L(w);
                  E(y, w);
                  J(y);
                  const I = k.I + t.I;
                  if (z <= I * I) {
                    collided = true;
                    z = Math.sqrt(z);
                    let sepDist = I - z;
                    const totalMass = k.l + t.l;
                    const kRatio = t.l / totalMass;
                    const tRatio = k.l / totalMass;
                    const F2 = B;
                    const K2 = -kRatio;
                    E(F2, w);
                    J(F2);
                    O(F2, sepDist * K2);
                    M(k.position, B);
                    E(B, w);
                    J(B);
                    O(B, sepDist * tRatio);
                    M(t.position, B);
                    O(R(k.m, O(G(y), -1)), k.A);
                    O(R(t.m, y), t.A);
                  }
                }
              }
              anyCollision = collided || anyCollision;
            }
          }
          if (!anyCollision) break;
        }
        a.g -= stepSize;
        break;
      }
    }

    A.width = canvas.width;
    A.height = canvas.height;
    for (let c = 0; 15 > c; c++) {
      const p = savedParticles[c];
      A.bls[3 * c] = p.position.x;
      A.bls[3 * c + 1] = p.position.y;
      A.bls[3 * c + 2] = p.position.z;
    }
    A.mou[0] = mouseParticle.position.x;
    A.mou[1] = mouseParticle.position.y;
    A.mou[2] = mouseParticle.position.z;

    gl.clear(16384);
    drawScene(renderState, gl, prog);

    requestAnimationFrame(frame);
  }

  const onResize = throttle(() => {
    updateCanvasSize();
  }, 50);

  function onScroll() {
    if (window.scrollY > VIEWPORT_HEIGHT) {
      running = false;
    } else if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll);

  requestAnimationFrame(frame);
}
