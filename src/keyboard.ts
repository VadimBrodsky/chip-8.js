export class Keyboard {
  private KEYMAP = {
    49: 0x1, // 1
    50: 0x2, // 2
    51: 0x3, // 3
    52: 0xc, // 4
    81: 0x4, // Q
    87: 0x5, // W
    69: 0x6, // E
    82: 0xd, // R
    65: 0x7, // A
    83: 0x8, // S
    68: 0x9, // D
    70: 0xe, // F
    90: 0xa, // Z
    88: 0x0, // X
    67: 0xb, // C
    86: 0xf, // V
  };
  private keysPressed: [];
  private onNextKeyPress: (() => void) | null;

  constructor() {
    this.keysPressed = {};

    // Some Chip-8 instructions require waiting for the next keypress
    this.onNextKeyPress = null;

    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  public onKeyUp() {}

  public isKeyPressed(keyCode: string) {
    return this.keysPressed[keyCode];
  }

  public onKeyDown(event: KeyboardEvent) {
    let key = this.KEYMAP[event.which];
    this.keysPressed[key] = true;
  }
}
