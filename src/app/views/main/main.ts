import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {OwlOptions} from 'ngx-owl-carousel-o';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ServiceName, ServicesType} from '../../../types/services.type';
import {OtherServices} from '../../shared/services/other.services';
import {DefaultResponseType} from '../../../types/default-response.type';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ArticleServices} from '../../shared/services/article.services';
import {ArticleCardType} from '../../../types/article.type';
import {AuthService} from '../../shared/services/auth.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Subject, takeUntil} from 'rxjs';

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
  articleTop: WritableSignal<ArticleCardType[]> = signal<ArticleCardType[]>([]);
  burger:WritableSignal<boolean>=signal<boolean>(false);

  protected readonly ServiceName: typeof ServiceName = ServiceName;

  private authService: AuthService = inject(AuthService);
  private articleServices: ArticleServices = inject(ArticleServices);
  private otherServices: OtherServices = inject(OtherServices);
  private destroy$:Subject<void> = new Subject<void>();

  private fb: FormBuilder = inject(FormBuilder);

  popupForm: FormGroup = this.fb.group({
    service: [ServiceName.website, [Validators.required]],
    nameUser: ['', [Validators.required]],
    phoneUser: ['', [Validators.required]],
  });

  // преобразование объекта перечесления в массив
  servicesType: { key: string; value: string }[] = Object.keys(ServicesType).map((key: string): {
    key: string;
    value: string
  } => ({
    key: key,
    value: ServicesType[key as keyof typeof ServicesType]
  }));

  ngOnInit(): void {
    this.otherServices.burger$.pipe(takeUntil(this.destroy$))
      .subscribe((burger: boolean) => {
        this.burger.set(burger);
      });
    this.articleServices.getArticlesTop()
      .subscribe({
        next: (data: ArticleCardType[] | DefaultResponseType): void => {
          this.articleTop.set(data as ArticleCardType[]);
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

  ngOnDestroy(): void {
    this.destroy$.next();   // Эмит сигнала завершения
    this.destroy$.complete(); // Освобождение ресурсов Subject
  }

// настройки для карусели баннеров
  mainSliderOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 20, // настройка расстояния между слайдами за счет сдвига последнего слайда
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      630: {
        items: 1,
        dots: true,
      },
      300: {
        items: 1,
        dots: false,
      }
    },
    nav: false
  };

  // настройки для карусели отзывов
  reviewsSliderOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    margin: 25, // настройка расстояния между слайдами за счет сдвига последнего слайда
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      1240: {
        items: 3
      },
      750: {
        items: 2
      },
      200: {
        items: 1
      }
    },
    nav: false
  };

// открытие окна заявки на услугу
  popupOpen(serv: ServiceName): void {
    this.popupForm.get('service')?.setValue(serv);
    if (this.authService.getIsLoggedIn()) { // если авторизован - имя заполняется автоматически
      this.popupForm.get('nameUser')?.setValue(this.authService.getUserName());
    } else {
      this.popupForm.get('nameUser')?.setValue('');
    }
    this.popup = true;
  }

  // закрытие окна заявки
  popupClose(): void {
    this.popup = false;
    this.respPopup.set(false);
  }

  // получение значения из перечисления услуг по ключу
  getServiceByKey(key: string): string | undefined {
    return ServicesType[key as keyof typeof ServicesType];
  }

  // отправка заявки на услугу
  sendRequest(): void {
    const service: string | undefined = this.getServiceByKey(this.popupForm.value.service);
    if (this.popupForm.valid) {
      this.otherServices.request(this.popupForm.value.nameUser, this.popupForm.value.phoneUser, service)
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
          }
        );
    }
  }

}
