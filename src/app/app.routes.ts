import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { LoginPage } from './pages/login/login';
import { AppLayout } from './layouts/app-layout/app-layout';
import { DashboardPage } from './pages/dashboard/dashboard';
import { ImoveisPage } from './pages/imoveis/imoveis';
import { MedidoresPage } from './pages/medidores/medidores';
import { LeiturasPage } from './pages/leituras/leituras';
import { ImovelPage } from './pages/imovel/imovel';
import { MedidorPage } from './pages/medidor/medidor';

import { authGuard } from './guards/auth.guard';
import { AuthService } from './services/auth';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const authService = inject(AuthService);

      return authService.obterToken() ? 'dashboard' : 'login';
    },
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: LoginPage,
      },
    ],
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardPage,
      },
      {
        path: 'imoveis',
        component: ImoveisPage,
      },
      {
        path: 'medidores',
        component: MedidoresPage,
      },
      {
        path: 'leituras',
        component: LeiturasPage,
      },
      {
        path: 'imoveis/:id',
        component: ImovelPage,
      },
      {
        path: 'medidores/:id',
        component: MedidorPage,
      },
    ],
  },
];
