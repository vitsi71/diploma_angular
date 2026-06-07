import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DefaultResponseType} from '../../../types/default-response.type';
import {environment} from '../../../environments/environment';
import {ArticleType} from '../../../types/article.type';

@Injectable({
  providedIn: 'root',
})
export class ArticleServices {

  private http:HttpClient = inject(HttpClient);

  getArticlesTop(): Observable< ArticleType[] | DefaultResponseType> {
       return this.http.get<ArticleType[] | DefaultResponseType>(environment.api + 'articles/top');

  }
}
