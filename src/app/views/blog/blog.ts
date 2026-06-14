import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {CategoryType} from '../../../types/category.type';
import {ArticlesType} from '../../../types/article.type';
import {OtherServices} from '../../shared/services/other.services';
import {DefaultResponseType} from '../../../types/default-response.type';
import {ArticleServices} from '../../shared/services/article.services';
import {HttpErrorResponse, HttpParams} from '@angular/common/http';
import {PagePaginationType} from '../../../types/pagePagination.type';
import {ActivatedRoute, Params} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();

  categories: WritableSignal<CategoryType[]> = signal<CategoryType[]>([]);
  articlesBlog: WritableSignal<ArticlesType> = signal<ArticlesType>({} as ArticlesType);
  filtersOpen: boolean = false;
  params: HttpParams = new HttpParams();
  pages: { value: number, isActive: boolean }[] = [];
  pageActive: number = 1;

  constructor(private otherServices: OtherServices,
              private activatedRoute: ActivatedRoute,
              private articleServices: ArticleServices,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {

    this.otherServices.getCategories()
      .subscribe({

        next: (data: CategoryType[] | DefaultResponseType) => {
          // нашли возможные категории
          this.categories.set(data as CategoryType[]);
// если перешли на страницу через кнопку на карточке- отсортировали категории согласно выбранной на карточке
          this.activatedRoute.queryParams.pipe(
            takeUntil(this.destroy$)
          ).subscribe((params: Params): void => {
            if (params && params['category']) {
              this.categoryCardSelect(params['category']);//если есть параметры сортировки
            } else {
              this.getArticles(); // без сортировки
            }
          });

        },
        error: (error: HttpErrorResponse): void => {
          this.getArticles();
          if (error.error.message !== "Failed to fetch") {
            this._snackBar.open(error.error.message);
          } else {
            this._snackBar.open('Нет ответа от системы ');
          }
        }
      });


  }

  //Отписываемся от подписки в activatedRoute
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openFilters(): void {
    this.filtersOpen = true;
  }

  closeFilters(): void {
    this.filtersOpen = false;
  }

  // поиск соответствия параметров в activatedRoute с загруженными категориями
  categoryCardSelect(category: string): void {
    let cat: CategoryType | undefined = this.categories().find((item: CategoryType): boolean => item.name === category);
    if (cat !== undefined) {
      this.categorySelect(cat);
    } else {
      this.getArticles();
    }
  };

  // фильтрация карточек согласно выбранным категориям
  categorySelect(cat: CategoryType): void {
    cat.isActive = !cat.isActive; // изменение свойства isActive выбранной категории
    this.params = new HttpParams();

    //проверка, какие из категорий выбранны и добавление их в параметры для загрузки с backend
    for (let item: number = 0; item < this.categories().length; item++) {
      if (this.categories()[item].isActive) {
        this.params = this.params.append("categories[]", this.categories()[item].url);
        console.log(this.params);
      }
    }
    this.pageActive = 1;
    this.getArticles();
  }


// загрузка карточек с учетом выбранных категорий
  getArticles(): void {
    this.articleServices.getArticles(this.params)
      .subscribe({
        next: (data: ArticlesType | DefaultResponseType): void => {
          this.articlesBlog.set(data as ArticlesType);
          // проверка колличества страниц в ответе, для отображения пагинации страниц
          if ((data as ArticlesType).pages > 1) {
            this.pages = [];
            for (let i = 1; i <= (data as ArticlesType).pages; i++) {
              this.pages.push({value: i, isActive: i === this.pageActive});
            }
          }
        },
        error: (error: HttpErrorResponse): void => {
          if (error.error.message !== "Failed to fetch") {
            this._snackBar.open(error.error.message);
          } else {
            this._snackBar.open('Нет ответа от системы ');
          }
        }
      })
  }

  // пагинация страниц
  paginationPage(page: number | PagePaginationType): void {
    const currentParams: HttpParams = this.params; // сохранение выбранных фильтров
    if (page === PagePaginationType.next) {  // получение номера нужной страницы с помощью стрелок
      this.pageActive = this.pageActive + 1;
    } else if (page === PagePaginationType.prev) {
      this.pageActive = this.pageActive - 1;
    } else {
      this.pageActive = page as number; // выбор номерв страницы на прямую
    }
    this.params = this.params.append("page", this.pageActive); // добавление номера страницы в параметры фильтра
    this.getArticles(); // получение выборки с учетом страницы
    this.params = currentParams; // подготовка параметров для выбора другой страницы
  }

  protected readonly PagePaginationType:typeof PagePaginationType = PagePaginationType;
}
