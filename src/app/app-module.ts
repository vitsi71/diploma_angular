import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './shared/layout/header/header';
import { Layout } from './shared/layout/layout';
import {Footer} from './shared/layout/footer/footer';
import {AuthModule} from './views/auth/auth-module';
import { Main } from './views/main/main';

@NgModule({
  declarations: [
    App,
    Footer,
    Header,
    Layout,
    Main
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [App]
})
export class AppModule { }
