import { terminal } from "virtual:terminal";
import { Keyboard } from "./keyboard";
import { Renderer } from "./renderer";
import { Speaker } from "./speaker";
import { InputOutput } from "./io";

let renderer = new Renderer(10);
let keyboard = new Keyboard();
let speaker = new Speaker();

let loop: number;
let fps = 60;
let fpsInterval: number;
let startTime: number;
let now: number;
let then: number;
let elapsed: number;

function init() {
  terminal.log("Chip8 init");
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

InputOutput.fetchRom("/roms/1-chip8-logo.ch8")
  .then(() => {
    terminal.log("successfully fetched the rom");
  })
  .catch(() => {
    terminal.error("failed to fetch the rom");
  });
