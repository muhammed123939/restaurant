import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Menu } from 'src/app/_models/menu';
import { MenuService } from 'src/app/_services/menu.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-myhome',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './myhome.html',
  styleUrl: './myhome.scss',
})
export class Myhome implements OnInit {

  topOrderedItems: Menu[] = [];

  constructor(private menuService: MenuService ,   private router: Router , public authService: AuthService) {}

  ngOnInit(): void {
    this.loadTopOrderedItems();
  }
  
goToMenu(id: number): void {
    if(this.authService.isClientLoggedIn)
    {

  this.router.navigate(['/menuview', id]);
    }
    else{
  Swal.fire({
        icon: 'error',
        title: 'Login First To Continue Your Order',
      });
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