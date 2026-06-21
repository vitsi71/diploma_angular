import { HttpClient } from "@angular/common/http";
import {inject, Injectable, OnInit} from '@angular/core';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DefaultResponseType} from '../../../types/default-response.type';
import {AuthResponseType} from '../../../types/auth-response.type';
import {UserResponseType} from '../../../types/user-response.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public accessTokenKey:string = 'accessToken';
  public refreshTokenKey:string = 'refreshToken';
  public userIdKey:string = 'userId';
  public userNameKey:string = 'userName';

  public isLogged$: Subject<boolean> = new Subject<boolean>(); // для отслеживания изменений в авторизации
  public isLogged:boolean = false;

  private http:HttpClient = inject(HttpClient);

  constructor() {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);
     }

  login(email: string, password: string, rememberMe: boolean): Observable<AuthResponseType | DefaultResponseType> {
    return this.http.post<AuthResponseType | DefaultResponseType>(environment.api + 'login', {
      email, password, rememberMe
    });
  }

  signup(name: string,email: string, password: string ): Observable<AuthResponseType | DefaultResponseType> {
    return this.http.post<AuthResponseType | DefaultResponseType>(environment.api + 'signup', {
      name, email, password
    });
  }

  refresh(): Observable<AuthResponseType|DefaultResponseType> {
    const tokens: { accessToken: string | null, refreshToken: string | null } = this.getTokens();
    if(tokens && tokens.refreshToken){
      return this.http.post<AuthResponseType|DefaultResponseType>(environment + 'refresh', {"refreshToken":tokens.refreshToken});
    }
    throw  throwError(()=>"Can not use token");
  }

  logout(): Observable<DefaultResponseType> {
    const tokens:{ accessToken: string | null, refreshToken: string | null }=this.getTokens();
    if(tokens && tokens.refreshToken){
      return this.http.post<DefaultResponseType>(environment.api + 'logout', {
        refreshToken: tokens.refreshToken
      });
    }
    throw throwError(()=>'Can not find token');
  }

  public getUser(): Observable<UserResponseType|DefaultResponseType> {
    const tokens:{ accessToken: string | null, refreshToken: string | null }=this.getTokens();
    if(tokens && tokens.accessToken){
      return this.http.get<UserResponseType|DefaultResponseType>(environment.api + 'users');
    }
    throw throwError(()=>'Can not find token');
  }


  // принудительный запрос состояния авторизации
  public getIsLoggedIn():boolean {
    return this.isLogged;
  }

  // установка Tokens в localStorage
  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true);
  }

  public getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken : localStorage.getItem(this.accessTokenKey),
      refreshToken : localStorage.getItem(this.refreshTokenKey)
    };
  }

  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(false);
  }



  get userId():null|string {
    return  localStorage.getItem(this.userIdKey);
  }
  set userId (id:string|null) {
    if(id){
      localStorage.setItem(this.userIdKey,id);
    } else {
      localStorage.removeItem(this.userIdKey);
    }
  }
  public getUserName():null|string {
    return  localStorage.getItem(this.userNameKey);
  }
  public setUserName (name:string|null) {
    if(name){
      localStorage.setItem(this.userNameKey,name);
    } else {
      localStorage.removeItem(this.userNameKey);
    }
  }

}
