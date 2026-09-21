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

  playStart(): void {
    this.unlock();
    [440, 560, 760].forEach((frequency, index) => this.tone(frequency, 0.07, index * 0.11, 'sine', 0.38));
  }

  playCatch(kind: ItemKind): void {
    const glassKinds: ItemKind[] = ['glass', 'brokenGlass'];
    const metalKinds: ItemKind[] = ['can', 'tin', 'foilTray'];
    const paperKinds: ItemKind[] = ['box', 'paper', 'newspaper', 'magazine', 'pizzaBox'];
    const frequency = glassKinds.includes(kind) ? 980 : metalKinds.includes(kind) ? 680 : paperKinds.includes(kind) ? 440 : 540;
    const wave: OscillatorType = glassKinds.includes(kind) ? 'sine' : metalKinds.includes(kind) ? 'triangle' : 'sine';
    this.tone(frequency, 0.075, 0, wave, 0.3, frequency * 1.14);
  }

  playBounce(): void {
    this.tone(210, 0.11, 0, 'square', 0.22, 115);
  }

  playBatteryHit(): void {
    this.noise(0.16, 0.36);
    this.tone(150, 0.22, 0, 'sawtooth', 0.34, 58);
  }

  playTick(): void {
    this.tone(820, 0.055, 0, 'sine', 0.24);
  }

  playFinish(success: boolean): void {
    const notes = success ? [523, 659, 784] : [330, 247, 196];
    notes.forEach((frequency, index) => this.tone(frequency, 0.14, index * 0.12, 'triangle', 0.3));
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
