import {Component, Input, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {ArticleCardType} from '../../../types/article.type';
import {Subject, takeUntil} from 'rxjs';
import {OtherServices} from '../services/other.services';

@Component({
  selector: 'article-card',
  standalone: false,
  templateUrl: './article-card.html',
  styleUrl: './article-card.scss',
})
export class ArticleCard implements OnInit, OnDestroy{
  burger:WritableSignal<boolean>=signal<boolean>(false);
  @Input()  article:ArticleCardType={} as ArticleCardType ;
  private destroy$:Subject<void> = new Subject<void>();

  constructor(private otherServices: OtherServices) {
  }

  ngOnInit(): void {
    this.otherServices.burger$.pipe(takeUntil(this.destroy$))
      .subscribe((burger: boolean) => {
        this.burger.set(burger);
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();   // Эмит сигнала завершения
    this.destroy$.complete(); // Освобождение ресурсов Subject
  }

}
