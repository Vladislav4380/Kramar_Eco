import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
@Component({ selector: 'app-garbage-truck', template: `<div class="truck" [class.damaged]="damaged()" [style.left.%]="x()"><span class="art"></span><span class="load" [class]="'load stage-' + loadStage()"></span></div>`, styleUrl: './garbage-truck.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class GarbageTruckComponent {
  readonly x = input.required<number>(); readonly loadLevel = input.required<number>(); readonly damaged = input(false);
  protected readonly loadStage = computed(() => Math.min(5, Math.ceil(this.loadLevel() / 20)));
}
