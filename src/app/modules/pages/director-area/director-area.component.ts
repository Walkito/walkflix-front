import { Component } from '@angular/core';
import {NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-director-area',
  imports: [NzTabsModule, NzIconModule, RouterLink],
  templateUrl: './director-area.component.html',
  styleUrl: './director-area.component.scss'
})
export class DirectorAreaComponent {
  tabs = [
    {name: 'Séries', icon: 'video-camera'},
    {name: 'Atores e Atrizes', icon: 'team'},
    {name: 'Personagens', icon: 'smile'}
  ]
}
