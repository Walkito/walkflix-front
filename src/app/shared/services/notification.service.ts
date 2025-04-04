import { inject, Injectable, TemplateRef } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { type NzNotificationComponent, NzNotificationService } from 'ng-zorro-antd/notification';
import { title } from "process";
import { NzIconModule } from "ng-zorro-antd/icon";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private notification : NzNotificationService){
  }
  #template : TemplateRef<{$implicit: NzNotificationComponent; data: undefined }> | undefined;

  createNotification(title: string, message: string, opt: number): void {
    if(opt === 0){
      this.notification.success(title, message, {
        nzClass: 'sucess-notification'
      });
    } else {
      this.notification.error(title, message, {
        nzClass: 'error-notification'
      });
    }
  }
}
