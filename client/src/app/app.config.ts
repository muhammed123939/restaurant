import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';

import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { routes } from './app.routes';

import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';

import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { Observable } from 'rxjs';

// Icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

// Perfect Scrollbar
import { NgScrollbarModule } from 'ngx-scrollbar';

// Material
import { MaterialModule } from './material.module';

// Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* =========================================================
   CUSTOM TRANSLATE LOADER (FIXES ALL VERSION ISSUES)
========================================================= */
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

/* Factory */
export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

/* =========================================================
   APP CONFIG
========================================================= */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({
      eventCoalescing: true,
    }),

    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withComponentInputBinding()
    ),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    provideClientHydration(),

    provideAnimationsAsync(),

    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      MaterialModule,
      TablerIconsModule.pick(TablerIcons),
      NgScrollbarModule,

      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ],
};