import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, finalize, Observable, switchMap, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {AuthResponseType} from '../../../types/auth-response.type';
import {DefaultResponseType} from '../../../types/default-response.type';
import {LoaderService} from './loader.service';

// чтобы interceptor заработал в app.module в секцию providers: нужно добавить
// provideHttpClient(withInterceptors([authInterceptor])),

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // в запросы в заголовок подставляем accessToken
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  const loaderService: LoaderService = inject(LoaderService);
  const tokens: { accessToken: string | null, refreshToken: string | null } = authService.getTokens();
  loaderService.show();//включаем индикатор загрузки с каждым запросом
  if (tokens && tokens.accessToken) {
    const authReq:HttpRequest<any> = req.clone({
      headers: req.headers.set('x-auth', tokens.accessToken)
    });
    // получаем ответ
    return next(authReq)
      // обрабатываем ответ на предмет получения ошибки 401, 500
      .pipe(
        catchError((err: HttpErrorResponse) => {
          //ошибка не в запросе login(ошибка может быть в логине-пароле) и refresh(чтобы не зациклить)
          if (err.status === 500 || err.status === 401 && !authReq.url.includes('login') && !authReq.url.includes('refresh')) {
            return hendle401Error(authReq, next, authService, router);
          }
          return throwError((): HttpErrorResponse => err)
        }),
        finalize(() => loaderService.hide()) //выключаем индикатор загрузки не зависимо от результатов запроса

      );
  }
  return next(req)
    .pipe(finalize(():void => loaderService.hide()));//выключаем индикатор загрузки не зависимо от результатов запроса
};


// token просрочен
const hendle401Error = (req: HttpRequest<AuthResponseType | DefaultResponseType>,
                        next: HttpHandlerFn, authService: AuthService, router: Router): Observable<HttpEvent<AuthResponseType | DefaultResponseType>> => {
//запрашиваем новые через refresh
  return authService.refresh()
    .pipe(
      // полученный результат преобразуем в новый Observable объект
      switchMap((result: AuthResponseType | DefaultResponseType): Observable<HttpEvent<any>> => {
        let err = '';
        if ((result as DefaultResponseType).error !== undefined) {
          err = ((result as DefaultResponseType).message);
        }
        const refreshResult = result as AuthResponseType;
        if (!refreshResult.accessToken || !refreshResult.refreshToken || !refreshResult.userId) {
          err = "Ошибка авторизации";
        }
        if (err) {
          return throwError(() => new Error(err));
        }

        // обновляем токены в localStorage
        authService.setTokens(refreshResult.accessToken, refreshResult.refreshToken);
        // на основании входящих данных и нового accessToken меняем просроченные данные в заголовке
        const authReq = req.clone({
          headers: req.headers.set('x-access-token', refreshResult.accessToken)
        });
        // возвращаем преобразованный запрос
        return next(authReq);
      }),
      catchError(err => {
        authService.removeTokens();
        router.navigate(['']);
        return throwError(() => err);
      })
    );
}
