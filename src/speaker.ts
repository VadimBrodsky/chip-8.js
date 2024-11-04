export class Speaker {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private destinationNode: AudioDestinationNode;
  private oscillatorNode: OscillatorNode;

  constructor() {
    this.audioContext = new window.AudioContext();

    // create gain to control the volume
    this.gainNode = this.audioContext.createGain();
    this.destinationNode = this.audioContext.destination;
    this.gainNode.connect(this.destinationNode);

    this.oscillatorNode = this.audioContext.createOscillator();
  }

  public mute() {
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
  }

  public unmute() {
    this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
  }

  public play(frequency = 440) {
    // set the frequency
    this.oscillatorNode.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    // square the wave
    this.oscillatorNode.type = "square";
    this.oscillatorNode.connect(this.gainNode);
    this.oscillatorNode.start();
  }

  public stop() {
    this.oscillatorNode.stop();
    this.oscillatorNode.disconnect();
  }
}
