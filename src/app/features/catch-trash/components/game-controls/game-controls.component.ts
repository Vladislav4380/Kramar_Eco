import { ChangeDetectionStrategy, Component, HostListener, inject, output } from '@angular/core';
import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrl: './game-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameControlsComponent {
  protected readonly i18n = inject(I18nService);
  readonly directionChange = output<-1 | 0 | 1>();

  protected press(event: PointerEvent, direction: -1 | 1): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.directionChange.emit(direction);
  }

  protected release(event?: PointerEvent): void {
    event?.preventDefault();
    this.directionChange.emit(0);
  }

  @HostListener('window:keydown', ['$event'])
  protected keyDown(event: KeyboardEvent): void {
    if (event.repeat) return;
    if (event.key === 'ArrowLeft') this.directionChange.emit(-1);
    if (event.key === 'ArrowRight') this.directionChange.emit(1);
  }

  @HostListener('window:keyup', ['$event'])
  protected keyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') this.directionChange.emit(0);
  }
}
