import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Menu } from 'src/app/_models/menu';
import { MenuService } from 'src/app/_services/menu.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-myhome',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './myhome.html',
  styleUrl: './myhome.scss',
})
export class Myhome implements OnInit {

  topOrderedItems: Menu[] = [];

  constructor(private menuService: MenuService ,   private router: Router) {}

  ngOnInit(): void {
    this.loadTopOrderedItems();
  }
  
goToMenu(id: number): void {
  this.router.navigate(['/menuview', id]);
}

  loadTopOrderedItems(): void {
    this.menuService.getTopOrderedItems().subscribe({
      next: (items: Menu[]) => {
        this.topOrderedItems = items;
      },
      error: (err) => {
        console.error('Failed to load top ordered items', err);
      }
    });
  }

}