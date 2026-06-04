import { Component } from '@angular/core';
import {OwlOptions} from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
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
}
