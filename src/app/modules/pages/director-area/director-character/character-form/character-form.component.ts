import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Inject, inject, OnInit, Optional, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Actor } from 'app/modules/interfaces/actor';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Character } from 'app/modules/interfaces/character';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
import { ActorService } from 'app/shared/services/actor.service';
import { CharacterService } from 'app/shared/services/character.service';
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
import { Subject, take, takeUntil } from 'rxjs';
import { NzCheckboxComponent } from "ng-zorro-antd/checkbox";

@Component({
  selector: 'app-character-form',
  imports: [NzFormModule, NzInputModule, NzInputNumberModule, ReactiveFormsModule, NzSelectModule, NzUploadModule, NzIconModule, NzImageModule, NzAlertModule, NzTabsModule, NzCheckboxComponent],
  templateUrl: './character-form.component.html',
  styleUrl: './character-form.component.scss',
  providers: [Utils, DatePipe]
})
export class CharacterFormComponent implements AfterViewInit {
  @Output() showUpdateButton = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<void>()
  @Output() searchCharacters = new EventEmitter<void>()

  #utils = inject(Utils);
  #notificationService = inject(NotificationService);
  #characterService = inject(CharacterService);
  #destroy$ = new Subject<void>();
  #character: Character = {} as Character;

  selectedTab: number = 0;
  title: string = "";
  create: boolean = true;
  idCharacter: number = 0;
  actors: Actor[] = [];
  imageError: boolean = false;

  characterPictureDTO: ImageDTO = {
    imageB64: '',
    fileName: ''
  }

  constructor(@Optional() @Inject(NZ_MODAL_DATA) public data: { title: string, id: number, create: boolean, actors: Actor[] }) {
    if (!data) return;

    const { title, id, create, actors } = data;

    this.title = title;
    this.create = create;
    this.idCharacter = id;
    this.actors = actors;
  }

  characterForm: FormGroup = new FormGroup({
    characterName: new FormControl<string>(''),
    status: new FormControl<string>('VIVO'),
    type: new FormControl<string>('PROTAGONISTA'),
    origin: new FormControl<string>(''),
    firstEpisode: new FormControl<number>(1),
    age: new FormControl<string>(''),
    biography: new FormControl<string>(''),
    actor: new FormControl<Actor>({} as Actor),
    isNpc: new FormControl<boolean>(false)
  });

  ngAfterViewInit(): void {
    if (!this.create) {
      this.getCharacter();
    }
  }

  createCharacter() {
    if (this.validateForms()) {
      const payload: Character = this.buildPayload();

      this.#characterService.createCharacter(payload).pipe(takeUntil(this.#destroy$)).subscribe({
        next: (response: ApiResponse) => {
          if (this.characterPictureDTO.fileName) {
            this.#characterService.uploadCharacterImage(`characters/${payload.actor.id} - ${payload.actor.txActorName}
               ${payload.actor.txActorSurname}/${payload.txCharacterName}/portrait/`, response.obj.id,
              this.characterPictureDTO).pipe(takeUntil(this.#destroy$)).subscribe({
                error: (error) => {
                  console.log(error);
                  this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imagem: ' + error.error.txMessage, 1);
                  this.imageError = true;
                }
              });
          }

          this.closeModal.emit();
          this.searchCharacters.emit();

          this.#notificationService.createNotification('Sucesso', 'Personagem criado com sucesso', 0);
        },
        error: (error) => {
          console.log(error);
          this.#notificationService.createNotification("Erro ao Criar o Personagem", `Não foi possível criar 
            o personagem. Error: ${error.error.txMessage}`, 1);
        }
      })
    }
  }

  editCharacter() {
    if(this.validateForms()){
      const payload : Character = this.buildPayload();

      this.#characterService.editCharacter(this.idCharacter, payload).pipe(takeUntil(this.#destroy$)).subscribe({
        next: () => {
          if(this.characterPictureDTO.fileName) {
            this.#characterService.uploadCharacterImage(`characters/${payload.actor.id} - ${payload.actor.txActorName}
                ${payload.actor.txActorSurname}/${payload.txCharacterName}/portrait/`, this.idCharacter, 
                this.characterPictureDTO).pipe(takeUntil(this.#destroy$)).subscribe({
                  error: (error) => {
                    console.log(error);
                    this.#notificationService.createNotification('Imagem não enviada', 'Erro ao enviar a imagem: ' + error.error.txMessage, 1);
                    this.imageError = true;
                  }
                });
          }

          this.closeModal.emit();
          this.searchCharacters.emit();

          this.#notificationService.createNotification('Sucesso', 'Personagem editado com sucesso', 0);
        },
        error: (error) => {
          console.log(error);
          this.#notificationService.createNotification("Erro ao Editar o Personagem", `Não foi possível editar 
            o personagem. Error: ${error.error.txMessage}`, 1);
        }
      })
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

  private getCharacter(): void {
    this.#characterService.searchCharacters(this.idCharacter, '', [], []).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.#character = response.obj[0];

        this.characterForm.patchValue({
          characterName: this.#character.txCharacterName,
          status: this.#character.tpCharacterStatus,
          type: this.#character.tpCharacterType,
          origin: this.#character.txOrigin,
          firstEpisode: this.#character.nuFirstEpisode,
          age: this.#character.txAge,
          biography: this.#character.txBiography,
          actor: this.#character.actor.id,
          isNpc: this.#character.tpNpc
        })

        this.#utils.downloadAndConvertToBase64(this.#character.txCharacterPicture).pipe(takeUntil(this.#destroy$)).subscribe({
          next: blob => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = () => {
              this.characterPictureDTO.imageB64 = reader.result as string;
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
        if (error.status !== 404) {
          console.log(error);
        }
      }
    });
  }

  private buildPayload(): Character {
    const selectedActorId: number = this.characterForm.get('actor')?.value;
    const actor: Actor = this.actors.filter(id => id.id === selectedActorId)[0];

    const payload: Character = {
      id: 0,
      actor: actor,
      txCharacterName: this.characterForm.get('characterName')?.value,
      nuFirstEpisode: this.characterForm.get('firstEpisode')?.value,
      tpCharacterStatus: this.characterForm.get('status')?.value,
      tpCharacterType: this.characterForm.get('type')?.value,
      txAge: this.characterForm.get('age')?.value,
      txOrigin: this.characterForm.get('origin')?.value,
      txBiography: this.characterForm.get('biography')?.value,
      tpNpc: this.characterForm.get('isNpc')?.value,
      txCharacterPicture: ''
    }

    return payload;
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
