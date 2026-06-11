import {Component, Input} from '@angular/core';
import {ArticleCardType} from '../../../types/articleCard.type';

@Component({
  selector: 'article-card',
  standalone: false,
  templateUrl: './article-card.html',
  styleUrl: './article-card.scss',
})
export class ArticleCard {

  @Input()  article:ArticleCardType={} as ArticleCardType ;

}
