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
    // Array of hex values for each sprite, each sprite is 5 bytes
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

  public cycle() {
    for (let i = 0; i < this.speed; i++) {
      if (!this.paused) {
        let optcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
        this.executeInstruction(optcode);
      }
    }

    if (!this.paused) {
      this.updateTimers();
    }

    this.playSound();
    this.renderer.render();
  }

  public executeInstruction(opcode: number) {
    // increment the program counter to prepare it for the next instruction
    // each instruction is 2 bytes long, so increment it by 2
    this.pc += 2;
    // we only need the 2nd nibble, so grab the value of the 2nd nibble
    // and shift it right 8 bits to get rid of everything but that 2nd nibble
    let x = (opcode & 0x0f00) >> 8;
    // we only need the 3rd nibble, so grab the value of the 3rd nibble
    // and shift it right 4 bits to get rid of everything but that 3rd nibble
    let y = (opcode & 0x00f0) >> 4;

    switch (opcode & 0xf000) {
      case 0x0000:
        switch (opcode) {
          case 0x00e0:
            break;
          case 0x00ee:
            break;
        }
        break;
      case 0x1000:
        break;
      case 0x2000:
        break;
      case 0x3000:
        break;
      case 0x4000:
        break;
      case 0x5000:
        break;
      case 0x6000:
        break;
      case 0x7000:
        break;
      case 0x8000:
        switch (opcode & 0xf) {
          case 0x0:
            break;
          case 0x1:
            break;
          case 0x2:
            break;
          case 0x3:
            break;
          case 0x4:
            break;
          case 0x5:
            break;
          case 0x6:
            break;
          case 0x7:
            break;
          case 0xe:
            break;
        }
        break;
      case 0x9000:
        break;
      case 0xa000:
        break;
      case 0xb000:
        break;
      case 0xc000:
        break;
      case 0xd000:
        break;
      case 0xe000:
        switch (opcode & 0xff) {
          case 0x9e:
            break;
          case 0xa1:
            break;
        }
        break;
      case 0xf000:
        switch (opcode & 0xff) {
          case 0x07:
            break;
          case 0x0a:
            break;
          case 0x15:
            break;
          case 0x18:
            break;
          case 0x1e:
            break;
          case 0x29:
            break;
          case 0x33:
            break;
          case 0x55:
            break;
          case 0x65:
            break;
        }
        break;
      default:
        throw new Error("Unknown opcode " + opcode);
    }
  }

  public updateTimers() {
    if (this.delayTimer > 0) {
      this.delayTimer -= 1;
    }

    // keep playing the sound if the soundTimer is set
    if (this.soundTimer > 0) {
      this.soundTimer -= 1;
    }
  }

  public playSound() {
    if (this.soundTimer > 0) {
      this.speaker.play(440);
    } else {
      this.speaker.stop();
    }
  }
}
