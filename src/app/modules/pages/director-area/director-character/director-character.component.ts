import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Serie } from 'app/modules/interfaces/serie';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzOptionComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Actor } from 'app/modules/interfaces/actor';
import { Subject, Subscription, take, takeUntil } from 'rxjs';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Character } from 'app/modules/interfaces/character';
import { CharacterFormComponent } from './character-form/character-form.component';

@Component({
  selector: 'app-director-character',
  imports: [NzTableModule, NzSelectModule, NzButtonModule, NzIconModule, NzInputModule, FormsModule, ReactiveFormsModule, NzModalModule],
  templateUrl: './director-character.component.html',
  styleUrl: './director-character.component.scss',
})
export class DirectorCharacterComponent {
  #modal = inject(NzModalService);
  #subscriptions: Subscription[] = [];

  characters: Character[] = [];
  series: Serie[] = [];
  actors: Actor[] = [];
  selectedQuantity = signal(0);

  filterForm: FormGroup = new FormGroup({
    filterOption: new FormControl<string>('codigo'),
    description: new FormControl<string>(''),
    selectedSeries: new FormControl<Serie[]>([]),
    selectedActors: new FormControl<Actor[]>([])
  });

  searchCharacter() {

  }

  showModal(option: string, id: number) {
    switch (option) {
      case 'Cadastrar': {
        const modalRef = this.#modal.create({
          nzContent: CharacterFormComponent,
          nzWidth: '82vw',
          nzBodyStyle: { overflowY: 'auto', maxHeight: 'calc(100vh - 87px)' },
          nzStyle: { top: '10px', width: '1200px' },
          nzData: {
            title: 'Cadastrar Personagem'
          },
          nzFooter: [
            {
              label: 'Voltar',
              type: 'default',
              onClick: () => {
                modalRef.close();
              }
            },
            {
              label: 'Cadastrar',
              type: 'primary',
              onClick: () => {
                const instance = modalRef.getContentComponent() as CharacterFormComponent
                
                this.unsubscribeAll();
                
                this.#subscriptions.push(instance.closeModal.subscribe(() => modalRef.close()));

                instance.createCharacter();
              }
            }
          ],
          nzClosable: false
        });
        break;
      }
    }
  }

  private unsubscribeAll() {
    this.#subscriptions.forEach(sub => sub.unsubscribe());
    this.#subscriptions = [];
  }
}

