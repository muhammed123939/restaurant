import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreService } from 'src/app/_services/core.service';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [RouterModule , TranslateModule],
  template: `
    <a routerLink="/" class="branding">
         <span>{{ 'NAV_MENU_LOGO' | translate }}</span>
    </a>
  `,
  styles: [`
  .branding {
  display: flex;
  align-items: center;
  justify-content: center;

  text-decoration: none;
  width: 100%;
  padding: 12px 16px;

  span {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    line-height: 1.3;

    background: linear-gradient(
      135deg,
      #f44336,
      #f44336,
      #0f172a
    );

    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    text-transform: capitalize;
    white-space: nowrap;

    transition: all 0.3s ease;
  }

  &:hover span {
    transform: scale(1.03);
    filter: brightness(1.1);
  }
}

/* English */
html[dir='ltr'] .branding {
  direction: ltr;
  text-align: left;
  justify-content: flex-start;
}

/* Arabic */
html[dir='rtl'] .branding {
  direction: rtl;
  text-align: right;
  justify-content: flex-end;
}

/* Tablet */
@media (max-width: 992px) {
  .branding span {
    font-size: 1.15rem;
  }
}

/* Mobile */
@media (max-width: 576px) {
  .branding span {
    font-size: 1rem;
    white-space: normal;
  }
}`]
})
export class BrandingComponent {
  options = this.coreService.getOptions();

  constructor(private coreService: CoreService) {}
}

