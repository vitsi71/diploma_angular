import {
  NgModule,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { authInterceptor } from './shared/services/auth-interceptor';
import {Agreement} from './views/auth/agreement/agreement';

@NgModule({
  declarations: [App, Footer, Header, Layout, Main, Agreement],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatMenuModule,
    AuthModule,
    MatSnackBarModule,
    FormsModule,
    CarouselModule,
    ReactiveFormsModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } },
  ],
  bootstrap: [App],
})
export class AppModule {}
