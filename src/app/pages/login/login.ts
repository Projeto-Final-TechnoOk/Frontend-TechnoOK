import { Component, inject, signal } from '@angular/core';

import { Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

import { BotaoComponent } from '../../components/botao/botao';
import { InputTextoComponent } from '../../components/input-texto/input-texto';

import { AuthService } from '../../services/auth';

@Component({
  imports: [BotaoComponent, InputTextoComponent],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  email = signal('');
  senha = signal('');
  carregando = signal(false);
  erro = signal('');

  // =====
  // Login
  // =====

  entrar(): void {
    const email = this.email().trim();
    const senha = this.senha();
    if (!email || !senha) {
      this.erro.set('Preencha o e-mail e a senha.');
      return;
    }

    this.carregando.set(true);
    this.erro.set('');
    this.authService
      .login({
        email,
        senha,
      })
      .subscribe({
        next: (resposta) => {
          // Guarda o JWT e os dados do usuário após um login realizado com sucesso.
          this.authService.salvarSessao(resposta);
          this.router.navigate(['/dashboard']);
        },

        error: (erro: HttpErrorResponse) => {
          this.carregando.set(false);
          if (erro.status === 401) {
            this.erro.set('E-mail ou senha inválidos.');
            return;
          }
          this.erro.set('Não foi possível realizar o login.');
        },
      });
  }
}
