import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {ArticleType, CommentsType, CommentType} from '../../../types/article.type';
import {ArticleServices} from '../../shared/services/article.services';
import {ActivatedRoute} from '@angular/router';
import {DefaultResponseType} from '../../../types/default-response.type';
import {ArticleCardType} from '../../../types/articleCard.type';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from "../../shared/services/auth.service";
import {CommentsServices} from '../../shared/services/comments.services';

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

    this.activatedRoute.queryParams.subscribe(params => {
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
          if ((data as DefaultResponseType).error) {
            this._snackBar.open((data as DefaultResponseType).message);
            throw new Error((data as DefaultResponseType).message);
          }
          count = ((data as CommentsType).allCount < this.commentCount) ? (data as CommentsType).allCount : this.commentCount;

          (data as CommentsType).comments = (data as CommentsType).comments.slice(0, count);
          this.comments.set(data as CommentsType);
          console.log(this.comments());
        },
        error: (): void => {
          this._snackBar.open('Нет ответа от системы ');
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
            this._snackBar.open(data.message);
            this.articleText = "";
            this.getComments();
          },
          error: (): void => {
            this._snackBar.open('Нет ответа от системы ');
          }
        })
    }
  }

  //Расширение списка комментариев
  addViewsComment() {
    this.commentCount += 10;
    this.getComments();
  }
}
