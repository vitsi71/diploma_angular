import {Component, inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../shared/services/auth.service';
import {Router} from '@angular/router';
import {AuthResponseType} from '../../../../types/auth-response.type';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private fb: FormBuilder = inject(FormBuilder);
  textPass:boolean=true;

  signupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required,Validators.pattern
    (/^([А-ЯЁ][а-яё]*\s*)+$/)]],
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required,Validators.pattern
    (/^(?=.*\d)(?=.*[A-ZА-Я]).{8,}$/)]],
    agree: [false,[Validators.requiredTrue]],
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  get name(): AbstractControl | null {
    return this.signupForm.get('name');
  }
  get email(): AbstractControl | null {
    return this.signupForm.get('email');
  }

  get password(): AbstractControl | null {
    return this.signupForm.get('password');
  }
  get agree(): AbstractControl | null {
    return this.signupForm.get('agree');
  }
  viewPass(){
    this.textPass=!this.textPass;
  }
  markAllAsTouched(): void {
    this.signupForm.markAllAsTouched();
  }

  signup(): void {
    if (this.signupForm.valid && this.signupForm.value.name && this.signupForm.value.email && this.signupForm.value.password && this.signupForm.value.agree) {
      this.authService.signup(this.signupForm.value.name,this.signupForm.value.email, this.signupForm.value.password )
        .subscribe({
          next: (data: AuthResponseType | DefaultResponseType): void => {
            let error = null;
            if ((data as DefaultResponseType).error !== undefined) {
              error = (data as DefaultResponseType).message;
            }

            const signupResponse = data as AuthResponseType;
            if (!signupResponse.accessToken || !signupResponse.refreshToken || !signupResponse.userId) {
              error = 'Ошибка регистрации';
            }
            if (error) {
              this._snackBar.open(error);
              throw new Error(error);
            }
            this.authService.setTokens(signupResponse.accessToken, signupResponse.refreshToken);
            this.authService.userId = signupResponse.userId;
            this._snackBar.open('Вы успешно зарегистрировались');
            this.router.navigate(['/']);
          },
          error: (error: HttpErrorResponse): void => {
            if (error.error.message !== "Failed to fetch") {
              this._snackBar.open(error.error.message);
            } else {
              this._snackBar.open('Нет ответа от системы ');
            }
          }

        });
    } else{
      this.signupForm.markAllAsTouched();
    }
  }


}
