import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ClientService } from 'src/app/_services/client.service';
import { NotificationService } from 'src/app/_services/notification.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonModule } from '@angular/common';
import { EmployeeService } from 'src/app/_services/employee.service';
import { Appnotification } from 'src/app/_models/appnotification';
import { LanguageService } from 'src/app/_services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule, CommonModule ,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule ,TranslateModule
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})

export class HeaderComponent implements OnInit {
  unreadCount = 0;
notifications: Appnotification[] = [];
currentLang = localStorage.getItem('lang') || 'en';

  constructor(
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private languageService: LanguageService,
    public router: Router
  ) { }


  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();


ngOnInit(): void {
    const user = this.getCurrentUser();

  if (user?.id != null) {

    this.notificationService.loadUnread(Number(user.id));

    
  }

  this.notificationService.notifications$
    .subscribe(notifs => {
      this.notifications = notifs;
    });

  this.notificationService.unreadCount$
    .subscribe(count => {
      this.unreadCount = count;
    });
}

  editProfile(): void {
    const user = this.getCurrentUser();

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([
        '/ui-components',
        'edituser',
        user.id,
        user.role
      ]);
    });
  }

  getCurrentUser(): any | null {
    const employee = this.employeeService.currentEmployee();
    if (employee) return employee;
    const client = this.clientService.currentClient();
    if (client) return client;
     return null;
  }

  onBellClick(): void {

  const user = this.getCurrentUser();

  if (user?.id != null) {

    this.notificationService.loadUnread(Number(user.id));

    setTimeout(() => {
      this.notificationService.markAllAsRead(Number(user.id));
    }, 20000);

  }
}
 
  // markAllAsRead(): void {
  //   const user = this.getCurrentUser();
  //   if (user?.id != null) {
  //     this.notificationService.markAllAsRead(Number(user.id));
  //   }
  // }

changeLanguage(lang: string) {
  this.currentLang = lang;
  this.languageService.changeLanguage(lang);
}

  logout(): void {
    const employee= this.employeeService.currentEmployee();
    const client = this.clientService.currentClient();

    if (employee) {
      this.employeeService.logout();
    } else if (client) {
      this.clientService.logout();
    }
        this.router.navigate(['/authentication/login']);  
    setTimeout(() => window.location.reload(), 100);

  }

}