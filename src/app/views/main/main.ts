import {Component, inject, OnInit, signal, ViewChild, WritableSignal} from '@angular/core';
import {OwlOptions} from 'ngx-owl-carousel-o';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ServiceName, ServicesType} from '../../../types/services.type';
import {OtherServices} from '../../shared/services/other.services';
import {DefaultResponseType} from '../../../types/default-response.type';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ArticleServices} from '../../shared/services/article.services';
import {ArticleType} from '../../../types/article.type';
import {AuthService} from '../../shared/services/auth.service';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit {

  private _snackBar: MatSnackBar = inject(MatSnackBar);
  popup: boolean = false;
  popupErr: WritableSignal<boolean> = signal<boolean>(false);
  respPopup: WritableSignal<boolean> = signal<boolean>(false);
  articleTop: WritableSignal<ArticleType[]> = signal<ArticleType[]>([]);


  protected readonly ServiceName = ServiceName;

  private authService: AuthService = inject(AuthService);
  private articleServices: ArticleServices = inject(ArticleServices);
  private otherServices: OtherServices = inject(OtherServices);

  private fb: FormBuilder = inject(FormBuilder);

  popupForm: FormGroup = this.fb.group({
    service: [ServiceName.website, [Validators.required]],
    nameUser: ['', [Validators.required]],
    phoneUser: ['', [Validators.required]],
  });

  servicesType: { key: string; value: string }[] = Object.keys(ServicesType).map(key => ({
    key: key,
    value: ServicesType[key as keyof typeof ServicesType]
  }));

  ngOnInit() {
    this.articleServices.getArticlesTop()
      .subscribe({
        next: (data:ArticleType[] | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error) {
            this._snackBar.open((data as DefaultResponseType).message);
            this.popupErr.set(true);
            throw new Error((data as DefaultResponseType).message);
          }

          this.articleTop.set(data as ArticleType[]);
        },
        error: (): void => {
          this._snackBar.open('Нет ответа от системы ');
        }
      });
  }

  mainSliderOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    margin: 20, // настройка расстояния между слайдами за счет сдвига последнего слайда
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      940: {
        items: 1
      }
    },
    nav: false
  };
  reviewsSliderOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    margin: 25, // настройка расстояния между слайдами за счет сдвига последнего слайда
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      940: {
        items: 3
      }
    },
    nav: false
  };


  popupOpen(serv: ServiceName) {
    this.popupForm.get('service')?.setValue(serv);
    if(this.authService.getIsLoggedIn()){
      this.popupForm.get('nameUser')?.setValue(this.authService.getUserName());
    }else{
      this.popupForm.get('nameUser')?.setValue('');
    }
    this.popup = true;
  }

  popupClose() {
    this.popup = false;
    this.respPopup.set(false);
  }

  getServiceByKey(key: string): string | undefined {
    return ServicesType[key as keyof typeof ServicesType];
  }

  sendRequest() {
    const service = this.getServiceByKey(this.popupForm.value.service);

    if (this.popupForm.valid) {
      this.otherServices.request(this.popupForm.value.nameUser, this.popupForm.value.phoneUser, service)
        .subscribe({
          next: (data: DefaultResponseType): void => {
            if (data.error) {
              this._snackBar.open(data.message);
              this.popupErr.set(true);
              throw new Error(data.message);
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
