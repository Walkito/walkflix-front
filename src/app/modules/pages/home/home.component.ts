import { AfterViewInit, Component, inject } from '@angular/core';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Serie } from 'app/modules/interfaces/serie';
import { NotificationService } from 'app/shared/services/notification.service';
import { SeriesService } from 'app/shared/services/series.service';
import { NzCarouselModule } from 'ng-zorro-antd/carousel'
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [NzCarouselModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit{
  #seriesService = inject(SeriesService);
  #notificationService = inject(NotificationService);
  #destroy$ = new Subject<void>();
  array = [1, 2, 3, 4];
  series: Serie[] = [];

  ngAfterViewInit(): void {
    this.getAllSeries();
  }

  private getAllSeries(): void {
    this.#seriesService.getSeries(0, '', []).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.series = response.obj;
      },
      error: (error) => {
        console.log(error);
        this.#notificationService.createNotification('Erro', 'Erro ao buscar as séries' + error.error.txMessage, 1);
      }
    });
  }
}
