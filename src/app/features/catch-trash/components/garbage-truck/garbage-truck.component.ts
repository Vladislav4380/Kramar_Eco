import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({ selector: 'app-garbage-truck', template: `<div class="truck" [class.damaged]="damaged()" [style.left.%]="x()"><span></span></div>`, styleUrl: './garbage-truck.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class GarbageTruckComponent { readonly x = input.required<number>(); readonly damaged = input(false); }
