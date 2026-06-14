import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {LoaderService} from '../services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader implements OnInit {

  isShowed: WritableSignal<boolean> = signal<boolean>(false);

  constructor(private loaderService: LoaderService) {
  }

  ngOnInit() {
    this.loaderService.isShowed$
      .subscribe((isShowed: boolean) => {
        this.isShowed.set(isShowed);
      })
  }
}
