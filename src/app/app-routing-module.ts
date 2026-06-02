import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Layout} from './shared/layout/layout';
import {Main} from './views/main/main';

const routes: Routes = [{
  path: '',
  component: Layout,
  children:[
    { path: '', component: Main},
    {path:'',loadChildren:()=>
    import('./views/auth/auth-module').then(m=>m.AuthModule)}
  ]
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
