import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleCard } from './article-card/article-card';
import {RouterLink} from "@angular/router";

@NgModule({
  declarations: [ArticleCard],
  imports: [CommonModule, RouterLink],
  exports: [
    ArticleCard
  ]
})
export class SharedModule {}
