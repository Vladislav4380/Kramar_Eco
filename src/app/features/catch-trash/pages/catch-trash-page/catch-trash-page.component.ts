import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { GameFieldComponent } from '../../components/game-field/game-field.component';
import { GameHudComponent } from '../../components/game-hud/game-hud.component';
import { GameOverlayComponent } from '../../components/game-overlay/game-overlay.component';
import { CatchTrashStore } from '../../state/catch-trash.store';
@Component({ selector: 'app-catch-trash-page', imports: [GameFieldComponent, GameHudComponent, GameOverlayComponent], providers: [CatchTrashStore], templateUrl: './catch-trash-page.component.html', styleUrl: './catch-trash-page.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class CatchTrashPageComponent implements OnDestroy {
  constructor(protected readonly store: CatchTrashStore) {}
  protected primaryAction(): void { this.store.status() === 'paused' ? this.store.togglePause() : this.store.start(); }
  ngOnDestroy(): void { this.store.destroy(); }
}
