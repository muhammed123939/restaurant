import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Menu } from 'src/app/_models/menu';
import { MenuService } from 'src/app/_services/menu.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HomePageInfo } from 'src/app/_models/home-page-info';
import { HomePageInfoService } from 'src/app/_services/home-page-info.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-myhome',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './myhome.html',
  styleUrl: './myhome.scss',
})
export class Myhome implements OnInit {
isMenuOpen = false;
  topOrderedItems: Menu[] = [];
  homeInfo!: HomePageInfo;
mapUrl!: SafeResourceUrl;

  constructor(  private sanitizer: DomSanitizer ,private menuService: MenuService ,private honePageInfoService: HomePageInfoService ,    private router: Router , public authService: AuthService ,  private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadTopOrderedItems();
    this.loadmenuinfo();
  }

  toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
}
  scrollTo(sectionId: string): void {
  const element = document.getElementById(sectionId);

  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}


loadmenuinfo(): void {
  this.honePageInfoService.getHomeInfo().subscribe(res => {
    this.homeInfo = res;

    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${res.latitude},${res.longitude}&z=15&output=embed`
    );
  });
  console.log(this.mapUrl);

}

goToMenu(id: number): void {
    if(this.authService.isClientLoggedIn)
    {

  this.router.navigate(['/menuview', id]);
    }
 
    else {
  this.snackBar.open(
    'Please log in first to continue your order.',
    'Close',
    {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    }
  );
}
}

loadTopOrderedItems(): void {

  const branchID =
    this.authService.currentClient?.branchID ??
    this.authService.currentEmployee?.branchID;

  this.menuService.getTopOrderedItems(branchID).subscribe({
    next: items => this.topOrderedItems = items,
    error: err => console.error(err)
  });

}

}