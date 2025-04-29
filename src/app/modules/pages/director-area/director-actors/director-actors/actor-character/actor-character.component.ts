import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, inject, Input } from '@angular/core';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Character } from 'app/modules/interfaces/character';
import { CharacterViewModel } from 'app/modules/interfaces/character-view-model';
import { ActorService } from 'app/shared/services/actor.service';
import { Utils } from 'app/shared/utils/utils.service';
import { NzListModule } from 'ng-zorro-antd/list';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-actor-character',
  imports: [NzListModule, DatePipe],
  templateUrl: './actor-character.component.html',
  styleUrl: './actor-character.component.scss',
  providers: [DatePipe]
})
export class ActorCharacterComponent implements AfterViewInit {
  @Input() actorId!: number;

  #actorService: ActorService = inject(ActorService);
  #utilsService: Utils = inject(Utils);
  #destroy$: Subject<void> = new Subject<void>();

  actorCharacters: CharacterViewModel[] = [];

  ngAfterViewInit(): void {
    this.getActorCharacters(this.actorId);
  }

  private getActorCharacters(id: number) {
    let characters: Character[] = [];
    this.#actorService.getActorCharacter(id).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        characters = response.obj;

        characters.forEach(character => {
          let actorCharacter: CharacterViewModel = {
            character: character,
            localCharacterPicture: ''
          }

          if (character.txCharacterPicture) {
            this.#utilsService.downloadAndConvertToBase64(character.txCharacterPicture).subscribe({
              next: blob => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);

                reader.onloadend = () => {
                  actorCharacter.localCharacterPicture = reader.result as string;
                };
              },
              error: error => {
                if (error.status !== 404) {
                  console.log(error);
                }
              }
            });
          }

          this.actorCharacters.push(actorCharacter);
        });
      }
    });
  }
}
