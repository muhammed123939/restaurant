import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { authadminGuard } from './_guards/authadmin.guard';
import { MenuviewComponent } from 'src/app/pages/ui-components/menuview/menuview';
export const routes: Routes = [

  {
    path: '',
    component: FullComponent,
    children: [
      { path: 'menuview', component: MenuviewComponent },        
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes')
            .then(m => m.AuthenticationRoutes)
      }
    ]
  },
  // Admin-protected routes
  {
    path: '',
    component: FullComponent,
    canActivate: [authadminGuard],
    children: [
      { path: 'dashboard', loadChildren: () => import('./pages/pages.routes').then(m => m.PagesRoutes) },
      { path: 'ui-components', loadChildren: () => import('./pages/ui-components/ui-components.routes').then(m => m.UiComponentsRoutes) },
      { path: 'extra', loadChildren: () => import('./pages/extra/extra.routes').then(m => m.ExtraRoutes) },
      { path: 'menuview/order/:id', component: MenuviewComponent },
      { path: 'menuview/Client/:id', component: MenuviewComponent },
      { path: 'menuview/table/:id', component: MenuviewComponent }
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'authentication/login' },
];

