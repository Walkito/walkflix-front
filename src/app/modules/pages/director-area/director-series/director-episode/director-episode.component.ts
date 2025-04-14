import { AfterViewInit, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Episode } from 'app/modules/interfaces/episode';
import { EpisodeService } from 'app/shared/services/episode.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { NzListModule } from 'ng-zorro-antd/list';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { DatePipe } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { EpisodeFormComponent } from './episode-form/episode-form/episode-form.component';
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
  #modal = inject(NzModalService);
  #subscriptions: Subscription[] = [];

  episodes: Episode[] = [];
  pageIndex = 1;
  pageSize = 8;

  ngAfterViewInit(): void {
    if (this.serieId !== 0 && this.serieId !== undefined) {
      this.searchEpisodes();
    }
  }

  showModal(option: string, id: number) {
    switch (option) {
      case 'Cadastrar': {
        const modalRef = this.#modal.create({
          nzContent: EpisodeFormComponent,
          nzWidth: '52vw',
          nzBodyStyle: { overflowY: 'auto', maxHeight: 'calc(100vh - 87px)' },
          nzStyle: { top: '10px', width: '1200px' },
          nzData: {
            title: 'Cadastrar Episódio',
            create: true,
            idSerie: this.serieId
          },
          nzFooter: [
            {
              label: 'Voltar',
              type: 'default',
              onClick: () => {
                modalRef.close();
                this.unsubscribeAll();
              }
            },
            {
              label: 'Cadastrar',
              type: 'primary',
              onClick: () => {
                const instance = modalRef.getContentComponent() as EpisodeFormComponent

                this.unsubscribeAll();

                this.#subscriptions.push(instance.closeModal.subscribe(() => modalRef.close()));
                this.#subscriptions.push(instance.searchEpisodes.subscribe(() => {
                  this.searchEpisodes()

                  if (instance.imageError) {
                    this.showModal('Atualizar', instance.idEpisode);
                  }
                }
                ));

                instance.createEpisode();
              }
            },
          ],
          nzClosable: false
        });
        break;
      }
      case 'Atualizar': {
        const modalRef = this.#modal.create({
          nzContent: EpisodeFormComponent,
          nzWidth: '52vw',
          nzBodyStyle: { overflowY: 'auto', maxHeight: 'calc(100vh - 87px)' },
          nzStyle: { top: '10px', width: '1200px' },
          nzData: {
            title: 'Editar Episódio',
            create: false,
            idSerie: this.serieId,
            idEpisode: id
          },
          nzFooter: [
            {
              label: 'Voltar',
              type: 'default',
              onClick: () => {
                modalRef.close();
                this.unsubscribeAll();
              }
            },
            {
              label: 'Atualizar',
              type: 'primary',
              onClick: () => {
                const instance = modalRef.getContentComponent() as EpisodeFormComponent

                this.unsubscribeAll();

                this.#subscriptions.push(instance.closeModal.subscribe(() => modalRef.close()));
                this.#subscriptions.push(instance.searchEpisodes.subscribe(() => this.searchEpisodes()));

                instance.editEpisode();
              }
            },
          ],
          nzClosable: false
        });
        break;
      }
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

  private unsubscribeAll() {
    this.#subscriptions.forEach(sub => sub.unsubscribe());
    this.#subscriptions = [];
  }

  private searchEpisodes() {
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
