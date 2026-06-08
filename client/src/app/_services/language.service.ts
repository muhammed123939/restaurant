import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  
  constructor(private translate: TranslateService) {
    const lang = localStorage.getItem('lang') || 'en';

    this.translate.setDefaultLang('en');
    this.translate.use(lang);

    this.setDirection(lang);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);

    this.setDirection(lang);
  }

  private setDirection(lang: string) {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
}