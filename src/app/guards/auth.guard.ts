import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.obterToken();

  // Caso não exista um token armazenado, o usuário é redirecionado para o login.
  if (!token) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
