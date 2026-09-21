import { Injectable, computed, inject, signal } from '@angular/core';
import { FallingItem, ItemKind } from '../models/falling-item.model';
import { GameAudioService } from '../../../core/audio/game-audio.service';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'roundTransition' | 'finishing' | 'finished';

@Injectable()
export class CatchTrashStore {
  private readonly audio = inject(GameAudioService);
  private readonly _status = signal<GameStatus>('ready');
  private readonly _score = signal(0);
  private readonly _lives = signal(3);
  private readonly _timeLeft = signal(60);
  private readonly _round = signal(1);
  private readonly _loadLevel = signal(0);
  private readonly _truckX = signal(50);
  private readonly _items = signal<FallingItem[]>([]);
  private readonly _damageFlash = signal(false);
  private frame?: number;
  private damageTimer?: ReturnType<typeof setTimeout>;
  private finishTimer?: ReturnType<typeof setTimeout>;
  private roundTimer?: ReturnType<typeof setTimeout>;
  private lastFrame = 0;
  private lastSpawn = 0;
  private itemId = 0;
  private secondAccumulator = 0;
  private moveDirection: -1 | 0 | 1 = 0;

  readonly status = this._status.asReadonly();
  readonly score = this._score.asReadonly();
  readonly lives = this._lives.asReadonly();
  readonly timeLeft = this._timeLeft.asReadonly();
  readonly round = this._round.asReadonly();
  readonly loadLevel = this._loadLevel.asReadonly();
  readonly truckX = this._truckX.asReadonly();
  readonly items = this._items.asReadonly();
  readonly damageFlash = this._damageFlash.asReadonly();
  readonly coins = computed(() => Math.floor(this._score() / 10));

  start(): void {
    this.stopLoop();
    if (this.finishTimer) clearTimeout(this.finishTimer);
    if (this.roundTimer) clearTimeout(this.roundTimer);
    this._score.set(0); this._lives.set(3); this._timeLeft.set(60); this._round.set(1); this._loadLevel.set(0); this._items.set([]); this._truckX.set(50);
    this._status.set('playing'); this.lastFrame = performance.now(); this.lastSpawn = 0; this.secondAccumulator = 0;
    this.audio.unlock();
    this.frame = requestAnimationFrame(t => this.tick(t));
  }

  togglePause(): void {
    if (this._status() === 'playing') { this._status.set('paused'); this.stopLoop(); }
    else if (this._status() === 'paused') { this._status.set('playing'); this.lastFrame = performance.now(); this.frame = requestAnimationFrame(t => this.tick(t)); }
  }

  setMoveDirection(direction: -1 | 0 | 1): void { this.moveDirection = direction; }
  destroy(): void { this.stopLoop(); if (this.damageTimer) clearTimeout(this.damageTimer); if (this.finishTimer) clearTimeout(this.finishTimer); if (this.roundTimer) clearTimeout(this.roundTimer); }

