export class InputOutput {
  static async fetchRom(romUrl: string) {
    let response = await fetch(romUrl);
    let buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }
}
