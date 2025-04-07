import { AfterViewInit, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Episode } from 'app/modules/interfaces/episode';
import { EpisodeService } from 'app/shared/services/episode.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { NzListModule } from 'ng-zorro-antd/list';
import { Subject, takeUntil } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-director-episode',
  imports: [NzListModule, NzIconModule, NzPaginationModule, DatePipe],
  templateUrl: './director-episode.component.html',
  styleUrl: './director-episode.component.scss',
  providers: [DatePipe]
})

export class DirectorEpisodeComponent implements AfterViewInit {
  @Input() serieId!: number;
  #destroy$ = new Subject<void>();
  #episodeService = inject(EpisodeService);
  #notificationService = inject(NotificationService);
  episodes: Episode[] = [];
  pageIndex = 1;
  pageSize = 8;

  ngAfterViewInit(): void {
    if (this.serieId !== 0 && this.serieId !== undefined) {
      this.#episodeService.getAllEpisodes(this.serieId).pipe(takeUntil(this.#destroy$)).subscribe({
        next: (response: ApiResponse) => {
          this.episodes = response.obj;
        },
        error: (error) => {
          if (error.status !== 404) {
            console.log('Erro do episódio: ' + error);
            this.#notificationService.createNotification("Não foi possível buscar os episódios.", error.error.obj, 1);
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  get pagedEpisodes() {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.episodes.slice(start, start + this.pageSize);
  }

  onPageChange(index: number) {
    this.pageIndex = index;
  }
}