  private tick(time: number): void {
    if (this._status() !== 'playing') return;
    const elapsed = time - this.lastFrame;
    if (elapsed < 30) { this.frame = requestAnimationFrame(t => this.tick(t)); return; }
    const delta = Math.min(50, elapsed); this.lastFrame = time; this.secondAccumulator += delta;
    if (this.moveDirection !== 0) {
      this._truckX.update(x => Math.max(12, Math.min(88, x + this.moveDirection * delta * .032)));
    }
    if (this.secondAccumulator >= 1000) {
      this.secondAccumulator -= 1000;
      this._timeLeft.update(v => v - 1);
      if (this._timeLeft() <= 0) {
        if (this._round() < 3) {
          this.beginNextRound();
          return;
        } else { this.finish(); return; }
      }
    }
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
      const insideOpening = offsetFromTruck >= truckGeometry.captureLeft && offsetFromTruck <= truckGeometry.captureRight;
      const reachesOpening = moved.y >= truckGeometry.openingTop && moved.y <= truckGeometry.openingBottom;
      const hitsBin = insideOpening && reachesOpening;
      const meetsTruckHeight = moved.y >= truckGeometry.solidTop && moved.y <= truckGeometry.solidBottom;
      const hitsTruckBody = meetsTruckHeight && !moved.bounced && offsetFromTruck >= truckGeometry.truckLeft && offsetFromTruck <= truckGeometry.truckRight && !insideOpening;

      if (hitsBin) {
        if (moved.dangerous) { this._lives.update(v => v - 1); this.triggerDamageEffect(); this.audio.playBatteryHit(); if (navigator.vibrate) navigator.vibrate([70, 35, 110]); }
        else { this._score.update(v => v + 10); this._loadLevel.update(v => Math.min(100, v + 10)); this.audio.playCatch(moved.kind); if (navigator.vibrate) navigator.vibrate(20); }
      } else if (hitsTruckBody) {
        const pushDirection = offsetFromTruck < 0 ? -1 : 1;
        next.push({ ...moved, x: moved.x + pushDirection * .8, y: moved.y - 1.5, velocityX: pushDirection * .3, velocityY: -.3, bounced: true, rotation: moved.rotation + pushDirection * 28 });
        this.audio.playTruckBounce();
        if (navigator.vibrate) navigator.vibrate(12);
      } else if (moved.y >= 95.5 && !moved.groundHit) {
        const pushDirection = moved.velocityX !== 0 ? Math.sign(moved.velocityX) : (moved.x < truckX ? -1 : 1);
        next.push({ ...moved, y: 94.8, velocityX: pushDirection * (.12 + Math.random() * .08), velocityY: -.24, bounced: true, groundHit: true, rotation: moved.rotation + pushDirection * 34 });
        if (navigator.vibrate) navigator.vibrate(8);
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
    this._items.update(items => [...items, { id: ++this.itemId, kind, x: 14 + Math.random() * 72, y: -8, speed, velocityX: 0, velocityY: speed, rotation: Math.random() * 40 - 20, dangerous, bounced: false, groundHit: false }]);
  }

  private getTruckGeometry(): { truckLeft: number; captureLeft: number; captureRight: number; truckRight: number; openingTop: number; openingBottom: number; solidTop: number; solidBottom: number } {
    const landscape = window.innerWidth > window.innerHeight;
    const fieldWidth = landscape ? Math.min(window.innerWidth, window.innerHeight * 16 / 9) : window.innerWidth;
    const fieldHeight = landscape ? Math.min(window.innerHeight, window.innerWidth * 9 / 16) : window.innerHeight;
    const truckWidthPixels = Math.max(190, Math.min(340, fieldWidth * 0.24));
    const truckHeightPixels = truckWidthPixels / 1.5;
    const itemSizePixels = Math.max(34, Math.min(46, fieldWidth * 0.032));
    const truckWidthPercent = truckWidthPixels / fieldWidth * 100;
    const truckHeightPercent = truckHeightPixels / fieldHeight * 100;
    const itemRadiusPercent = itemSizePixels / fieldHeight * 50;
    const itemRadiusWidthPercent = itemSizePixels / fieldWidth * 50;
    const truckTop = 95 - truckHeightPercent;
    return {
      truckLeft: -truckWidthPercent * .47,
      captureLeft: -truckWidthPercent * .205 - itemRadiusWidthPercent * .65,
      captureRight: truckWidthPercent * .195 + itemRadiusWidthPercent * .65,
      truckRight: truckWidthPercent * .47,
      openingTop: truckTop + truckHeightPercent * .275 - itemRadiusPercent * .35,
      openingBottom: truckTop + truckHeightPercent * .455,
      solidTop: truckTop + truckHeightPercent * .21 - itemRadiusPercent * .25,
      solidBottom: truckTop + truckHeightPercent * .92,
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

  private beginNextRound(): void {
    this.stopLoop();
    this._round.update(round => round + 1);
    this._timeLeft.set(60);
    this._loadLevel.set(0);
    this._items.set([]);
    this._status.set('roundTransition');
    if (this.roundTimer) clearTimeout(this.roundTimer);
    this.roundTimer = setTimeout(() => {
      this._status.set('playing');
      this.lastFrame = performance.now();
      this.lastSpawn = this.lastFrame;
      this.secondAccumulator = 0;
      this.frame = requestAnimationFrame(time => this.tick(time));
    }, 3000);
  }

  private finish(): void {
    this.stopLoop();
    this._status.set('finishing');
    if (this.finishTimer) clearTimeout(this.finishTimer);
    this.finishTimer = setTimeout(() => {
      this._items.set([]);
      this._status.set('finished');
    }, 3000);
  }
  private stopLoop(): void { if (this.frame) cancelAnimationFrame(this.frame); this.frame = undefined; this.moveDirection = 0; }
}
