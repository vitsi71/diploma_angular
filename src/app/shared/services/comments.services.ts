import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DefaultResponseType} from '../../../types/default-response.type';
import {environment} from '../../../environments/environment';
import {CommentsType} from '../../../types/article.type';

@Injectable({
  providedIn: 'root',
})
export class CommentsServices {

  private http:HttpClient = inject(HttpClient);

  getComments(id:string,offset:number=0): Observable<CommentsType | DefaultResponseType> {
    const params = new HttpParams().set('article',id).set("offset" , offset.toString()) ;
    return this.http.get<CommentsType | DefaultResponseType>(environment.api + 'comments',{params});
  }

  addComment(id:string,text:string): Observable< DefaultResponseType> {
    return this.http.post< DefaultResponseType>(environment.api + 'comments',{
      "text": text,
      "article": id
    });
  }

}
