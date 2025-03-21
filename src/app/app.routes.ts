import { Routes } from '@angular/router';
import { HomeComponent } from './modules/pages/home/home.component';
import { DirectorAreaComponent } from './modules/pages/director-area/director-area.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Cinewalk'
  },
  {
    path: 'director',
    component: DirectorAreaComponent,
    title: 'Área do Diretor'
  }
];
