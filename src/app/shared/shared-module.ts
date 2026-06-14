import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleCard } from './article-card/article-card';
import { RouterLink } from '@angular/router';
import { Loader } from './loader/loader';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [ArticleCard, Loader],
  imports: [CommonModule, RouterLink, MatProgressSpinner],
  exports: [ArticleCard, Loader],
})
export class SharedModule {}
