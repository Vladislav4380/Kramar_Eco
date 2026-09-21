import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../../core/i18n/i18n.service';
@Component({ selector: 'app-game-hud', imports: [RouterLink], templateUrl: './game-hud.component.html', styleUrl: './game-hud.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class GameHudComponent { readonly score = input.required<number>(); readonly lives = input.required<number>(); readonly time = input.required<number>(); readonly pause = output<void>(); constructor(protected readonly i18n: I18nService) {} }
