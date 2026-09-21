import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output } from '@angular/core';
import { FallingItemComponent } from '../falling-item/falling-item.component';
import { GarbageTruckComponent } from '../garbage-truck/garbage-truck.component';
import { FallingItem } from '../../models/falling-item.model';
import { I18nService } from '../../../../core/i18n/i18n.service';
@Component({ selector: 'app-game-field', imports: [FallingItemComponent, GarbageTruckComponent], templateUrl: './game-field.component.html', styleUrl: './game-field.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class GameFieldComponent {
  private readonly host = inject(ElementRef<HTMLElement>); protected readonly i18n = inject(I18nService); readonly items = input.required<FallingItem[]>(); readonly truckX = input.required<number>(); readonly damageFlash = input(false); readonly moveTruck = output<number>();
  protected move(event: PointerEvent): void { if (event.buttons === 0 && event.pointerType === 'mouse') return; const rect = this.host.nativeElement.getBoundingClientRect(); this.moveTruck.emit((event.clientX - rect.left) / rect.width * 100); }
  protected begin(event: PointerEvent): void { (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); this.move(event); }
}
