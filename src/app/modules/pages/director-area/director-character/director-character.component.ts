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
import { Character } from 'app/modules/interfaces/character';

@Component({
  selector: 'app-director-character',
  imports: [NzTableModule, NzSelectModule, NzButtonModule, NzIconModule, NzInputModule, FormsModule, ReactiveFormsModule, NzModalModule, DatePipe],
  templateUrl: './director-character.component.html',
  styleUrl: './director-character.component.scss'
})
export class DirectorCharacterComponent {

  characters : Character[] = [];
  series : Serie[] = [];
  actors : Actor[] = [];
  selectedQuantity = signal(0);
  
  filterForm : FormGroup = new FormGroup({

  });

  searchCharacter(){

  }

  showModal(option: string, id: number){
    
  }
}
