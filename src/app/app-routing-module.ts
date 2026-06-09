import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Layout} from './shared/layout/layout';
import {Main} from './views/main/main';
import {Agreement} from './views/auth/agreement/agreement';
import {Article} from './views/article/article';

const routes: Routes = [{
  path: '',
  component: Layout,
  children:[
    { path: '', component: Main},
    {path: 'article', component: Article},
    {path:'',loadChildren:()=>
    import('./views/auth/auth-module').then(m=>m.AuthModule)}
  ]
},{ path: 'agreement', component: Agreement}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled', //,{anchorScrolling:'enabled'} для скролинга по якорю на странице
    scrollPositionRestoration: 'enabled',
      })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
