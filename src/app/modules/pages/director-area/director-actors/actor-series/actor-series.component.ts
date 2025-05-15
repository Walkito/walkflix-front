import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnInit } from '@angular/core';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Serie } from 'app/modules/interfaces/serie';
import { ActorService } from 'app/shared/services/actor.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-actor-series',
  imports: [NzListModule, NzIconModule, DatePipe],
  templateUrl: './actor-series.component.html',
  styleUrl: './actor-series.component.scss',
  providers: [DatePipe]
})
export class ActorSeriesComponent implements AfterViewInit {
  @Input() actorId!: number;
  #actorService = inject(ActorService);
  #destroy$ = new Subject<void>();

  actorSeries: Serie[] = [];
  pageIndex = 1;
  pageSize = 8;

  ngAfterViewInit(): void {
    if (this.actorId !== 0 && this.actorId !== undefined) {
      this.getActorSeries();
    }
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  onPageChange(index: number) {
    this.pageIndex = index;
  }

  get pagedSeries() {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.actorSeries.slice(start, start + this.pageSize);
  }

  private getActorSeries() {
    this.#actorService.getActorSeries(this.actorId).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.actorSeries = response.obj;
      },
      error: (error) => {
        if (error.error.status !== 404) {
          console.log(error);
        }
      }
    });
  }
}
