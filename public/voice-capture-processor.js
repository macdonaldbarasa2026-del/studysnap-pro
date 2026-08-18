class VoiceCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.inputSampleRate = sampleRate;
    this.targetSampleRate = 16000;
    this.step = this.inputSampleRate / this.targetSampleRate;
    this.buffer = [];
    this.position = 0;
    this.output = [];
    this.chunkSize = 320; // 20 ms at 16 kHz
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input.length || !input[0]?.length) return true;

    const frames = input[0].length;
    let sum = 0;
    for (let i = 0; i < frames; i++) {
      let sample = 0;
      for (let ch = 0; ch < input.length; ch++) sample += input[ch][i] || 0;
      sample /= input.length;
      this.buffer.push(sample);
      sum += sample * sample;
    }

    const rms = Math.sqrt(sum / frames);
    this.port.postMessage({ rms });

    while (this.position + 1 < this.buffer.length) {
      const i = Math.floor(this.position);
      const frac = this.position - i;
      const sample = this.buffer[i] + (this.buffer[i + 1] - this.buffer[i]) * frac;
      this.output.push(Math.max(-1, Math.min(1, sample)));
      this.position += this.step;

      if (this.output.length >= this.chunkSize) {
        const pcm = new Int16Array(this.chunkSize);
        for (let j = 0; j < this.chunkSize; j++) {
          const s = this.output[j];
          pcm[j] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        this.output.splice(0, this.chunkSize);
        this.port.postMessage({ pcm: pcm.buffer }, [pcm.buffer]);
      }
    }

    const remove = Math.max(0, Math.floor(this.position) - 1);
    if (remove > 0) {
      this.buffer.splice(0, remove);
      this.position -= remove;
    }
    return true;
  }
}

registerProcessor('voice-capture-processor', VoiceCaptureProcessor);
