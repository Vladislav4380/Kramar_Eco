import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCard } from '../../models/game-card.model';
import { I18nService } from '../../../../core/i18n/i18n.service';
@Component({ selector: 'app-game-card', imports: [RouterLink], templateUrl: './game-card.component.html', styleUrl: './game-card.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class GameCardComponent { readonly game = input.required<GameCard>(); constructor(protected readonly i18n: I18nService) {} }
