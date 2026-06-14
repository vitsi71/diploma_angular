import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {CategoryType} from '../../../types/category.type';
import {ArticlesType} from '../../../types/article.type';
import {OtherServices} from '../../shared/services/other.services';
import {DefaultResponseType} from '../../../types/default-response.type';
import {ArticleServices} from '../../shared/services/article.services';
import {HttpParams} from '@angular/common/http';
import {PagePaginationType} from '../../../types/pagePagination.type';
import {ActivatedRoute, Params} from '@angular/router';
import {catchError, distinctUntilChanged, of, Subject, switchMap, takeUntil} from 'rxjs';

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  categories: WritableSignal<CategoryType[]> = signal<CategoryType[]>([]);
  articlesBlog: WritableSignal<ArticlesType> = signal<ArticlesType>({} as ArticlesType);
  filtersOpen: boolean = false;
  params: HttpParams = new HttpParams();
  pages: { value: number, isActive: boolean }[] = [];
  pageActive: number = 1;

  constructor(private otherServices: OtherServices,
              private activatedRoute: ActivatedRoute,
              private articleServices: ArticleServices) {
  }

  ngOnInit() {

    this.otherServices.getCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe({

      next: (data: CategoryType[] | DefaultResponseType) => {
        console.log(data as CategoryType[]);
        this.categories.set(data as CategoryType[]);

        this.activatedRoute.queryParams.pipe(
          takeUntil(this.destroy$)
        ).subscribe((params: Params): void => {
          if (params && params['category']) {
            this.categoryCardSelect(params['category']);
          } else {
            this.getArticles();
          }
        });

      },
      error: () => {
        this.getArticles();
      }
    });



  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openFilters() {
    this.filtersOpen = true;
  }

  closeFilters() {
    this.filtersOpen = false;
  }

  categorySelect(cat: CategoryType) {
    cat.isActive = !cat.isActive;
    this.params = new HttpParams();

    for (let item = 0; item < this.categories().length; item++) {
      if (this.categories()[item].isActive) {
        this.params = this.params.append("categories[]", this.categories()[item].url);
        console.log(this.params);
      }
    }
    this.pageActive = 1;
    this.getArticles();
  }

  categoryCardSelect(category: string) {
    console.log(this.categories());
    let cat: CategoryType | undefined = this.categories().find(item => item.name === category);
    console.log(cat);
    if (cat !== undefined) {
      this.categorySelect(cat);
    } else {
      this.getArticles();
    }
  };


  getArticles() {
    this.articleServices.getArticles(this.params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: ArticlesType | DefaultResponseType) => {
        console.log(data as ArticlesType);
        this.articlesBlog.set(data as ArticlesType);
        if ((data as ArticlesType).pages > 1) {
          this.pages = [];
          for (let i = 1; i <= (data as ArticlesType).pages; i++) {
            this.pages.push({value: i, isActive: i === this.pageActive});
          }
        }
      },
      error: () => {
      }
    })
  }

  paginationPage(page: number | PagePaginationType) {
    const currentParams: HttpParams = this.params;
    if (page === PagePaginationType.next) {
      this.pageActive = this.pageActive + 1;
    } else if (page === PagePaginationType.prev) {
      this.pageActive = this.pageActive - 1;
    } else {
      this.pageActive = page as number;
    }
    this.params = this.params.append("page", this.pageActive);
    this.getArticles();
    this.params = currentParams;
  }

  protected readonly PagePaginationType = PagePaginationType;
}
