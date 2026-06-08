import {
  Component,
  HostBinding,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NavItem } from './nav-item';
import { NavService } from '../../../../_services/nav.service';

import { ClientService } from 'src/app/_services/client.service';

import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TablerIconsModule,
    MaterialModule
  ],
  templateUrl: './nav-item.component.html',
})
export class AppNavItemComponent implements  OnChanges {

  @Input() item!: NavItem;
  @Input() depth = 0;
  @Output() notify = new EventEmitter<boolean>();

  expanded = false;
  @HostBinding('attr.aria-expanded') ariaExpanded = false;
  
  constructor(

    private clientService: ClientService,
    public navService: NavService,
    public router: Router
  ) {}


  ngOnChanges(changes: SimpleChanges): void {
    const url = this.navService.currentUrl();
    if (this.item?.route && url) {
      this.expanded = url.startsWith(`/${this.item.route}`);
      this.ariaExpanded = this.expanded;
    }
  }

  onItemSelected(item: NavItem): void {
    

    // Navigate
    if (!item.children?.length && item.route) {
      this.router.navigate([item.route]);
    }

    // Toggle children
    if (item.children?.length) {
      this.expanded = !this.expanded;
      this.ariaExpanded = this.expanded;
    }

    window.scroll({ top: 0, left: 0, behavior: 'smooth' });

    if (!this.expanded && window.innerWidth < 1024) {
      this.notify.emit(true);
    }
  }

  onSubItemSelected(item: NavItem): void {
    if (!item.children?.length && this.expanded && window.innerWidth < 1024) {
      this.notify.emit(true);
    }
  }

  openExternalLink(url?: string): void {
    if (url) window.open(url, '_blank');
  }


}
