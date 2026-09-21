import { Injectable, computed, inject, signal } from '@angular/core';
import { FallingItem, ItemKind } from '../models/falling-item.model';
import { GameAudioService } from '../../../core/audio/game-audio.service';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'finished';

@Injectable()
export class CatchTrashStore {
  private readonly audio = inject(GameAudioService);
  private readonly _status = signal<GameStatus>('ready');
  private readonly _score = signal(0);
  private readonly _lives = signal(5);
  private readonly _timeLeft = signal(45);
  private readonly _truckX = signal(50);
  private readonly _items = signal<FallingItem[]>([]);
  private readonly _damageFlash = signal(false);
  private frame?: number;
  private damageTimer?: ReturnType<typeof setTimeout>;
  private lastFrame = 0;
  private lastSpawn = 0;
  private itemId = 0;
  private secondAccumulator = 0;

  readonly status = this._status.asReadonly();
  readonly score = this._score.asReadonly();
  readonly lives = this._lives.asReadonly();
  readonly timeLeft = this._timeLeft.asReadonly();
  readonly truckX = this._truckX.asReadonly();
  readonly items = this._items.asReadonly();
  readonly damageFlash = this._damageFlash.asReadonly();
  readonly coins = computed(() => Math.floor(this._score() / 10));

  start(): void {
    this.stopLoop();
    this._score.set(0); this._lives.set(5); this._timeLeft.set(45); this._items.set([]); this._truckX.set(50);
    this._status.set('playing'); this.lastFrame = performance.now(); this.lastSpawn = 0; this.secondAccumulator = 0;
    this.audio.playStart();
    this.frame = requestAnimationFrame(t => this.tick(t));
  }

  togglePause(): void {
    if (this._status() === 'playing') { this._status.set('paused'); this.stopLoop(); }
    else if (this._status() === 'paused') { this._status.set('playing'); this.lastFrame = performance.now(); this.frame = requestAnimationFrame(t => this.tick(t)); }
  }

  moveTruck(percent: number): void { this._truckX.set(Math.max(10, Math.min(90, percent))); }
  destroy(): void { this.stopLoop(); if (this.damageTimer) clearTimeout(this.damageTimer); }

  private tick(time: number): void {
    if (this._status() !== 'playing') return;
    const elapsed = time - this.lastFrame;
    if (elapsed < 30) { this.frame = requestAnimationFrame(t => this.tick(t)); return; }
    const delta = Math.min(50, elapsed); this.lastFrame = time; this.secondAccumulator += delta;
    if (this.secondAccumulator >= 1000) { this.secondAccumulator -= 1000; this._timeLeft.update(v => v - 1); if (this._timeLeft() > 0 && this._timeLeft() <= 5) this.audio.playTick(); if (this._timeLeft() <= 0) { this.finish(); return; } }
    if (time - this.lastSpawn > Math.max(420, 920 - this._score() * 1.4)) { this.spawn(); this.lastSpawn = time; }
    const truckX = this._truckX();
    const truckGeometry = this.getTruckGeometry();
    const next: FallingItem[] = [];
    for (const item of this._items()) {
      const frameScale = delta / 16;
      const moved = {
        ...item,
        x: item.x + item.velocityX * frameScale,
        y: item.y + item.velocityY * frameScale,
        velocityY: item.bounced ? item.velocityY + 0.018 * frameScale : item.speed,
        rotation: item.rotation + delta * (item.bounced ? .18 : .06),
      };
      const offsetFromTruck = moved.x - truckX;
      const meetsTruckHeight = moved.y >= truckGeometry.catchTop && moved.y <= truckGeometry.catchBottom;
      const hitsBin = meetsTruckHeight && offsetFromTruck >= truckGeometry.binLeft && offsetFromTruck <= truckGeometry.binRight;
      const hitsCab = meetsTruckHeight && !moved.bounced && offsetFromTruck > truckGeometry.binRight && offsetFromTruck <= truckGeometry.cabRight;

      if (hitsBin) {
        if (moved.dangerous) { this._lives.update(v => v - 1); this.triggerDamageEffect(); this.audio.playBatteryHit(); if (navigator.vibrate) navigator.vibrate([70, 35, 110]); }
        else { this._score.update(v => v + 10); this.audio.playCatch(moved.kind); if (navigator.vibrate) navigator.vibrate(20); }
      } else if (hitsCab) {
        next.push({ ...moved, x: moved.x + 1.2, y: moved.y - 1.5, velocityX: 0.34, velocityY: -0.28, bounced: true, rotation: moved.rotation + 22 });
        this.audio.playBounce();
        if (navigator.vibrate) navigator.vibrate(12);
      } else if (moved.y < 104) next.push(moved);
    }
    this._items.set(next);
    if (this._lives() <= 0) { this.finish(); return; }
    this.frame = requestAnimationFrame(t => this.tick(t));
  }

