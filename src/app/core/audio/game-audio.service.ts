import { Injectable } from '@angular/core';
import { ItemKind } from '../../features/catch-trash/models/falling-item.model';

@Injectable({ providedIn: 'root' })
export class GameAudioService {
  private context?: AudioContext;
  private master?: GainNode;

  unlock(): void {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') void this.context.resume();
  }

  playCatch(_kind: ItemKind): void {
    this.tone(620, 0.09, 0, 'sine', 0.34, 920);
    this.tone(920, 0.08, 0.07, 'sine', 0.26, 1120);
  }

  playBatteryHit(): void {
    this.noise(0.16, 0.36);
    this.tone(150, 0.22, 0, 'sawtooth', 0.34, 58);
  }

  playTruckBounce(): void {
    this.tone(520, 0.065, 0, 'triangle', 0.24, 360);
    this.tone(860, 0.045, 0.018, 'sine', 0.17, 610);
    this.noise(0.025, 0.065);
  }

  private tone(frequency: number, duration: number, delay = 0, type: OscillatorType = 'sine', volume = 0.3, endFrequency = frequency): void {
    if (!this.context || !this.master) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  private noise(duration: number, volume: number): void {
    if (!this.context || !this.master) return;
    const sampleCount = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, sampleCount, this.context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index++) channel[index] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    source.connect(gain);
    gain.connect(this.master);
    source.start();
  }
}
