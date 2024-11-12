import terminal from "virtual:terminal";
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
  private stack: number[];
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
            this.renderer.clear();
            break;
          case 0x00ee:
            this.pc = this.stack.pop();
            break;
        }
        break;
      case 0x1000:
        this.pc = opcode & 0xfff;
        break;
      case 0x2000:
        this.stack.push(this.pc);
        this.pc = opcode & 0xfff;
        break;
      case 0x3000:
        if (this.registers[x] === (opcode & 0xff)) {
          this.pc += 2;
        }
        break;
      case 0x4000:
        if (this.registers[x] !== (opcode & 0xff)) {
          this.pc += 2;
        }
        break;
      case 0x5000:
        if (this.registers[x] === this.registers[y]) {
          this.pc += 2;
        }
        break;
      case 0x6000:
        this.registers[x] = opcode & 0xff;
        break;
      case 0x7000:
        this.registers[x] += opcode & 0xff;
        break;
      case 0x8000:
        switch (opcode & 0xf) {
          case 0x0:
            this.registers[x] = this.registers[y];
            break;
          case 0x1:
            this.registers[x] |= this.registers[y];
            break;
          case 0x2:
            this.registers[x] &= this.registers[y];
            break;
          case 0x3:
            this.registers[x] ^= this.registers[y];
            break;
          case 0x4:
            let sum = (this.registers[x] += this.registers[y]);
            this.registers[0xf] = 0;
            if (sum > 0xff) {
              this.registers[0xf] = 1;
            }
            this.registers[x] = sum;
            break;
          case 0x5:
            this.registers[0xf] = 0;
            if (this.registers[x] > this.registers[y]) {
              this.registers[0xf] = 1;
            }
            this.registers[x] -= this.registers[y];
            break;
          case 0x6:
            this.registers[0xf] = this.registers[x] & 0x1;
            this.registers[x] >>= 1;
            break;
          case 0x7:
            this.registers[0xf] = 0;
            if (this.registers[y] > this.registers[x]) {
              this.registers[0xf] = 1;
            }
            this.registers[x] = this.registers[y] - this.registers[x];
            break;
          case 0xe:
            this.registers[0xf] = this.registers[x] & 0x80;
            this.registers[x] <<= 1;
            break;
        }
        break;
      case 0x9000:
        if (this.registers[x] !== this.registers[y]) {
          this.pc += 2;
        }
        break;
      case 0xa000:
        this.address = opcode & 0xfff;
        break;
      case 0xb000:
        this.pc = (opcode & 0xfff) + this.registers[0];
        break;
      case 0xc000:
        let rand = Math.floor(Math.random() * 0xff);
        this.registers[x] = rand & (opcode & 0xff);
        break;
      case 0xd000:
        let width = 8;
        let height = opcode & 0xf;
        this.registers[0xf] = 0;
        for (let row = 0; row < height; row++) {
          let sprite = this.memory[this.address + row];
          for (let col = 0; col < width; col++) {
            // if the bit (sprite) is not 0, render/erase the pixel
            if ((sprite & 0x80) > 0) {
              // if setPixel returns 1, means a pixel was erased, set VF to 1
              if (this.renderer.setPixel(this.registers[x] + col, this.registers[y] + row)) {
                this.registers[0xf] = 1;
              }
            }
            // shift the sprite left 1
            // this moves the next col/bit of the sprite into the first position
            // Ex. 10010000 << 1 will become 0010000
            sprite <<= 1;
          }
        }
        break;
      case 0xe000:
        switch (opcode & 0xff) {
          case 0x9e:
            if (this.keyboard.isKeyPressed(this.registers[x])) {
              this.pc += 2;
            }
            break;
          case 0xa1:
            if (!this.keyboard.isKeyPressed(this.registers[x])) {
              this.pc += 2;
            }
            break;
        }
        break;
      case 0xf000:
        switch (opcode & 0xff) {
          case 0x07:
            this.registers[x] = this.delayTimer;
            break;
          case 0x0a:
            this.paused = true;
            this.keyboard.onNextKeyPress = (key) => {
              this.registers[x] = key;
              this.paused = false;
            };
            break;
          case 0x15:
            this.delayTimer = this.registers[x];
            break;
          case 0x18:
            this.soundTimer = this.registers[x];
            break;
          case 0x1e:
            this.address += this.registers[x];
            break;
          case 0x29:
            this.address = this.registers[x] * 5;
            break;
          case 0x33:
            // get the hundreds digits and place it in I
            this.memory[this.address] = parseInt(this.registers[x] / 100);
            // get the tens digit and place it in I+1, gets a value between 0 and 99
            // then divides by 10 to give us a value between 0 and 9
            this.memory[this.address + 1] = parseInt((this.registers[x] % 100) / 10);
            // get the value of the ones (last) digit and place it in I+2
            this.memory[this.address + 2] = parseInt(this.registers[x] % 10);
            break;
          case 0x55:
            for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
              this.memory[this.address + registerIndex] = this.registers[registerIndex];
            }
            break;
          case 0x65:
            for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
              this.registers[registerIndex] = this.memory[this.memory + registerIndex];
            }
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
