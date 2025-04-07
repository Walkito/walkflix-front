import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
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
import { HomeComponent } from '../../home/home.component';
import { SeriesFormComponent } from './series-form/series-form.component';
import { title } from 'node:process';
import { NotificationService } from 'app/shared/services/notification.service';

@Component({
  selector: 'app-director-series',
  imports: [NzTableModule, NzSelectModule, NzButtonModule, NzIconModule, NzInputModule, FormsModule, ReactiveFormsModule, NzModalModule, DatePipe],
  templateUrl: './director-series.component.html',
  styleUrl: './director-series.component.scss',
  providers: [DatePipe, Utils, NzModalService]
})
export class DirectorSeriesComponent implements OnInit, OnDestroy {
  #notificationService = inject(NotificationService);
  #service = inject(SeriesService);
  #modal = inject(NzModalService);
  #destroy$ = new Subject<void>();
  #descriptionValue: string = '';
  #filterOptionValue: string = 'codigo';
  #subscriptions: Subscription[] = [];
  #loadingButtonModal: boolean = false;

  selectedQuantity = signal(0);

  series: Serie[] = [];
  directors: Actor[] = [];
  filterForm: FormGroup = new FormGroup({
    filterOption: new FormControl<string>('codigo'),
    description: new FormControl<string>(''),
    selectedDirectors: new FormControl<Actor[]>([])
  });

  ngOnInit(): void {
    this.showModal('Atualizar', 1);
    this.getAllSeries();
    this.formRoutines();
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  getAllSeries(): void {
    this.#service.getAllSerieS().pipe(takeUntil(this.#destroy$)).subscribe({
      next: (response: any) => {
        this.series = response.obj;

        this.series.forEach((serie) => {
          if (!this.directors.some(s => s.id === serie.director.id)) {
            this.directors.push(serie.director);
          }
        });
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
              }
            },
            {
              label: 'Cadastrar',
              type: 'primary',
              loading: () => !!this.#loadingButtonModal,
              onClick: () => {
                const instance = modalRef.getContentComponent() as SeriesFormComponent

                this.#subscriptions.forEach(sub => sub.unsubscribe());
                this.#subscriptions = [];

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
              }
            },
            {
              label: 'Atualizar',
              type: 'primary',
              loading: () => !!this.#loadingButtonModal,
              onClick: () => {
                const instance = modalRef.getContentComponent() as SeriesFormComponent

                this.#subscriptions.forEach(sub => sub.unsubscribe());
                this.#subscriptions = [];

                this.#subscriptions.push(instance.hideUpdateButton.subscribe(() => {
                  console.log('Entrou');
                  modalRef.updateConfig({ nzFooter: null});
                }));
                this.#subscriptions.push(instance.closeModal.subscribe(() => modalRef.close()));
                this.#subscriptions.push(instance.searchSeries.subscribe(() => this.getAllSeries()));

                instance.editSeries();
              }
            },
          ],
          nzClosable: false
        });
        break;
      }
    }
  }

  private getSeriesWithFilter(id: number, seriesName: string, directors: Actor[]): void {
    this.#service.getSeriesWithFilter(id, seriesName, directors, 0).pipe(takeUntil(this.#destroy$)).subscribe({
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
