import { Component, EventEmitter, inject, Inject, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Subject, take, takeUntil } from 'rxjs';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NotificationService } from 'app/shared/services/notification.service';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ActorService } from 'app/shared/services/actor.service';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
import { Actor } from 'app/modules/interfaces/actor';

@Component({
  selector: 'app-actor-form',
  imports: [NzFormModule, NzInputModule, ReactiveFormsModule, NzSelectModule,
    NzDatePickerModule, NzUploadModule, NzIconModule, NzImageModule, NzCheckboxModule, NzAlertModule, NzTabsModule],
  templateUrl: './actor-form.component.html',
  styleUrl: './actor-form.component.scss',
  providers: [Utils, DatePipe]
})
export class ActorFormComponent {
  @Output() closeModal = new EventEmitter<void>()
  @Output() searchActors = new EventEmitter<void>()
  @Output() showUpdateButton = new EventEmitter<boolean>();

  #utils = inject(Utils);
  #actorService = inject(ActorService);
  #notificationService = inject(NotificationService);
  #destroy$ = new Subject<void>();

  selectedTab: number = 0;
  title: string = '';
  imageError: boolean = false;
  idActor: number = 0;

  constructor(@Optional() @Inject(NZ_MODAL_DATA) public data: { title: string }) {
    if (!data) return;

    const { title } = data;

    this.title = title;
  };

  actorForm: FormGroup = new FormGroup({
    actorName: new FormControl<String>(''),
    actorSurname: new FormControl<String>(''),
    city: new FormControl<String>(''),
    birthday: new FormControl<Date>(new Date()),
    biography: new FormControl<String>(''),
    status: new FormControl<boolean>(true)
  });

  profilePictureDTO : ImageDTO = {
    fileName: '',
    imageB64: ''
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
    this.#utils.getBase64(file.file!.originFileObj!, (img: string) => {
      this.profilePictureDTO.imageB64 = img;
    });
    this.profilePictureDTO.fileName = file.file.name;
  }

  createActor() {
    const payload : Actor = this.buildPayLoad();

    this.#actorService.createActor(payload).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.idActor = response.obj.id;

        if(this.profilePictureDTO.fileName){
          this.#actorService.uploadProfilePicture(this.idActor, this.profilePictureDTO).pipe(takeUntil(this.#destroy$)).subscribe({
            error : (error) => {
              console.log(error);
              this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imagem: ' + error.error.txMessage, 1);
              this.imageError = true;
            }
          });
        }

        this.closeModal.emit();
        this.searchActors.emit();
      }
    });
  }

  private buildPayLoad() : Actor {
    const payload : Actor = {
      id : 0,
      txActorName : this.actorForm.get('actorName')?.value,
      txActorSurname : this.actorForm.get('actorSurname')?.value,
      dtBirthday : this.actorForm.get('birthday')?.value,
      txCity : this.actorForm.get('city')?.value,
      txBiography : this.actorForm.get('biography')?.value,
      txProfilePicture : '',
      status : this.actorForm.get('status')?.value === true ? 'ATIVO' : 'APOSENTADO'
    }

    return payload;
  }
}
