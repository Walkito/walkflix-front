import { AfterViewInit, Component, EventEmitter, inject, Inject, OnInit, Optional, Output } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Serie } from 'app/modules/interfaces/serie';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Episode } from 'app/modules/interfaces/episode';
import { SeriesService } from 'app/shared/services/series.service';
import { Subject, take, takeUntil } from 'rxjs';
import { response } from 'express';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { NotificationService } from 'app/shared/services/notification.service';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
import { EpisodeService } from 'app/shared/services/episode.service';

@Component({
  selector: 'app-episode-form',
  imports: [ReactiveFormsModule, NzInputNumberModule, NzFormModule, NzDatePickerModule, NzUploadModule, NzIconModule, NzInputModule],
  templateUrl: './episode-form.component.html',
  styleUrl: './episode-form.component.scss'
})
export class EpisodeFormComponent implements AfterViewInit {
  @Output() closeModal = new EventEmitter<void>()
  @Output() searchEpisodes = new EventEmitter<void>()
  #series: Serie = {} as Serie;
  #serieService = inject(SeriesService);
  #notificationService = inject(NotificationService);
  #destroy$ = new Subject<void>();
  #episodeService = inject(EpisodeService);

  title: string = '';
  idSerie: number = 0;
  idEpisode: number = 0;
  create: boolean = true;
  thumbnailDTO: ImageDTO = {
    imageB64: "",
    fileName: ""
  };

  constructor(@Optional() @Inject(NZ_MODAL_DATA) public data: { title: string, id: number, create: boolean }) {
    if (!data) return;

    const { title, id, create } = data;

    this.title = title;
    this.idSerie = id;
    this.create = create;
  }

  ngAfterViewInit(): void {
    this.#serieService.getSeriesWithFilter(this.idSerie, '', [], 0).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.#series = response.obj[0];
      },
      error: (error) => {
        if (error.status === 404) {
          this.#notificationService.createNotification("Série não encontrada", "Não foi possível buscara a série vinculada", 1);
        }
        console.log(error);
      }
    });
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  episodeForm: FormGroup = new FormGroup({
    txEpisodeName: new FormControl<string>(''),
    dtRelease: new FormControl<Date>(new Date()),
    nuDuration: new FormControl<number>(1),
    txResume: new FormControl<string>(''),
  });

  createEpisode() {
    this.#episodeService.createEpisode(this.buildPayload()).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.idEpisode = response.obj.id;

        if(this.thumbnailDTO.fileName){
          //this.#episodeService.uploadActorPicture('series')
        }

        this.closeModal.emit();
        this.searchEpisodes.emit();
      }
    });
  }

  private buildPayload(): Episode {
    const totalEpisodes = this.#series.nuEpisode + 1;

    const payload: Episode = {
      id: 0,
      nuEpisode: totalEpisodes,
      txEpisodeName: this.episodeForm.get('txEpisodeName')?.value,
      txResume: this.episodeForm.get('txResume')?.value,
      dtRelease: this.episodeForm.get('dtRelease')?.value,
      nuDuration: this.episodeForm.get('nuDuration')?.value,
      idSeries: this.#series.id,
      txEpisodePicture: ''
    }

    return payload;
  }
}
