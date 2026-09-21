import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameStatus } from '../../state/catch-trash.store';
import { I18nService } from '../../../../core/i18n/i18n.service';
@Component({ selector: 'app-game-overlay', imports: [RouterLink], templateUrl: './game-overlay.component.html', styleUrl: './game-overlay.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class GameOverlayComponent {
  readonly status = input.required<GameStatus>(); readonly score = input.required<number>(); readonly coins = input.required<number>(); readonly round = input.required<number>(); readonly primary = output<void>();
  constructor(protected readonly i18n: I18nService) {}

  protected activateCard(event: Event): void {
    if (this.status() !== 'ready' || (event.target as HTMLElement).closest('button, a')) return;
    this.primary.emit();
  }

  protected activateCardWithKeyboard(event: KeyboardEvent): void {
    if (this.status() === 'ready' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.primary.emit();
    }
  }
}
