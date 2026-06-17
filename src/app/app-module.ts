import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './shared/layout/header/header';
import { Layout } from './shared/layout/layout';
import { Footer } from './shared/layout/footer/footer';
import { AuthModule } from './views/auth/auth-module';
import { Main } from './views/main/main';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { authInterceptor } from './shared/services/auth-interceptor';
import { Agreement } from './views/auth/agreement/agreement';
import { Article } from './views/article/article';
import { SharedModule } from './shared/shared-module';
import { Blog } from './views/blog/blog';
import {NgxMaskConfig, NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import { LOCALE_ID } from '@angular/core';

@NgModule({
  declarations: [App, Footer, Header, Layout, Main, Agreement, Article, Blog],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MatMenuModule,
        AuthModule,
        MatSnackBarModule,
        FormsModule,
        CarouselModule,
        ReactiveFormsModule,
        SharedModule,
        NgxMaskDirective,
    ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } },
    { provide: LOCALE_ID, useValue: 'ru-RU' },
    provideNgxMask()
  ],
  bootstrap: [App],
})
export class AppModule {}
