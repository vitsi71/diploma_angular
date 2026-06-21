import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {ArticlesType, ArticleType, CommentsType, CommentType} from '../../../types/article.type';
import {ArticleServices} from '../../shared/services/article.services';
import {ActivatedRoute, Params} from '@angular/router';
import {DefaultResponseType} from '../../../types/default-response.type';
import {ArticleCardType} from '../../../types/article.type';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from "../../shared/services/auth.service";
import {CommentsServices} from '../../shared/services/comments.services';
import {HttpErrorResponse, HttpParams} from '@angular/common/http';
import {ActionType} from '../../../types/action.type';
import {Subject, takeUntil} from 'rxjs';
import {PagePaginationType} from '../../../types/pagePagination.type';

@Component({
  selector: 'app-article',
  standalone: false,
  templateUrl: './article.html',
  styleUrl: './article.scss',
})
export class Article implements OnInit, OnDestroy {

  article: WritableSignal<ArticleType> = signal<ArticleType>({} as ArticleType);
  articleRelated: WritableSignal<ArticleCardType []> = signal<ArticleCardType[]>([]);
  isLogged: WritableSignal<boolean> = signal<boolean>(false);
  comments: WritableSignal<CommentsType> = signal<CommentsType>({"allCount": 0, "comments": []});
  articleText: string = "";
  url: string = '';
  commentCount: number = 3;
  offsetCount: number = 0;
  commentPages: number = 5;

  pageActive: number = 1;
  pages: { value: number, isActive: boolean }[] = [];

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private articleServices: ArticleServices,
              private commentsServices: CommentsServices,
              private authService: AuthService,
              private activatedRoute: ActivatedRoute,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {

    this.isLogged.set(this.authService.getIsLoggedIn());
    this.authService.isLogged$.pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn: boolean): void => {
        this.isLogged.set(isLoggedIn);
      })

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$))
      .subscribe((params: Params): void => {
        if (params && params['url']) {
          this.url = params['url'];
//запрос полного описания статьи
          this.articleServices.getArticle(this.url).subscribe({
            next: (data: ArticleType | DefaultResponseType):void => {
              this.article.set(data as ArticleType);
              this.commentCount = 3;
              this.offsetCount = 0;
              this.getComments();
            },
            error: (error: HttpErrorResponse): void => {
              if (error.error.message !== "Failed to fetch") {
                this._snackBar.open(error.error.message);
              } else {
                this._snackBar.open('Нет ответа от системы ');
              }
            }
          });
// запрос сопутствующих статей
          this.articleServices.getArticlesRelated(this.url).subscribe({
            next: (data: ArticleCardType[] | DefaultResponseType):void => {
               this.articleRelated.set(data as ArticleCardType[]);
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
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // запрос комментариев к найденой статье
  getComments():void {
    if (this.article().id) {
      let count: number = 0;
      this.commentsServices.getComments(this.article().id,this.offsetCount).subscribe({
        next: (data: CommentsType | DefaultResponseType):void => {
          // если комментарии к статье есть
          if ((data as CommentsType).allCount > 0) {
            if (this.commentCount === 3 ){  // обрезаем массив для вывода первых комментариев
              (data as CommentsType).comments = (data as CommentsType).comments.slice(0, 3);
            }





              this.pages = [];
            this.commentPages=Math.ceil((data as CommentsType).allCount/10);
              for (let i = 1; i <= this.commentPages; i++) {
                this.pages.push({value: i, isActive: i === this.pageActive});
              }


            if (this.isLogged()) {
              // определяем реакции конкретного абонента на эту статью
              this.commentsServices.getArticleCommentActions(this.article().id).subscribe({
                next: (actions: { comment: string, action: ActionType }[] | DefaultResponseType):void => {
                  (data as CommentsType).comments = ((data as CommentsType).comments).map((item: CommentType): CommentType => {
                    const newComment = {...item};
                    newComment.action = (actions as { comment: string, action: ActionType } [])
                      .find((a: { comment: string, action: ActionType }): boolean => a.comment === item.id)?.action

                    return newComment;

                  })
                  this.comments.set(data as CommentsType);
                },
                error: (error: HttpErrorResponse): void => {
                  if (error.error.message !== "Failed to fetch") {
                    this._snackBar.open(error.error.message);
                  } else {
                    this._snackBar.open('Нет ответа от системы ');
                  }
                }
              })
            } else {
              this.comments.set(data as CommentsType);
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
  }

  //Добавление комментария
  addComment():void {
    if (this.article().id && this.articleText) {
      this.commentsServices.addComment(this.article().id, this.articleText)
        .subscribe({
          next: (data: DefaultResponseType):void => {
            this.getComments();
            this._snackBar.open(data.message);
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
    this.articleText = "";
  }

  //Расширение списка комментариев
  addViewsComment():void {
    if( this.commentCount<10){
      this.commentCount = 10;
    }else{
      this.commentCount += 10;
      this.offsetCount += 10;
      this.pageActive= this.commentCount/10
    }

    this.getComments();
  }

  //Пожаловаться
  action(id: string, action: ActionType):void {
    if (this.isLogged()) {
      if (id != "" && action) {
        this.commentsServices.addAction(id, action)
          .subscribe({
              next: () => {
                if (action === ActionType.violate) {
                  this._snackBar.open("Жалоба отправлена");
                } else {
                  this._snackBar.open("Ваш голос учтен");
                  this.getComments();
                }
              },

              error: (error: HttpErrorResponse): void => {
                if (error.error.message !== "Failed to fetch") {
                  this._snackBar.open(error.error.message);
                } else {
                  this._snackBar.open('Нет ответа от системы ');
                }
              }
            }
          )
      }
    } else {
      this._snackBar.open('Для выполнения действия нужно авторизироваться');
    }
  }


  // пагинация страниц комментариев
  paginationPage(page: number | PagePaginationType): void {
    if (page === PagePaginationType.next) {  // получение номера нужной страницы с помощью стрелок
      this.pageActive += 1;
    } else if (page === PagePaginationType.prev) {
      this.pageActive -= 1;
    } else if (page === PagePaginationType.end) {
      this.pageActive = this.pages.length;
    } else if (page === PagePaginationType.home) {
      this.pageActive = 1;
    } else {
      this.pageActive = page as number; // выбор номерв страницы на прямую
    }
    this.commentCount = this.pageActive*10;
    this.offsetCount = (this.pageActive-1)*10;
    this.getComments();
  }



  protected readonly ActionType = ActionType;
  protected readonly PagePaginationType = PagePaginationType;
}
