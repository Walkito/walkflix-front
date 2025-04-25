import { ImageDTO } from './../../../../interfaces/image-dto';
import { Component, EventEmitter, inject, Inject, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actor } from 'app/modules/interfaces/actor';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { Serie } from 'app/modules/interfaces/serie';
import { DatePipe } from '@angular/common';
import { Utils } from 'app/shared/utils/utils.service';
import { SeriesService } from 'app/shared/services/series.service';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Subject, takeUntil } from 'rxjs';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NotificationService } from 'app/shared/services/notification.service';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { DirectorEpisodeComponent } from '../director-episode/director-episode.component';
import { ActorService } from 'app/shared/services/actor.service';

@Component({
  selector: 'app-series-form',
  imports: [NzFormModule, NzInputModule, ReactiveFormsModule, NzSelectModule,
    NzDatePickerModule, NzUploadModule, NzIconModule, NzImageModule, NzCheckboxModule, NzAlertModule, NzTabsModule, DirectorEpisodeComponent],
  templateUrl: './series-form.component.html',
  styleUrl: './series-form.component.scss',
  providers: [DatePipe, Utils]
})
export class SeriesFormComponent implements OnInit, OnDestroy {
  @Output() closeModal = new EventEmitter<void>()
  @Output() searchSeries = new EventEmitter<void>()
  @Output() showUpdateButton = new EventEmitter<boolean>();

  #utils = inject(Utils);
  #seriesService = inject(SeriesService);
  #actorService = inject(ActorService);
  #destroy$ = new Subject<void>();
  #notificationService = inject(NotificationService);

  selectedTab: number = 0;
  create: boolean = false;
  idSerie: number = 0;
  directors: Actor[] = [];
  title: string = '';
  posterDTO: ImageDTO = {
    imageB64: "",
    fileName: ""
  };
  bannerDTO: ImageDTO = {
    imageB64: "",
    fileName: ""
  };
  thumbnailDTO: ImageDTO = {
    imageB64: "",
    fileName: ""
  };
  imageError: boolean = false;


  serieForms: FormGroup = new FormGroup({
    seriesName: new FormControl<string>(''),
    directors: new FormControl<Actor>({} as Actor),
    dtLaunch: new FormControl<Date>(new Date()),
    dtClosure: new FormControl<Date>(new Date()),
    classification: new FormControl<number>(0),
    status: new FormControl<string>(''),
    resume: new FormControl<string>(''),
    description: new FormControl<string>('')
  });

  constructor(@Optional() @Inject(NZ_MODAL_DATA) public data: { directors: Actor[], title: string, id: number, create: boolean }) {
    if (!data) return;

    const { directors, title, id, create } = data;

    this.directors = directors;
    this.title = title;
    this.idSerie = id;
    this.create = create;
  };

