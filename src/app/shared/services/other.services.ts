import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DefaultResponseType} from '../../../types/default-response.type';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OtherServices {

  private http:HttpClient = inject(HttpClient);

  request(name: string, phone: string, service?: string ): Observable< DefaultResponseType> {
   let type: string = "consultation";
    if (service){
      type= "order";
      return this.http.post<DefaultResponseType>(environment.api + 'requests', {
        name, phone,service, type
      });
    } else{
      return this.http.post<DefaultResponseType>(environment.api + 'requests', {
        name, phone, type
      })
    }
  }

}
