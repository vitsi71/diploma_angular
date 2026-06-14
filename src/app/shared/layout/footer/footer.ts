import {Component, inject, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OtherServices} from '../../services/other.services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private otherServices: OtherServices = inject(OtherServices);
  private authService: AuthService = inject(AuthService);

  popup: boolean = false;
  popupErr: WritableSignal<boolean> = signal<boolean>(false);
  respPopup: WritableSignal<boolean> = signal<boolean>(false);

  private fb: FormBuilder = inject(FormBuilder);
  popupForm: FormGroup = this.fb.group({
    nameUser: ['', [Validators.required]],
    phoneUser: ['', [Validators.required]],
  });

  popupOpen(): void {
    this.respPopup.set(false);
    if (this.authService.getIsLoggedIn()) {
      this.popupForm.get('nameUser')?.setValue(this.authService.getUserName());
    } else {
      this.popupForm.get('nameUser')?.setValue('');
    }
    this.popup = true;
  }

  popupClose(): void {
    this.popup = false;
  }

  sendRequest(): void {
    if (this.popupForm.valid) {
      this.otherServices.request(this.popupForm.value.nameUser, this.popupForm.value.phoneUser)
        .subscribe({
          next: (): void => {
            this.popupErr.set(false);
            this.respPopup.set(true);
          },
          error: (error: HttpErrorResponse): void => {
            this.popupErr.set(true);
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
