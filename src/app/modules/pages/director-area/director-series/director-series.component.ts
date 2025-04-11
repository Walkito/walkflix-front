import { Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import { Serie } from 'app/modules/interfaces/serie';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Actor } from 'app/modules/interfaces/actor';
import { SeriesService } from 'app/shared/services/series.service';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Subject, Subscription, take, takeUntil } from 'rxjs';
import { Utils } from 'app/shared/utils/utils.service';
import { DatePipe } from '@angular/common';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { SeriesFormComponent } from './series-form/series-form.component';
import { ActorService } from 'app/shared/services/actor.service';

@Component({
  selector: 'app-director-series',
  imports: [NzTableModule, NzSelectModule, NzButtonModule, NzIconModule, NzInputModule, FormsModule, ReactiveFormsModule, NzModalModule, DatePipe],
  templateUrl: './director-series.component.html',
  styleUrl: './director-series.component.scss',
  providers: [DatePipe, Utils, NzModalService]
})
export class DirectorSeriesComponent implements OnInit, OnDestroy {
  #seriesService = inject(SeriesService);
  #actorService = inject(ActorService);
  #modal = inject(NzModalService);
  #destroy$ = new Subject<void>();
  #descriptionValue: string = '';
  #filterOptionValue: string = 'codigo';
  #subscriptions: Subscription[] = [];
  #loadingButtonModal: boolean = false;
  #showUpdateButton: boolean = true;
  selectedQuantity = signal(0);

  series: Serie[] = [];
  directors: Actor[] = [];
  filterForm: FormGroup = new FormGroup({
    filterOption: new FormControl<string>('codigo'),
    description: new FormControl<string>(''),
    selectedDirectors: new FormControl<Actor[]>([])
  });

  ngOnInit(): void {
    this.getAllSeries();
    this.formRoutines();
    this.findAllDirectors();
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  getAllSeries(): void {
    this.#seriesService.getAllSerieS().pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: any) => {
        console.log(response);
        this.series = response.obj;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  searchSeries() {
    switch (this.#filterOptionValue) {
      case 'codigo': {
        this.getSeriesWithFilter(Number.parseInt(this.#descriptionValue) | 0, '', this.filterForm.get('selectedDirectors')?.value);
        break;
      }
      case 'nome': {
        this.getSeriesWithFilter(0, this.#descriptionValue, this.filterForm.get('selectedDirectors')?.value);
        break;
      }
    }
  }

  showModal(option: string, id: number) {
    switch (option) {
      case 'Cadastrar': {
        const modalRef = this.#modal.create({
          nzContent: SeriesFormComponent,
          nzWidth: '72vw',
          nzBodyStyle: { overflowY: 'auto', maxHeight: 'calc(100vh - 87px)' },
          nzStyle: { top: '10px', width: '1200px' },
          nzData: {
            directors: this.directors,
            title: 'Cadastrar Série',
            create: true
          },
          nzFooter: [
            {
              label: 'Voltar',
              type: 'default',
              onClick: () => {
                modalRef.close();
                this.unsubscribeAll();
              }
            },
            {
              label: 'Cadastrar',
              type: 'primary',
              loading: () => !!this.#loadingButtonModal,
              onClick: () => {
                const instance = modalRef.getContentComponent() as SeriesFormComponent

                this.unsubscribeAll();

                this.#subscriptions.push(instance.closeModal.subscribe(() => modalRef.close()));
                this.#subscriptions.push(instance.searchSeries.subscribe(() => {
                  this.getAllSeries()

                  const serieId = instance.idSerie;

                  if (instance.imageError) {
                    this.showModal('Atualizar', serieId)
                  }
                }));

                instance.createSeries()
              }
            },
          ],
          nzClosable: false
        });
        break;
      }
      case 'Atualizar': {
        const modalRef = this.#modal.create({
          nzContent: SeriesFormComponent,
          nzWidth: '72vw',
          nzBodyStyle: { overflowY: 'auto', maxHeight: 'calc(100vh - 87px)' },
          nzStyle: { top: '10px', width: '1200px' },
          nzData: {
            directors: this.directors,
            title: 'Editar Série',
            id: id,
            create: false
          },
          nzFooter: [
            {
              label: 'Voltar',
              type: 'default',
              onClick: () => {
                modalRef.close();
                this.unsubscribeAll();

                this.#showUpdateButton = true;
              }
            },
            {
              label: 'Atualizar',
              type: 'primary',
              loading: () => !!this.#loadingButtonModal,
              show: () => !!this.#showUpdateButton,
              onClick: () => {
                const instance = modalRef.getContentComponent() as SeriesFormComponent

                this.unsubscribeAll()

                this.#subscriptions.push(instance.closeModal.subscribe(() => modalRef.close()));
                this.#subscriptions.push(instance.searchSeries.subscribe(() => this.getAllSeries()));

                instance.editSeries();
              }
            },
          ],
          nzClosable: false
        });

        const instance = modalRef.getContentComponent() as SeriesFormComponent;
        this.#subscriptions.push(instance.showUpdateButton.subscribe((valor) => this.#showUpdateButton = valor ));
        break;
      }
    }
  }

  private unsubscribeAll() {
    this.#subscriptions.forEach(sub => sub.unsubscribe());
    this.#subscriptions = [];
  }

  private findAllDirectors(): void {
    this.#actorService.findAllDirectors().pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.directors = response.obj;
      },
      error: (error) => {
        if (error.status == 404){
          this.directors = [];
        }
      }
    });
  }

  private getSeriesWithFilter(id: number, seriesName: string, directors: Actor[]): void {
    this.#seriesService.getSeriesWithFilter(id, seriesName, directors, 0).pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: ApiResponse) => {
        this.series = response.obj;
      },
      error: (error) => {
        if (error.status == 404) {
          this.series = []
        } else {
          console.log(error)
        }
      }
    });
  }

  private formRoutines(): void {
    this.filterForm.get('selectedDirectors')?.valueChanges.pipe(takeUntil(this.#destroy$)).subscribe((value: Actor[]) => {
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
