import {Component, OnInit, signal, WritableSignal} from '@angular/core';
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

@Component({
  selector: 'app-article',
  standalone: false,
  templateUrl: './article.html',
  styleUrl: './article.scss',
})
export class Article implements OnInit {

  article: WritableSignal<ArticleType | null> = signal<ArticleType | null>(null);
  articleRelated: WritableSignal<ArticleCardType []> = signal<ArticleCardType[]>([]);
  isLogged: WritableSignal<boolean> = signal<boolean>(false);
  comments: WritableSignal<CommentsType> = signal<CommentsType>({"allCount": 0, "comments": []});
  articleText: string = "";
  url: string = '';
  commentCount: number = 0;

  constructor(private articleServices: ArticleServices,
              private commentsServices: CommentsServices,
              private authService: AuthService,
              private activatedRoute: ActivatedRoute,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.commentCount = 3;
    this.isLogged.set(this.authService.getIsLoggedIn());
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged.set(isLoggedIn);
    })

    this.activatedRoute.queryParams.subscribe((params:Params):void => {
      if (params && params['url']) {
        this.url = params['url'];
//запрос полного описания статьи
        this.articleServices.getArticle(this.url).subscribe({
          next: (data: ArticleType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error) {
              this._snackBar.open((data as DefaultResponseType).message);
              throw new Error((data as DefaultResponseType).message);
            }
            this.article.set(data as ArticleType);
            this.getComments();
          },
          error: (): void => {
            this._snackBar.open('Нет ответа от системы ');
          }
        });
// запрос сопутствующих статей
        this.articleServices.getArticlesRelated(this.url).subscribe({
          next: (data: ArticleCardType[] | DefaultResponseType) => {
            if ((data as DefaultResponseType).error) {
              this._snackBar.open((data as DefaultResponseType).message);
              throw new Error((data as DefaultResponseType).message);
            }
            this.articleRelated.set(data as ArticleCardType[]);
          },
          error: (): void => {
            this._snackBar.open('Нет ответа от системы ');
          }
        })
      }
    });
  }

  // запрос комментариев к найденой статье
  getComments() {
    if (this.article()!.id) {
      let count: number = 0;
      this.commentsServices.getComments(this.article()!.id).subscribe({
        next: (data: CommentsType | DefaultResponseType) => {
          // если комментарии к статье есть
          if ((data as CommentsType).comments.length > 0){
            // определяем количество выводимых комментариев
            const count: number = ((data as CommentsType).comments.length < this.commentCount) ? (data as CommentsType).comments.length : this.commentCount;
          (data as CommentsType).allCount = (data as CommentsType).comments.length;
          (data as CommentsType).comments = (data as CommentsType).comments.slice(0, count);

          if (this.isLogged()) {
            // определяем реакции конкретного абонента на эту статью
            this.commentsServices.getArticleCommentActions(this.article()!.id).subscribe({
              next: (actions: { comment: string, action: ActionType }[] | DefaultResponseType) => {
                (data as CommentsType).comments = ((data as CommentsType).comments).map((item: CommentType) => {
                  const newComment = {...item};
                  newComment.action = (actions as {
                    comment: string,
                    action: ActionType
                  }[]).find(a => a.comment === item.id)?.action

                  return newComment;

                })
                this.comments.set(data as CommentsType);
                // console.log(this.comments());
                //this.comments.set(newComments.allCount =(data as CommentsType).allCount);
                // console.log(newComments);
                // console.log((actions as { comment: string, action: ActionType }[]));
                // console.log(((data as CommentsType).comments));
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

         // console.log(this.comments());
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
  addComment() {
    if (this.article()!.id && this.articleText) {
      this.commentsServices.addComment(this.article()!.id, this.articleText)
        .subscribe({
          next: (data: DefaultResponseType) => {
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
  addViewsComment() {
    this.commentCount += 10;
    this.getComments();
  }

  //Пожаловаться
  action(id: string, action: ActionType) {

    console.log(id, action);

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
