import { terminal } from "virtual:terminal";
import { Keyboard } from "./keyboard";
import { Renderer } from "./renderer";
import { Speaker } from "./speaker";
import { InputOutput } from "./io";
import { CPU } from "./cpu";

let renderer = new Renderer(10);
let keyboard = new Keyboard();
let speaker = new Speaker();
let cpu = new CPU({ renderer, keyboard, speaker });

let loop: number;
let fps = 60;
let fpsInterval: number;
let startTime: number;
let now: number;
let then: number;
let elapsed: number;

async function init() {
  terminal.log("Chip8 init");
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;

  const rom = await InputOutput.fetchRom("/roms/1-chip8-logo.ch8");

  cpu.loadSpritesIntoMemory();
  cpu.loadProgramIntoMemory(rom);

  loop = requestAnimationFrame(step);
}

function step() {
  now = Date.now();
  elapsed = now - then;

  if (elapsed > fpsInterval) {
    cpu.cycle();
  }

  loop = requestAnimationFrame(step);
}

init();
