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
import { CharacterService } from 'app/shared/services/character.service';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { NotificationService } from 'app/shared/services/notification.service';
import { SeriesService } from 'app/shared/services/series.service';
import { ActorService } from 'app/shared/services/actor.service';
import { create } from 'domain';

@Component({
  selector: 'app-director-character',
  imports: [NzTableModule, NzSelectModule, NzButtonModule, NzIconModule, NzInputModule, FormsModule, ReactiveFormsModule, NzModalModule],
  templateUrl: './director-character.component.html',
  styleUrl: './director-character.component.scss',
})
export class DirectorCharacterComponent implements OnInit {
  #modal = inject(NzModalService);
  #subscriptions: Subscription[] = [];
  #characterService = inject(CharacterService);
  #seriesService = inject(SeriesService);
  #actorService = inject(ActorService);
  #descriptionValue: string = '';
  #filterOptionValue: string = 'codigo';
  #destroy$ = new Subject<void>();
  #notificationService = inject(NotificationService);
  #showUpdateButton: boolean = true;

  characters: Character[] = [];
  series: Serie[] = [];
  actors: Actor[] = [];
  selectedSeriesQuantity = signal(0);
  selectedActorsQuantity = signal(0);

  filterForm: FormGroup = new FormGroup({
    filterOption: new FormControl<string>('codigo'),
    description: new FormControl<string>(''),
    selectedSeries: new FormControl<Serie[]>([]),
    selectedActors: new FormControl<Actor[]>([])
  });

  ngOnInit(): void {
    this.formRoutines();
    this.searchCharacter();
    this.getSeries();
    this.getActors();
  }

  searchCharacter() {
    switch (this.#filterOptionValue) {
      case 'codigo':
        this.getCharacter(Number.parseInt(this.#descriptionValue) | 0, '', this.filterForm.get('selectedSeries')?.value, this.filterForm.get('selectedActors')?.value);
        break;
      case 'nome':
        this.getCharacter(0, this.#descriptionValue, this.filterForm.get('selectedSeries')?.value, this.filterForm.get('selectedActors')?.value);
        break;
    }
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
            title: 'Cadastrar Personagem',
            create: true,
            actors: this.actors
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
                this.#subscriptions.push(instance.searchCharacters.subscribe(() => this.searchCharacter()));

                instance.createCharacter();
              }
            }
          ],
          nzClosable: false
        });
        break;
      }
      case 'Atualizar': {
        const modalRef = this.#modal.create({
          nzContent: CharacterFormComponent,
          nzWidth: '82vw',
          nzBodyStyle: { overflowY: 'auto', maxHeight: 'calc(100vh - 87px)' },
          nzStyle: { top: '10px', width: '1200px' },
          nzData: {
            title: 'Atualizar Personagem',
            id: id,
            create: false,
            actors: this.actors
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
              label: 'Excluir',
              type: 'primary',
              danger: true,
              show: () => this.#showUpdateButton,
              onClick: () => {
                const modalRefTwo = this.#modal.create({
                  nzTitle: 'Atenção',
                  nzContent: 'Deseja realmente excluir este Ator/Atriz?',
                  nzFooter: [
                    {
                      label: 'Cancelar',
                      type: 'default',
                      onClick: () => {
                        modalRefTwo.close();
                      }
                    },
                    {
                      label: 'Sim, tenho certeza',
                      type: 'primary',
                      onClick: () => {
                        //this.deleteActor(id);

                        modalRefTwo.close();
                        modalRef.close();
                      }
                    }
                  ]
                });
              }
            },
            {
              label: 'Atualizar',
              type: 'primary',
              show: () => !!this.#showUpdateButton,
              onClick: () => {
                const instance = modalRef.getContentComponent() as CharacterFormComponent

                this.unsubscribeAll();

                this.#subscriptions.push(instance.closeModal.subscribe(() => modalRef.close()));
                this.#subscriptions.push(instance.searchCharacters.subscribe(() => this.searchCharacter()));

                instance.editCharacter();
              }
            }
          ],
          nzClosable: false
        });

        const instance = modalRef.getContentComponent() as CharacterFormComponent;
        this.#subscriptions.push(instance.showUpdateButton.subscribe((valor) => this.#showUpdateButton = valor));
        break;
      }
    }
  }

  private getCharacter(id: number, characterName: string, series: Serie[], actors: Actor[]) {
    this.#characterService.searchCharacters(id, characterName, series, actors).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.characters = response.obj;
      },
      error: (error) => {
        console.log(error);
        this.#notificationService.createNotification("Erro", "Não foi possível buscar os personagems.", 1);
      }
    })
  }

  private getSeries() {
    this.#seriesService.getSeries(0, '', []).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.series = response.obj;
      },
      error: (error) => {
        console.log(error);
        this.#notificationService.createNotification("Erro", "Não foi possível buscar as séries.", 1);
      }
    });
  }

  private getActors() {
    this.#actorService.getActor(0, '', []).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.actors = response.obj;
      },
      error: (error) => {
        console.log(error);
        this.#notificationService.createNotification("Erro", "Não foi possível buscar os atores/atrizes.", 1);
      }
    });
  }

  private unsubscribeAll() {
    this.#subscriptions.forEach(sub => sub.unsubscribe());
    this.#subscriptions = [];
  }

  private formRoutines(): void {
    this.filterForm.get('selectedSeries')?.valueChanges.pipe(takeUntil(this.#destroy$)).subscribe((value: Serie[]) => {
      this.selectedSeriesQuantity.set(value.length - 1);
    });

    this.filterForm.get('selectedActors')?.valueChanges.pipe(takeUntil(this.#destroy$)).subscribe((value: Actor[]) => {
      this.selectedActorsQuantity.set(value.length - 1);
    });

    this.filterForm.get('description')?.valueChanges.pipe(takeUntil(this.#destroy$)).subscribe((value: string) => {
      this.#descriptionValue = value;
    });

    this.filterForm.get('filterOption')?.valueChanges.pipe(takeUntil(this.#destroy$)).subscribe((value: string) => {
      this.#filterOptionValue = value;
    });
  }
}

