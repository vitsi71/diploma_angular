import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {UserResponseType} from '../../../../types/user-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {Subject, takeUntil} from 'rxjs';
import {OtherServices} from '../../services/other.services';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {

  isLogged: WritableSignal<boolean> = signal<boolean>(false);
  userName: WritableSignal<string> = signal<string>("");
  private destroy$:Subject<void> = new Subject<void>();
  public burger: boolean = false;


  constructor(private _snackBar: MatSnackBar, private authService: AuthService, private router: Router,
              private otherServices:OtherServices ) {
    this.isLogged.set(this.authService.getIsLoggedIn());
    this.getUserName();
  }

  ngOnInit(): void {
    // this.otherServices.burger$.next(this.burger);

    this.authService.isLogged$.pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn: boolean) => {
      this.isLogged.set(isLoggedIn);
      this.getUserName();
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();   // Эмит сигнала завершения
    this.destroy$.complete(); // Освобождение ресурсов Subject
  }

  private getUserName(): void {
    if (this.isLogged()) {
      this.authService.getUser().subscribe({
        next: (data: UserResponseType | DefaultResponseType) => {
          if ((data as UserResponseType).name !== undefined) {
            this.userName.set((data as UserResponseType).name);
            this.authService.setUserName((data as UserResponseType).name);
          } else {
            this.userName.set("Гость");
          }
        },
        error: (error: HttpErrorResponse): void => {
          if (error.error.message !== "Failed to fetch") {
            this._snackBar.open(error.error.message);
          } else {
            this._snackBar.open('Нет ответа от системы ');
          }
        }
      })
    }
  }

  logout(): void {
    localStorage.setItem('lastPage', window.location.pathname + window.location.search);
    localStorage.setItem('user', this.userName());
    this.authService.logout().subscribe();
    this.userClear();
  }

  private userClear(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this.authService.setUserName(null)
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

  public burgerOn():void{
    this.burger=!this.burger;
    this.otherServices.burger$.next(this.burger);
  }
}
