import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({ selector: 'app-coin-counter', template: `<span class="coin">●</span><strong>{{ amount() }}</strong>`, styleUrl: './coin-counter.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class CoinCounterComponent { readonly amount = input.required<number>(); }
