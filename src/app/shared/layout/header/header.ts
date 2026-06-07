import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {UserResponseType} from '../../../../types/user-response.type';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {

  isLogged: WritableSignal<boolean> = signal<boolean>(false);
  userName: WritableSignal<string> = signal<string>("");

  constructor(private _snackBar: MatSnackBar, private authService: AuthService, private router: Router) {
    this.isLogged.set(this.authService.getIsLoggedIn());
    this.getUserName();
  }

  ngOnInit() {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged.set(isLoggedIn);
      this.getUserName();
    })
  }

  private getUserName() {
    if (this.isLogged()) {
      this.authService.getUser().subscribe({
        next: (data: UserResponseType | DefaultResponseType) => {

          if ((data as DefaultResponseType).error) {
            this._snackBar.open((data as DefaultResponseType).message);
          } else {
            if ((data as UserResponseType).name !== undefined) {
              this.userName.set((data as UserResponseType).name);
              this.authService.setUserName((data as UserResponseType).name);
            } else {
              this.userName.set("Гость");;
            }
          }
        },
        error: (): void => {
          this._snackBar.open('Нет ответа от системы ');
        }

      })
    }
  }

  logout() {
    this.authService.logout().subscribe();
    this.userClear();
  }

  private userClear() {
    this.authService.removeTokens();
    this.authService.userId = null;
    this.authService.setUserName(null)
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }
}
