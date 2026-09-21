import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FallingItemComponent } from '../falling-item/falling-item.component';
import { GarbageTruckComponent } from '../garbage-truck/garbage-truck.component';
import { FallingItem } from '../../models/falling-item.model';
@Component({ selector: 'app-game-field', imports: [FallingItemComponent, GarbageTruckComponent], templateUrl: './game-field.component.html', styleUrl: './game-field.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class GameFieldComponent {
  readonly items = input.required<FallingItem[]>(); readonly truckX = input.required<number>(); readonly loadLevel = input.required<number>(); readonly damageFlash = input(false);
}
