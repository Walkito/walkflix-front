import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Serie } from 'app/modules/interfaces/serie';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzOptionComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Actor } from 'app/modules/interfaces/actor';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Subject, Subscription, take, takeUntil } from 'rxjs';
import { Utils } from 'app/shared/utils/utils.service';
import { DatePipe } from '@angular/common';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ActorService } from 'app/shared/services/actor.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { ActorFormComponent } from './actor-form/actor-form.component';
import { SeriesService } from 'app/shared/services/series.service';

@Component({
  selector: 'app-director-actors',
  imports: [NzTableModule, NzSelectModule, NzButtonModule, NzIconModule, NzInputModule, FormsModule, ReactiveFormsModule, NzModalModule, DatePipe],
  templateUrl: './director-actors.component.html',
  styleUrl: './director-actors.component.scss'
})
export class DirectorActorsComponent implements OnInit {
  #actorService = inject(ActorService);
  #seriesService = inject(SeriesService);
  #notificationService = inject(NotificationService);
  #destroy$ = new Subject<void>();
  #modal = inject(NzModalService);
  #descriptionValue: string = '';
  #filterOptionValue: string = 'codigo';
  #showUpdateButton: boolean = true;
  #subscriptions: Subscription[] = [];

  actors: Actor[] = [];
  series: Serie[] = [];
  selectedQuantity = signal(0);

  filterForm: FormGroup = new FormGroup({
    filterOption: new FormControl<string>('codigo'),
    description: new FormControl<string>(''),
    selectedSeries: new FormControl<Serie[]>([])
  });

  ngOnInit(): void {
    this.searchActors();
    this.getSeries();
    this.formRoutines();
  }

  showModal(option: string, id: number) {
    switch (option) {
      case 'Cadastrar': {
        const modalRef = this.#modal.create({
          nzContent: ActorFormComponent,
          nzWidth: '72vw',
          nzBodyStyle: { overflowY: 'auto', maxHeight: 'calc(100vh - 87px)' },
          nzStyle: { top: '10px', width: '1200px' },
          nzData: {
            title: 'Cadastrar Ator / Atriz'
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
                const instance = modalRef.getContentComponent() as ActorFormComponent

                this.unsubscribeAll();

                this.#subscriptions.push(instance.closeModal.subscribe(() => modalRef.close()));
                this.#subscriptions.push(instance.searchActors.subscribe(() => {
                  this.searchActors();

                  const actorId = instance.idActor;

                  if (instance.imageError) {
                    this.showModal('Atualizar', actorId);
                  }
                }));

                instance.createActor();
              }
            }
          ],
          nzClosable: false
        });
        break;
      }
      case 'Atualizar': {
        const modalRef = this.#modal.create({
          nzContent: ActorFormComponent,
          nzWidth: '72vw',
          nzBodyStyle: { overflowY: 'auto', maxHeight: 'calc(100vh - 87px)' },
          nzStyle: { top: '10px', width: '1200px' },
          nzData: {
            title: 'Atualizar Ator / Atriz',
            id: id,
            create: false
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
                        this.deleteActor(id);

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
                const instance = modalRef.getContentComponent() as ActorFormComponent

                this.unsubscribeAll();

                this.#subscriptions.push(instance.closeModal.subscribe(() => modalRef.close()));
                this.#subscriptions.push(instance.searchActors.subscribe(() => this.searchActors()));

                instance.editActor();
              }
            }
          ],
          nzClosable: false
        });

        const instance = modalRef.getContentComponent() as ActorFormComponent;
        this.#subscriptions.push(instance.showUpdateButton.subscribe((valor) => this.#showUpdateButton = valor));
        break;
      }
    }
  }

  searchActors() {
    switch (this.#filterOptionValue) {
      case 'codigo': {
        this.getActor(Number.parseInt(this.#descriptionValue) | 0, '', this.filterForm.get('selectedSeries')?.value);
        break;
      }
      case 'nome': {
        this.getActor(0, this.#descriptionValue, this.filterForm.get('selectedSeries')?.value);
        break;
      }
    }
  }

  private deleteActor(id: number) {
    this.#actorService.deleteActor(id).pipe(takeUntil(this.#destroy$)).subscribe({
      next: () => {
        this.getActor(0, '', []);
        this.#notificationService.createNotification("Sucesso", "Ator/Atriz deletado/deletada com sucesso", 0);
      },
      error: (error) => {
        console.log(error);
        this.#notificationService.createNotification("Erro", "Erro ao excluir o Ator/Atriz.", 1);
      }
    })
  }

  private unsubscribeAll() {
    this.#subscriptions.forEach(sub => sub.unsubscribe());
    this.#subscriptions = [];
  }

  private getSeries() {
    this.#seriesService.getSeries(0, '', []).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.series = response.obj;
      },
      error: (error) => {
        if (error.status !== 404) {
          console.log(error);
        }
      }
    })
  }

  private getActor(id: number, txActorName: string, series: Serie[]) {
    this.#actorService.getActor(id, txActorName, series).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.actors = response.obj;
        this.actors.forEach((actor, index) => {
          this.actors[index].status = actor.status.charAt(0) + actor.status.slice(1).toLowerCase();
        });
      },
      error: (error) => {
        if (error.status !== 404) {
          console.log(error);
        }
      }
    })
  }

  private formRoutines(): void {
    this.filterForm.get('selectedSeries')?.valueChanges.pipe(takeUntil(this.#destroy$)).subscribe((value: Serie[]) => {
      this.selectedQuantity.set(value.length - 1);
    });

    this.filterForm.get('description')?.valueChanges.pipe(takeUntil(this.#destroy$)).subscribe((value: string) => {
      this.#descriptionValue = value;
    });

    this.filterForm.get('filterOption')?.valueChanges.pipe(takeUntil(this.#destroy$)).subscribe((value: string) => {
      this.#filterOptionValue = value;
    });
  }
}
