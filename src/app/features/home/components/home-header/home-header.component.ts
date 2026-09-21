import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CoinCounterComponent } from '../../../../shared/ui/coin-counter/coin-counter.component';
import { I18nService } from '../../../../core/i18n/i18n.service';
@Component({ selector: 'app-home-header', imports: [CoinCounterComponent], templateUrl: './home-header.component.html', styleUrl: './home-header.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class HomeHeaderComponent { constructor(protected readonly i18n: I18nService) {} }
