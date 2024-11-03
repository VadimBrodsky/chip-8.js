export class Renderer {
  private cols = 64;
  private rows = 32;

  private scale: number;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private display: number[];

  constructor(scale: number) {
    this.scale = scale;
    this.display = new Array(this.cols * this.rows);

    this.canvas = document.querySelector("canvas") || new HTMLCanvasElement();
    this.canvas.width = this.cols * this.scale;
    this.canvas.height = this.rows * this.scale;

    this.ctx = this.canvas.getContext("2d");
  }

  public setPixel(x: number, y: number) {
    let pixelLocation = this.getX(x) + this.getY(y) * this.cols;

    // sprites are XORed onto the display
    this.display[pixelLocation] ^= 1;

    // true - a pixel was erased
    // false - nothing was erased
    return !this.display[pixelLocation];
  }

  public clear() {
    this.display = new Array(this.cols * this.rows);
  }

  public render() {
    // clears the canvas every render cycle of the render loop
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.cols * this.rows; i++) {
      // grab the coordinates based on i
      let x = (i % this.cols) * this.scale;
      let y = Math.floor(i / this.cols) * this.scale;

      if (this.display[i] === 1 && this.ctx) {
        this.ctx.fillStyle = "#000"; // set the pixel to black
        this.ctx.fillRect(x, y, this.scale, this.scale); // draw the pixel
      }
    }
  }

  public testRender() {
    this.setPixel(0, 0);
    this.setPixel(5, 2);
  }

  // pixel position outside of the bounds of the display should wrap
  private getX(x: number) {
    if (x > this.cols) {
      return x - this.cols;
    }
    if (x < 0) {
      return x + this.cols;
    }
    return x;
  }

  // pixel position outside of the bounds of the display should wrap
  private getY(y: number) {
    if (y > this.rows) {
      return y - this.rows;
    }
    if (y < 0) {
      return y + this.rows;
    }
    return y;
  }
}
