import { AfterViewInit, Component, EventEmitter, inject, Inject, OnInit, Optional, Output } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Serie } from 'app/modules/interfaces/serie';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Episode } from 'app/modules/interfaces/episode';
import { SeriesService } from 'app/shared/services/series.service';
import { Subject, take, takeUntil } from 'rxjs';
import { response } from 'express';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { NotificationService } from 'app/shared/services/notification.service';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
import { EpisodeService } from 'app/shared/services/episode.service';
import { Utils } from 'app/shared/utils/utils.service';

@Component({
  selector: 'app-episode-form',
  imports: [ReactiveFormsModule, NzInputNumberModule, NzFormModule, NzDatePickerModule, NzUploadModule, NzIconModule, NzInputModule],
  templateUrl: './episode-form.component.html',
  styleUrl: './episode-form.component.scss'
})
export class EpisodeFormComponent implements AfterViewInit {
  @Output() closeModal = new EventEmitter<void>()
  @Output() searchEpisodes = new EventEmitter<void>()
  series: Serie = {} as Serie;
  #serieService = inject(SeriesService);
  #utilsSerivce = inject(Utils);
  #notificationService = inject(NotificationService);
  #destroy$ = new Subject<void>();
  #episodeService = inject(EpisodeService);

  title: string = '';
  idSerie: number = 0;
  idEpisode: number = 0;
  create: boolean = true;
  imageError: boolean = false;
  thumbnailDTO: ImageDTO = {
    imageB64: "",
    fileName: ""
  };


  episodeForm: FormGroup = new FormGroup({
    txEpisodeName: new FormControl<string>(''),
    dtRelease: new FormControl<Date>(new Date()),
    nuDuration: new FormControl<number>(1),
    txResume: new FormControl<string>(''),
  });

  constructor(@Optional() @Inject(NZ_MODAL_DATA) public data: { title: string, idSerie: number, idEpisode: number, create: boolean }) {
    if (!data) return;

    const { title, idSerie, idEpisode, create } = data;

    this.title = title;
    this.idSerie = idSerie;
    this.idEpisode = idEpisode;
    this.create = create;
  }

  ngAfterViewInit(): void {
    this.#serieService.getSeriesWithFilter(this.idSerie, '', [], 0).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.series = response.obj[0];
      },
      error: (error) => {
        if (error.status === 404) {
          this.#notificationService.createNotification("Série não encontrada", "Não foi possível buscar a série vinculada", 1);
        }
        console.log(error);
      }
    });

    if (!this.create) {
      let episode: Episode = {} as Episode;
      this.#episodeService.getEpisode(this.idEpisode).pipe(takeUntil(this.#destroy$)).subscribe({
        next: (response: ApiResponse) => {
          episode = response.obj;

          this.episodeForm.patchValue({
            txEpisodeName: episode.txEpisodeName,
            dtRelease: episode.dtRelease,
            nuDuration: episode.nuDuration,
            txResume: episode.txResume
          });

          this.#utilsSerivce.downloadAndConvertToBase64(episode.txEpisodePicture).pipe(takeUntil(this.#destroy$)).subscribe({
            next: blob => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);

              reader.onloadend = () => {
                this.thumbnailDTO.imageB64 = reader.result as string;
              };
            },
            error: error => {
              if (error.status !== 404) {
                console.log(error);
              }
            }
          });
        },
        error: (error) => {
          if (error.status === 404) {
            this.#notificationService.createNotification("Episódio não encontrado", "Não foi possível buscar o episódio vinculado", 1);
          } else {
            console.log(error);
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  createEpisode() {
    if (this.validateForms()) {
      this.#episodeService.createEpisode(this.buildPayload()).pipe(takeUntil(this.#destroy$)).subscribe({
        next: (response: ApiResponse) => {
          this.idEpisode = response.obj.id;

          if (this.thumbnailDTO.fileName) {
            this.#episodeService.uploadEpisodePicture(`series/${this.series.txSeriesName}/episodes/thumbnails/`, this.idEpisode, this.thumbnailDTO).subscribe({
              error: (error) => {
                console.log(error);
                this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imagem: ' + error.error.txMessage, 1);
                this.imageError = true;
              }
            });
          }

          this.closeModal.emit();
          this.searchEpisodes.emit();


          this.#notificationService.createNotification('Sucesso', 'Episódio criado com sucesso!', 0);
          if (this.imageError) {
            this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imagem. Por favor, tente novamente na tela de edição. ', 1);
          }
        },
        error: (error) => {
          console.log(error);

          this.#notificationService.createNotification('Episódio não criado', 'Não foi possível criar o episódio.', 1);
        }
      });
    }
  }

  editEpisode() {
    if (this.validateForms()) {
      const payload = this.buildPayload();

      if (this.thumbnailDTO.fileName) {
        this.#episodeService.uploadEpisodePicture(`series/${this.series.txSeriesName}/episodes/thumbnails/`, this.idEpisode, this.thumbnailDTO).pipe(takeUntil(this.#destroy$)).subscribe({
          error: (error) => {
            console.log(error);
            this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imagem: ' + error.error.txMessage, 1);

            return;
          }
        })
      }

      this.#episodeService.editEpisode(this.idEpisode, payload).pipe(takeUntil(this.#destroy$)).subscribe({
        next: () => {
          this.closeModal.emit();
          this.searchEpisodes.emit();

          this.#notificationService.createNotification('Sucesso', 'Episódio editado com sucesso!', 0);
        },
        error: (error) => {
          console.log(error);
          this.#notificationService.createNotification('Episódio não editado', 'Não foi possível editar o episódio.', 1);
        }
      })
    }
  }

  handleChange(info: { file: NzUploadFile }) {
    this.#utilsSerivce.getBase64(info.file!.originFileObj!, (img: string) => {
      this.thumbnailDTO.imageB64 = img;
    });
    this.thumbnailDTO.fileName = info.file.name;
  }

  private validateForms(): boolean {
    if (!this.episodeForm.valid) {
      Object.entries(this.episodeForm.controls).forEach(([key, control]) => {
        if (control.invalid) {
          this.#notificationService.createNotification("Formulário Incompleto", "Existem campos inválidos no formulário.", 1);
        }
      });

      return false;
    } else {
      return true;
    }
  }

  private buildPayload(): Episode {
    const totalEpisodes = this.series.nuEpisode + 1;

    const payload: Episode = {
      id: 0,
      nuEpisode: totalEpisodes,
      txEpisodeName: this.episodeForm.get('txEpisodeName')?.value,
      txResume: this.episodeForm.get('txResume')?.value,
      dtRelease: this.episodeForm.get('dtRelease')?.value,
      nuDuration: this.episodeForm.get('nuDuration')?.value,
      idSeries: this.series.id,
      txEpisodePicture: ''
    }

    return payload;
  }
}
