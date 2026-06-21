import {inject, Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {DefaultResponseType} from '../../../types/default-response.type';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {CategoryType} from '../../../types/category.type';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class OtherServices {

  private http: HttpClient = inject(HttpClient);
  public burger$:  Subject<boolean> = new Subject<boolean>();

  request(name: string, phone: string, service?: string): Observable<DefaultResponseType> {
    let type: string = "consultation";
    if (service) {
      type = "order";
      return this.http.post<DefaultResponseType>(environment.api + 'requests', {
        name, phone, service, type
      });
    } else {
      return this.http.post<DefaultResponseType>(environment.api + 'requests', {
        name, phone, type
      })
    }
  }

  getCategories(): Observable<CategoryType[] | DefaultResponseType> {
    return this.http.get<CategoryType[] | DefaultResponseType>(environment.api + 'categories')
  }


}
