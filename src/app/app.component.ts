import { AfterViewInit, Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, first } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NotificationService } from './shared/services/notification.service';
import { NzNotificationComponent } from 'ng-zorro-antd/notification';
import { Notification } from './modules/interfaces/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NzIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
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
