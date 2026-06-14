import {Component, Inject, Input} from '@angular/core';
import {ArticleCardType} from '../../../types/article.type';
import {CategoryType} from '../../../types/category.type';
import {Blog} from '../../views/blog/blog';

@Component({
  selector: 'article-card',
  standalone: false,
  templateUrl: './article-card.html',
  styleUrl: './article-card.scss',
})
export class ArticleCard {
  @Input()  article:ArticleCardType={} as ArticleCardType ;
}
