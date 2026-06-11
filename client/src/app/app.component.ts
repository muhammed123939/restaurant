import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { ClientService } from './_services/client.service';
import { EmployeeService } from './_services/employee.service';
import { LanguageService } from './_services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet , TranslateModule],
  templateUrl: './app.component.html' ,
       styleUrl: './app.component.scss' 
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    public employeeService: EmployeeService,
    public clientservice: ClientService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {

    this.initializeApp();
  }

  // =========================
  // APP INITIALIZATION
  // =========================
  private initializeApp(): void {

    const lang = this.getSavedLanguage();

    this.languageService.changeLanguage(lang);

    this.applyDirection(lang);

    this.restoreSession();

    // future-ready hooks
    // this.authService.restoreToken();
    // this.themeService.init();
  }

  // =========================
  // LANGUAGE
  // =========================
  private getSavedLanguage(): string {
    return localStorage.getItem('lang') || 'en';
  }

  private applyDirection(lang: string): void {
    const isRtl = lang === 'ar';

    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  // =========================
  // SESSION RESTORE
  // =========================
  private restoreSession(): void {
    try {

      const employeeData = this.safeParse(localStorage.getItem('employeeLoginStorage'));
      const clientData = this.safeParse(localStorage.getItem('clientLoginStorage'));

      if (employeeData) {
        this.employeeService.setEmployee(employeeData);
        return; // avoid overwriting with client
      }

      if (clientData) {
        this.clientservice.setclient(clientData);
      }

    } catch (err) {
      console.error('Session restore error:', err);
      localStorage.clear();
    }
  }

  // =========================
  // SAFE JSON PARSER
  // =========================
  private safeParse(data: string | null): any {
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}