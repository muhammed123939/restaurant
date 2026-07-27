import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/_services/core.service';

import { HeaderComponent } from './header/header.component';
import { navItems } from './sidebar/sidebar-data';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    HeaderComponent,
    TranslateModule,
    CommonModule
  ],
  templateUrl: './full.component.html',
  styleUrl: './full.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class FullComponent implements OnInit, OnDestroy {

  @ViewChild('content', { static: true })
  content!: MatSidenavContent;

  navItems = navItems;

  // Bottom navigation
  hideBottomNav = false;
  private lastScrollTop = 0;

  // Layout
  options = this.settings.getOptions();
  isMobileScreen = false;

  private layoutChangesSubscription = Subscription.EMPTY;

  constructor(
    private settings: CoreService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {

    // Detect screen size
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW])
      .subscribe(state => {
        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
      });

    // Scroll to top on route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.content?.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.layoutChangesSubscription.unsubscribe();
  }

  onScroll(event: Event): void {

    const element = event.target as HTMLElement;
    const currentScroll = element.scrollTop;

    // Hide while scrolling down
    if (currentScroll > this.lastScrollTop && currentScroll > 80) {
      this.hideBottomNav = true;
    }
    // Show while scrolling up
    else if (currentScroll < this.lastScrollTop) {
      this.hideBottomNav = false;
    }

    this.lastScrollTop = currentScroll;
  }

}