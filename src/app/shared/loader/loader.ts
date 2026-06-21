import {Component, inject} from '@angular/core';
import {LoaderService} from '../services/loader.service';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {
  private loaderService: LoaderService = inject(LoaderService);
  isShowed = toSignal(this.loaderService.isShowed$, { initialValue: false });

}
