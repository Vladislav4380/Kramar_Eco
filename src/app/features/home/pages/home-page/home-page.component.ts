import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { HomeHeaderComponent } from '../../components/home-header/home-header.component';
import { GameCard } from '../../models/game-card.model';
@Component({ selector: 'app-home-page', imports: [HomeHeaderComponent, GameCardComponent], templateUrl: './home-page.component.html', styleUrl: './home-page.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class HomePageComponent {
  constructor(protected readonly i18n: I18nService) {}
  protected readonly games = computed<GameCard[]>(() => [
    { title: this.i18n.t('game.catch.title'), description: this.i18n.t('game.catch.description'), eyebrow: this.i18n.t('game.catch.eyebrow'), route: '/games/catch-trash', icon: '🚛', theme: 'mint', status: '' },
    { title: this.i18n.t('game.find.title'), description: this.i18n.t('game.find.description'), eyebrow: this.i18n.t('game.find.eyebrow'), icon: '🔎', theme: 'sunset', status: this.i18n.t('common.soon') },
    { title: this.i18n.t('game.collect.title'), description: this.i18n.t('game.collect.description'), eyebrow: this.i18n.t('game.collect.eyebrow'), icon: '♻️', theme: 'sky', status: this.i18n.t('common.soon') },
    { title: this.i18n.t('game.parking.title'), description: this.i18n.t('game.parking.description'), eyebrow: this.i18n.t('game.parking.eyebrow'), icon: '🚦', theme: 'violet', status: this.i18n.t('common.soon') },
  ]);
}
