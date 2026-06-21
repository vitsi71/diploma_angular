import {Component, inject} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {AuthService} from '../../../shared/services/auth.service';
import {AuthResponseType} from '../../../../types/auth-response.type';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private fb: FormBuilder = inject(FormBuilder);
  textPass: boolean = true;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  get email(): AbstractControl | null {
    return this.loginForm.get('email');
  }

  get password(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  viewPass(): void {
    this.textPass = !this.textPass;
  }

  login(): void {
    if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password, this.loginForm.value.rememberMe)
        .subscribe({
          next: (data: AuthResponseType | DefaultResponseType): void => {
            let error: string | null = null;

            const loginResponse = data as AuthResponseType;
            if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
              error = 'Ошибка авторизации';
            }
            if (error) {
              this._snackBar.open(error);
              throw new Error(error);
            }
            this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
            this.authService.userId = loginResponse.userId;
            this._snackBar.open('Вы успешно авторизовались');
            // загружаем последнюю страницу, с которой разлогинились
            const lastPage = localStorage.getItem('lastPage');
            if (lastPage) {
              this.router.navigateByUrl(lastPage);
              localStorage.removeItem('lastPage'); // Очищаем после использования
            } else {
              this.router.navigate(['/']); // Страница по умолчанию
            }

          },
          error: (error: HttpErrorResponse): void => {
            if (error.error.message !== "Failed to fetch") {
              this._snackBar.open(error.error.message);
            } else {
              this._snackBar.open('Нет ответа от системы ');
            }
          }
        });
    }
  }

}