  ngOnInit(): void {
    if (!this.create) {
      let serie: Serie = {} as Serie;
      this.#seriesService.getSeriesWithFilter(this.idSerie, '', [], 0).pipe(takeUntil(this.#destroy$)).subscribe({
        next: (response: ApiResponse) => {
          serie = response.obj[0];

          this.serieForms.patchValue({
            seriesName: serie.txSeriesName,
            directors: serie.director.id,
            dtLaunch: serie.dtLaunch,
            dtClosure: serie.dtClosure,
            classification: serie.nuAgeClassification,
            status: serie.tpActive,
            resume: serie.txResume,
            description: serie.txDescription,
          });

          this.#utils.downloadAndConvertToBase64(serie.txPicturePoster).pipe(takeUntil(this.#destroy$)).subscribe({
            next: blob => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);

              reader.onloadend = () => {
                this.posterDTO.imageB64 = reader.result as string;
              };
            },
            error: error => {
              if (error.status !== 404) {
                console.log(error);
              }
            }
          }
          );

          this.#utils.downloadAndConvertToBase64(serie.txPictureBanner).pipe(takeUntil(this.#destroy$)).subscribe({
            next: blob => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);

              reader.onloadend = () => {
                this.bannerDTO.imageB64 = reader.result as string;
              };
            },
            error: error => {
              if (error.status !== 404) {
                console.log(error);
              }
            }
          }
          );

          this.#utils.downloadAndConvertToBase64(serie.txPictureThumbnail).pipe(takeUntil(this.#destroy$)).subscribe({
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
          }
          );
        }
      }
      );
    }
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  tabChange(index: number) {
    this.selectedTab = index;

    if (index === 1) {
      this.showUpdateButton.emit(false);
    } else {
      this.showUpdateButton.emit(true);
    }
  }

  handleChange(file: NzUploadChangeParam, type: number) {
    this.changeURLs(file, type);
  }

  changeURLs(info: { file: NzUploadFile }, type: number): void {
    switch (type) {
      case 0: {
        this.#utils.getBase64(info.file!.originFileObj!, (img: string) => {
          this.posterDTO.imageB64 = img;
        });
        this.posterDTO.fileName = info.file.name;
        break;
      }
      case 1: {
        this.#utils.getBase64(info.file!.originFileObj!, (img: string) => {
          this.bannerDTO.imageB64 = img;
        });
        this.bannerDTO.fileName = info.file.name;
        break;
      }
      case 2: {
        this.#utils.getBase64(info.file!.originFileObj!, (img: string) => {
          this.thumbnailDTO.imageB64 = img;
        });
        this.thumbnailDTO.fileName = info.file.name;
        break;
      }
    }
  }

  createSeries() {
    if (this.validateForms()) {
      const payload: Serie = this.buildPayload();

      this.#seriesService.createSeries(payload).subscribe({
        next: (response: ApiResponse) => {
          this.idSerie = response.obj.id;

          if (this.posterDTO.fileName) {
            this.#seriesService.uploadSeriesPicture(`series/${payload.txSeriesName}/posters/`, this.idSerie, 'Poster', this.posterDTO).pipe(takeUntil(this.#destroy$)).subscribe({
              error: (error) => {
                console.log(error);
                this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imagem: ' + error.error.txMessage, 1);
                this.imageError = true;
              }
            });
          }
          if (this.bannerDTO.fileName) {
            this.#seriesService.uploadSeriesPicture(`series/${payload.txSeriesName}/banners/`, this.idSerie, 'Banner', this.bannerDTO).pipe(takeUntil(this.#destroy$)).subscribe({
              error: (error) => {
                console.log(error);
                this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imagem: ' + error.error.txMessage, 1);
                this.imageError = true;
              }
            });
          }
          if (this.thumbnailDTO.fileName) {
            this.#seriesService.uploadSeriesPicture(`series/${payload.txSeriesName}/thumbnails/`, this.idSerie, 'Thumbnail', this.thumbnailDTO).pipe(takeUntil(this.#destroy$)).subscribe({
              error: (error) => {
                console.log(error);
                this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imagem: ' + error.error.txMessage, 1);
                this.imageError = true;
              }
            });
          }

          this.closeModal.emit();
          this.searchSeries.emit();

          this.#notificationService.createNotification('Sucesso', 'Série criada com sucesso!', 0)
          if (this.imageError) {
            this.#notificationService.createNotification('Imagem(s) não enviada', 'Erro ao enviar a(s) imagem(s). Por favor, tente novamente na tela de edição. ', 1);
          }
        },
        error: (error) => {
          console.log(error);
          this.#notificationService.createNotification('Série não criada', error.error.obj, 1);
        }
      });
    }
  }

  editSeries() {
    if (this.validateForms()) {
      const payload: Serie = this.buildPayload();

      if (this.posterDTO.fileName) {
        this.#seriesService.uploadSeriesPicture(`series/${payload.txSeriesName}/posters/`, this.idSerie, 'Poster', this.posterDTO).pipe(takeUntil(this.#destroy$)).subscribe({
          error: (error) => {
            console.log(error);
            this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imgagem: ' + error.error.txMessage, 1);
            return;
          }
        });
      }
      if (this.bannerDTO.fileName) {
        this.#seriesService.uploadSeriesPicture(`series/${payload.txSeriesName}/banners/`, this.idSerie, 'Banner', this.bannerDTO).pipe(takeUntil(this.#destroy$)).subscribe({
          error: (error) => {
            console.log(error);
            this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imgagem: ' + error.error.txMessage, 1);
            return;
          }
        });
      }
      if (this.thumbnailDTO.fileName) {
        this.#seriesService.uploadSeriesPicture(`series/${payload.txSeriesName}/thumbnails/`, this.idSerie, 'Thumbnail', this.thumbnailDTO).pipe(takeUntil(this.#destroy$)).subscribe({
          error: (error) => {
            console.log(error);
            this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imgagem: ' + error.error.txMessage, 1);
            return;
          }
        });
      }

      this.#seriesService.editSeries(this.idSerie, payload).pipe(takeUntil(this.#destroy$)).subscribe({
        next: () => {
          this.closeModal.emit();
          this.searchSeries.emit();

          this.#notificationService.createNotification('Sucesso', 'Série editada com sucesso!', 0)
        },
        error: (error) => {
          console.log(error);
          this.#notificationService.createNotification('Série não editada', error.error.obj, 1);
        }
      });
    }
  }

  private validateForms(): boolean {
    if (!this.serieForms.valid) {
      Object.entries(this.serieForms.controls).forEach(([key, control]) => {
        if (control.invalid) {
          this.#notificationService.createNotification("Formulário Incompleto", "Existem campos inválidos no formulário.", 1);
        }
      });

      return false;
    } else {
      return true;
    }
  }

  private buildPayload(): Serie {
    const selectedDirectorId: number = this.serieForms.get('directors')?.value;
    const director: Actor = this.directors.filter(id => id.id === selectedDirectorId)[0];

    const payload: Serie = {
      id: 0,
      director: director,
      txSeriesName: this.serieForms.get('seriesName')?.value,
      nuEpisode: 0,
      dtLaunch: this.#utils.formatDateDb(this.serieForms.get('dtLaunch')?.value),
      dtClosure: this.#utils.formatDateDb(this.serieForms.get('dtClosure')?.value),
      tpActive: this.serieForms.get('status')?.value,
      nuAgeClassification: this.serieForms.get('classification')?.value,
      txResume: this.serieForms.get('resume')?.value,
      txDescription: this.serieForms.get('description')?.value,
      txPictureBanner: '',
      txPicturePoster: '',
      txPictureThumbnail: ''
    };

    return payload;
  }
}
