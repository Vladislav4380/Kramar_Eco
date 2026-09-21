import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'uk' | 'en';

const TEXT: Record<AppLanguage, Record<string, string>> = {
  uk: {
    'brand.tagline': 'Граємо — робимо місто чистішим',
    'common.settings': 'Налаштування',
    'common.back': 'Повернутися до меню',
    'common.soon': 'Незабаром',
    'home.kicker': 'Ігровий центр',
    'home.title': 'Обери гру',
    'home.subtitle': 'Збирай відходи, заробляй монети та відкривай нові завдання.',
    'home.footer': 'KRAMAR ECO · ЧИСТІ ЗВИЧКИ',
    'game.catch.title': 'Спіймай сміття',
    'game.catch.description': 'Лови корисні відходи й не дай батарейкам потрапити до кузова.',
    'game.catch.eyebrow': 'Аркада · доступно',
    'game.find.title': 'Знайди деталі',
    'game.find.description': 'Відшукай потрібні запчастини серед старих речей і поверни техніку до життя.',
    'game.find.eyebrow': 'Пошук предметів',
    'game.collect.title': 'Збери сміття',
    'game.collect.description': 'Очисти приміщення, наповни мішок і відвези відходи на сортування.',
    'game.collect.eyebrow': 'Пригода',
    'game.parking.title': 'Паркування',
    'game.parking.description': 'Спрямовуй сміттєвози потрібного кольору до своєї лінії сортування.',
    'game.parking.eyebrow': 'Головоломка',
    'game.playAria': 'Грати в',
    'play.hint': 'Веди пальцем ліворуч і праворуч',
    'hud.score': 'Рахунок',
    'hud.time': 'Час',
    'hud.lives': 'Життя',
    'hud.pause': 'Пауза',
    'overlay.miniGame': 'Мінігра',
    'overlay.catchTitle': 'Спіймай<br>сміття',
    'overlay.instructions': 'Пересувай сміттєвоз пальцем, лови відходи та уникай батарейок.',
    'overlay.start': 'Почати гру',
    'overlay.pauseTitle': 'Пауза',
    'overlay.pauseText': 'Невеликий перепочинок. Усе залишиться на своїх місцях.',
    'overlay.continue': 'Продовжити',
    'overlay.exit': 'Вийти до меню',
    'overlay.finished': 'Раунд завершено',
    'overlay.points': 'очок',
    'overlay.coins': 'Зароблено монет:',
    'overlay.again': 'Грати ще',
  },
  en: {
    'brand.tagline': 'Play today — make the city cleaner',
    'common.settings': 'Settings',
    'common.back': 'Back to menu',
    'common.soon': 'Coming soon',
    'home.kicker': 'Game center',
    'home.title': 'Choose a game',
    'home.subtitle': 'Collect waste, earn coins, and unlock new challenges.',
    'home.footer': 'KRAMAR ECO · CLEAN HABITS',
    'game.catch.title': 'Catch the trash',
    'game.catch.description': 'Catch recyclable waste and keep batteries out of the truck.',
    'game.catch.eyebrow': 'Arcade · available',
    'game.find.title': 'Find the parts',
    'game.find.description': 'Find spare parts among old objects and bring the machine back to life.',
    'game.find.eyebrow': 'Hidden objects',
    'game.collect.title': 'Collect the trash',
    'game.collect.description': 'Clean the room, fill your bag, and take the waste to sorting.',
    'game.collect.eyebrow': 'Adventure',
    'game.parking.title': 'Truck parking',
    'game.parking.description': 'Send each colored truck to the correct sorting line.',
    'game.parking.eyebrow': 'Puzzle',
    'game.playAria': 'Play',
    'play.hint': 'Slide your finger left and right',
    'hud.score': 'Score',
    'hud.time': 'Time',
    'hud.lives': 'Lives',
    'hud.pause': 'Pause',
    'overlay.miniGame': 'Mini-game',
    'overlay.catchTitle': 'Catch the<br>trash',
    'overlay.instructions': 'Move the garbage truck with your finger, catch waste, and avoid batteries.',
    'overlay.start': 'Start game',
    'overlay.pauseTitle': 'Paused',
    'overlay.pauseText': 'Take a short break. Everything will stay right where it is.',
    'overlay.continue': 'Continue',
    'overlay.exit': 'Exit to menu',
    'overlay.finished': 'Round complete',
    'overlay.points': 'points',
    'overlay.coins': 'Coins earned:',
    'overlay.again': 'Play again',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'kramar-eco-language';
  readonly language = signal<AppLanguage>(this.detectLanguage());

  t(key: string): string { return TEXT[this.language()][key] ?? key; }

  toggle(): void { this.setLanguage(this.language() === 'uk' ? 'en' : 'uk'); }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);
    document.documentElement.lang = language;
    try { localStorage.setItem(this.storageKey, language); } catch { /* Storage may be unavailable in embedded browsers. */ }
  }

  private detectLanguage(): AppLanguage {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'uk' || saved === 'en') { document.documentElement.lang = saved; return saved; }
    } catch { /* Fall back to the device language. */ }
    const language: AppLanguage = navigator.language.toLowerCase().startsWith('uk') ? 'uk' : 'en';
    document.documentElement.lang = language;
    return language;
  }
}
