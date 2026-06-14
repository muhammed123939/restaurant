
  import {
  Component,
  Input,
  ViewEncapsulation,
  OnInit,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ClientService } from 'src/app/_services/client.service';
import { NotificationService } from 'src/app/_services/notification.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { Appnotification } from 'src/app/_models/appnotification';
import { LanguageService } from 'src/app/_services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatSidenav } from '@angular/material/sidenav';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-header',
    imports: [
RouterModule,
  CommonModule,
  MaterialModule,
  NgScrollbarModule,
  TranslateModule , TablerIconsModule   
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {

  // ================= INPUTS =================
  @Input() drawer!: MatSidenav;
  @Input() isOver = false;

  // ================= STATE =================
  unreadCount = 0;
  notifications: Appnotification[] = [];
  currentLang = localStorage.getItem('lang') || 'en';

  constructor(
    private clientService: ClientService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private languageService: LanguageService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    const user = this.getCurrentUser();

    if (user?.id) {
      this.notificationService.loadUnread(Number(user.id));
    }

    this.notificationService.notifications$
      .subscribe(n => this.notifications = n);

    this.notificationService.unreadCount$
      .subscribe(c => this.unreadCount = c);
  }

  // ================= USER =================
  getCurrentUser(): any {
    return this.employeeService.currentEmployee()
        || this.clientService.currentClient()
        || null;
  }

  // ================= PROFILE =================
  editProfile(): void {
    const user = this.getCurrentUser();

    if (!user) return;

    this.router.navigate([
      '/ui-components',
      'edituser',
      user.id,
      user.role
    ]);
  }

  // ================= NOTIFICATIONS =================
  onBellClick(): void {
    const user = this.getCurrentUser();

    if (!user?.id) return;

    this.notificationService.loadUnread(Number(user.id));

    setTimeout(() => {
      this.notificationService.markAllAsRead(Number(user.id));
    }, 20000);
  }

  // ================= LANGUAGE =================
  changeLanguage(lang: string): void {
    this.currentLang = lang;
    this.languageService.changeLanguage(lang);
  }

  // ================= LOGOUT =================
  logout(): void {
    const emp = this.employeeService.currentEmployee();
    const client = this.clientService.currentClient();

    if (emp) this.employeeService.logout();
    else if (client) this.clientService.logout();

    this.router.navigate(['/authentication/login']);
    setTimeout(() => window.location.reload(), 200);
  }
}