  private spawn(): void {
    if (this._items().length >= 16) return;
    const pool: ItemKind[] = [
      'bottle',
      'can',
      'box',
      'banana',
      'cup',
      'paper',
      'glass',
      'tin',
      'wrapper',
      'bag',
      'carton',
      'newspaper',
      'magazine',
      'carrierBag',
      'brokenGlass',
      'yogurt',
      'appleCore',
      'pizzaBox',
      'foodBox',
      'foilTray',
      'detergent',
      'candyWrapper',
      'battery',
      'batterySmall',
    ];
    const kind = pool[Math.floor(Math.random() * pool.length)];
    const speed = 0.16 + Math.min(.12, this._score() / 6000);
    const dangerous = kind === 'battery' || kind === 'batterySmall';
    this._items.update(items => [...items, { id: ++this.itemId, kind, x: 8 + Math.random() * 84, y: -8, speed, velocityX: 0, velocityY: speed, rotation: Math.random() * 40 - 20, dangerous, bounced: false }]);
  }

  private getTruckGeometry(): { binLeft: number; binRight: number; cabRight: number; catchTop: number; catchBottom: number } {
    const landscape = window.innerWidth > window.innerHeight;
    const fieldWidth = landscape ? Math.min(window.innerWidth, window.innerHeight * 16 / 9) : window.innerWidth;
    const fieldHeight = landscape ? Math.min(window.innerHeight, window.innerWidth * 9 / 16) : window.innerHeight;
    const truckWidthPixels = Math.max(190, Math.min(340, fieldWidth * 0.24));
    const truckHeightPixels = truckWidthPixels / 1.5;
    const itemSizePixels = Math.max(34, Math.min(46, fieldWidth * 0.032));
    const truckWidthPercent = truckWidthPixels / fieldWidth * 100;
    const truckHeightPercent = truckHeightPixels / fieldHeight * 100;
    const itemRadiusPercent = itemSizePixels / fieldHeight * 50;
    const visibleBinTop = 95 - truckHeightPercent + truckHeightPercent * 0.2;
    const catchTop = visibleBinTop - itemRadiusPercent * 0.45;
    return {
      binLeft: -truckWidthPercent * 0.44,
      binRight: truckWidthPercent * 0.12,
      cabRight: truckWidthPercent * 0.44,
      catchTop,
      catchBottom: catchTop + Math.max(5, truckHeightPercent * 0.25),
    };
  }

  private triggerDamageEffect(): void {
    if (this.damageTimer) clearTimeout(this.damageTimer);
    this._damageFlash.set(false);
    requestAnimationFrame(() => {
      this._damageFlash.set(true);
      this.damageTimer = setTimeout(() => this._damageFlash.set(false), 430);
    });
  }

  private finish(): void { this.stopLoop(); this.audio.playFinish(this._lives() > 0); this._status.set('finished'); this._items.set([]); }
  private stopLoop(): void { if (this.frame) cancelAnimationFrame(this.frame); this.frame = undefined; }
}
