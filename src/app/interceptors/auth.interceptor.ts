import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { environment } from '../../enviroments/enviroment';

export const authInterceptor: HttpInterceptorFn = (requisicao, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('technook_access_token');
  const requisicaoBackend = requisicao.url.startsWith(environment.apiUrl);
  let requisicaoFinal = requisicao;

  // Adiciona o JWT somente nas requisições destinadas ao backend da aplicação.
  if (token && requisicaoBackend) {
    requisicaoFinal = requisicao.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(requisicaoFinal).pipe(
    catchError((erro: HttpErrorResponse) => {
      const requisicaoLogin = requisicao.url === `${environment.apiUrl}/auth/login`;

      // Caso uma rota protegida retorne 401, remove a sessão e retorna ao login.
      if (erro.status === 401 && requisicaoBackend && !requisicaoLogin) {
        localStorage.removeItem('technook_access_token');
        localStorage.removeItem('technook_usuario');

        void router.navigate(['/login']);
      }

      return throwError(() => erro);
    }),
  );
};
