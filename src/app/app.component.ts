import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, first } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  title = 'cinewalk-front';
  shouldShowHeader = true; // Controle de visibilidade do header

  constructor(private router: Router) {
    // Assine ao evento de mudança de rota
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Verifica se a rota é '/directors'
        this.shouldShowHeader = event.url !== '/director';
      }
    });
  }
}
