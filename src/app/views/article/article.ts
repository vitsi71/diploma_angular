import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {ArticleType, CommentsType, CommentType} from '../../../types/article.type';
import {ArticleServices} from '../../shared/services/article.services';
import {ActivatedRoute, Params} from '@angular/router';
import {DefaultResponseType} from '../../../types/default-response.type';
import {ArticleCardType} from '../../../types/article.type';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from "../../shared/services/auth.service";
import {CommentsServices} from '../../shared/services/comments.services';
import {HttpErrorResponse} from '@angular/common/http';
import {ActionType} from '../../../types/action.type';
import {Subject, takeUntil} from 'rxjs';

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

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private articleServices: ArticleServices,
              private commentsServices: CommentsServices,
              private authService: AuthService,
              private activatedRoute: ActivatedRoute,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.commentCount = 3;
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
      this.commentsServices.getComments(this.article().id).subscribe({
        next: (data: CommentsType | DefaultResponseType):void => {
          // если комментарии к статье есть
          if ((data as CommentsType).comments.length > 0) {
            // определяем количество выводимых комментариев
            count = ((data as CommentsType).comments.length < this.commentCount) ? (data as CommentsType).comments.length : this.commentCount;
            (data as CommentsType).allCount = (data as CommentsType).comments.length;
            (data as CommentsType).comments = (data as CommentsType).comments.slice(0, count);

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
    this.commentCount += 10;
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

  protected readonly ActionType = ActionType;
}
