import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject, inject, Optional, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Actor } from 'app/modules/interfaces/actor';
import { Character } from 'app/modules/interfaces/character';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
import { NotificationService } from 'app/shared/services/notification.service';
import { Utils } from 'app/shared/utils/utils.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzOptionComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabComponent, NzTabSetComponent, NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzUploadChangeParam, NzUploadComponent, NzUploadModule } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-character-form',
  imports: [NzFormModule, NzInputModule, NzInputNumberModule, ReactiveFormsModule, NzSelectModule, NzUploadModule, NzIconModule, NzImageModule, NzAlertModule, NzTabsModule, DatePipe],
  templateUrl: './character-form.component.html',
  styleUrl: './character-form.component.scss',
  providers: [Utils, DatePipe]
})
export class CharacterFormComponent {
  @Output() showUpdateButton = new EventEmitter<boolean>();

  #utils = inject(Utils);
  #notificationService = inject(NotificationService);


  selectedTab: number = 0;
  title: string = "";
  actor: Actor = {} as Actor;
  actors: Actor[] = [];
  
  characterPictureDTO: ImageDTO = {
    imageB64: '',
    fileName: ''
  }

  constructor(@Optional() @Inject(NZ_MODAL_DATA) public data: { title: string, id: number, create: boolean }) {
    if (!data) return;

    const { title, id, create } = data;

    this.title = title;
  }

  characterForm: FormGroup = new FormGroup({
    characterName: new FormControl<string>(''),
    status: new FormControl<string>('alive'),
    type: new FormControl<string>('protagonist'),
    origin: new FormControl<string>(''),
    firstEpisode: new FormControl<number>(1),
    age: new FormControl<string>(''),
    biography: new FormControl<string>('')
  });

  createCharacter() {
    if (this.validateForms()) {

    }
  }

  handleChange(file: NzUploadChangeParam, type: number) {
    this.#utils.getBase64(file.file!.originFileObj!, (img: string) => {
      this.characterPictureDTO.imageB64 = img;
    });
    this.characterPictureDTO.fileName = file.file.name;
  }

  tabChange(index: number) {
    this.selectedTab = index;

    if (index === 1) {
      this.showUpdateButton.emit(false);
    } else {
      this.showUpdateButton.emit(true);
    }
  }


  private validateForms(): boolean {
    if (!this.characterForm.valid) {
      Object.entries(this.characterForm.controls).forEach(([key, control]) => {
        if (control.invalid) {
          this.#notificationService.createNotification("Formulário Incompleto", "Existem campos inválidos no formulário.", 1);
        }
      });
      return false;
    } else {
      return true;
    }
  }
}
