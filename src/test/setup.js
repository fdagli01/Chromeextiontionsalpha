import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'

// jsdom has no Web Audio. The review screen legitimately plays stings the
// moment a card loads, so without a stub every component test that reaches
// a card logs an unhandled construction error — noise that would hide a
// real one. Silent no-op nodes keep the call sites honest.
class StubAudioNode {
  connect(next) { return next }
  disconnect() {}
  start() {}
  stop() {}
}
const stubParam = () => ({
  value: 0,
  setValueAtTime() {},
  linearRampToValueAtTime() {},
  exponentialRampToValueAtTime() {},
  setTargetAtTime() {},
})
globalThis.AudioContext = class {
  currentTime = 0
  state = 'running'
  destination = new StubAudioNode()
  sampleRate = 44100
  resume() { return Promise.resolve() }
  createOscillator() { return Object.assign(new StubAudioNode(), { type: 'sine', frequency: stubParam(), detune: stubParam() }) }
  createGain() { return Object.assign(new StubAudioNode(), { gain: stubParam() }) }
  createBiquadFilter() { return Object.assign(new StubAudioNode(), { type: 'lowpass', frequency: stubParam(), Q: stubParam() }) }
  createBufferSource() { return Object.assign(new StubAudioNode(), { buffer: null, loop: false, playbackRate: stubParam() }) }
  createBuffer(channels, length) { return { length, getChannelData: () => new Float32Array(length) } }
  createStereoPanner() { return Object.assign(new StubAudioNode(), { pan: stubParam() }) }
  createConvolver() { return Object.assign(new StubAudioNode(), { buffer: null, normalize: true }) }
  createDelay() { return Object.assign(new StubAudioNode(), { delayTime: stubParam() }) }
  createWaveShaper() { return Object.assign(new StubAudioNode(), { curve: null, oversample: 'none' }) }
  createDynamicsCompressor() {
    return Object.assign(new StubAudioNode(), {
      threshold: stubParam(), knee: stubParam(), ratio: stubParam(), attack: stubParam(), release: stubParam(),
    })
  }
}
