import {Component, inject, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OtherServices} from '../../services/other.services';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';

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

  popup:boolean=false;
  popupErr:WritableSignal<boolean>=signal<boolean>(false);
  respPopup:WritableSignal<boolean>=signal<boolean>(false);

  private fb: FormBuilder = inject(FormBuilder);
  popupForm: FormGroup = this.fb.group({
    nameUser: ['', [Validators.required]],
    phoneUser: ['', [Validators.required]],
  });

popupOpen(){
  if(this.authService.getIsLoggedIn()){
    this.popupForm.get('nameUser')?.setValue(this.authService.getUserName());
  }else{
    this.popupForm.get('nameUser')?.setValue('');
  }
 this.popup=true;
}
popupClose(){
 this.popup=false;
}

  sendRequest()
  {
    if(this.popupForm.valid){
      this.otherServices.request(this.popupForm.value.nameUser,this.popupForm.value.phoneUser)
        .subscribe({
          next: (data:DefaultResponseType): void => {
            let error = null;
            if (data.error) {
              error = data.message;
              this.popupErr.set(true);
            }
            if (error) {
              this._snackBar.open(error);
              throw new Error(error);
            }
            this.popupErr.set(false);
            this.respPopup.set(true);
          },
          error: (): void => {
            this._snackBar.open('Нет ответа от системы ');
            this.popupErr.set(true);
          }
        });
    }
  }

}
