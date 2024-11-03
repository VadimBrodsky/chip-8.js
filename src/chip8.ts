import { Renderer } from "./renderer";

let renderer = new Renderer(10);
let loop: number;
let fps = 60;
let fpsInterval: number;
let startTime: number;
let now: number;
let then: number;
let elapsed: number;

function init() {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;

  renderer.testRender();
  renderer.render();

  loop = requestAnimationFrame(step);
}

function step() {
  now = Date.now();
  elapsed = now - then;

  if (elapsed > fpsInterval) {
    // cycle the CPU
  }

  loop = requestAnimationFrame(step);
}

init();
