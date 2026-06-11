import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DefaultResponseType} from '../../../types/default-response.type';
import {environment} from '../../../environments/environment';
import {CommentsType} from '../../../types/article.type';
import {ActionType} from '../../../types/action.type';

@Injectable({
  providedIn: 'root',
})
export class CommentsServices {

  private http:HttpClient = inject(HttpClient);

  // получение всех комментариев к статье
  getComments(id:string,offset:number=0): Observable<CommentsType | DefaultResponseType> {
    const params = new HttpParams().set('article',id).set("offset" , offset.toString()) ;
    return this.http.get<CommentsType | DefaultResponseType>(environment.api + 'comments',{params});
  }

  //добовление комментария
  addComment(id:string,text:string): Observable< DefaultResponseType> {
    return this.http.post< DefaultResponseType>(environment.api + 'comments',{
      "text": text,
      "article": id
    });
  }
  // добавление реакции - like dislike
  addAction(id:string,action:ActionType): Observable< DefaultResponseType> {
    return this.http.post< DefaultResponseType>(environment.api + 'comments/'+id+'/apply-action',{
      "action": action
    });
  }

 // запрос действующей реакции на комментарии в статье - like dislike
  getArticleCommentActions(id:string): Observable<{comment:string,action:ActionType}[]| DefaultResponseType> {
    const params = new HttpParams().set('articleId',id) ;
    return this.http.get< {comment:string,action:ActionType}[]|DefaultResponseType>(environment.api + 'comments/article-comment-actions',{params});
  }



}
