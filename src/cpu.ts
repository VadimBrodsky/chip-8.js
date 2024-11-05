import type { Keyboard } from "./keyboard";
import type { Renderer } from "./renderer";
import type { Speaker } from "./speaker";

export class CPU {
  private renderer: Renderer;
  private keyboard: Keyboard;
  private speaker: Speaker;
  private memory: Uint8Array;
  private registers: Uint8Array;
  private address: number;
  private delayTimer: number;
  private soundTimer: number;
  private pc: number;
  private stack: string[];
  private paused: Boolean;
  private speed: number;

  constructor(options: { renderer: Renderer; keyboard: Keyboard; speaker: Speaker }) {
    this.renderer = options.renderer;
    this.keyboard = options.keyboard;
    this.speaker = options.speaker;

    this.memory = new Uint8Array(4096); // 4kb (4096 bytes) of memory
    this.registers = new Uint8Array(16); // 16 8-bit registers
    this.address = 0; // memory addresses, 0 for now
    this.delayTimer = 0; // timers
    this.soundTimer = 0;
    this.pc = 0x200; // program counter, the currently executing address
    this.stack = new Array();
    this.paused = false; // some instructions require pausing
    this.speed = 10;
  }

  public loadSpritesIntoMemory() {
    // Array of hex values for each sprite
    // Each sprite is 5 bytes
    // prettier-ignore
    const sprites = [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
    ];

    // Sprites are stored in the interpreter section of memory starting at hex 0x000
    sprites.forEach((sprite, i) => {
      this.memory[i] = sprite;
    });
  }

  public loadProgramIntoMemory(program: Uint8Array) {
    for (let location = 0; location < program.length; location++) {
      this.memory[0x200 + location] = program[location];
    }
  }

  // 1-chip8-logo.ch8
  public async loadRom(romUrl: string) {
    let response = await fetch(romUrl);
    let buffer = await response.arrayBuffer();
    let rom = new Uint8Array(buffer);
    this.loadProgramIntoMemory(rom);
  }
}
