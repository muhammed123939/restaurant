import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreService } from 'src/app/_services/core.service';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [RouterModule],
  template: `
    <a routerLink="/" class="logodark branding">
      <p>ERP Systems Solution</p>
    </a>
  `,
  styles: [`
    .branding {
      display: flex;
      align-items: center;
      text-decoration: none;
      font-weight: 700;
      font-size: 18px;
      color: #ff5a00;
      letter-spacing: 0.5px;
      transition: 0.2s ease;
    }

    .branding:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }

    p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .branding {
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      .branding {
        font-size: 14px;
      }
    }
  `]
})
export class BrandingComponent {
  options = this.coreService.getOptions();

  constructor(private coreService: CoreService) {}
}

//   template: `
//     <a href="/" class="logodark">
//       <!-- <img
//         src="./assets/images/logos/dark-logo.svg"
//         class="align-middle m-2"
//         alt="logo"
//       /> -->
//       <p>ERP Systems Solution</p>
//     </a>
//   `,
// })