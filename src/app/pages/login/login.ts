import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { BotaoComponent } from '../../components/botao/botao';
import { InputTextoComponent } from '../../components/input-texto/input-texto';

import { AuthService } from '../../services/auth';
import { UsuariosService } from '../../services/usuarios';
import { FormularioComponent } from '../../components/formulario/formulario';

import { switchMap } from 'rxjs';
@Component({
  imports: [BotaoComponent, InputTextoComponent, FormularioComponent],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class LoginPage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly usuariosService = inject(UsuariosService);

  ngOnInit(): void {
    this.verificarPrimeiroAdmin();
  }

  // =====
  // Login
  // =====

  email = signal('');
  senha = signal('');
  carregando = signal(false);
  erro = signal('');

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

  // ======================
  // Primeiro Administrador
  // ======================

  primeiroAdminDisponivel = signal(false);
  formularioPrimeiroAdminAberto = signal(false);

  nomePrimeiroAdmin = signal('');
  emailPrimeiroAdmin = signal('');
  senhaPrimeiroAdmin = signal('');

  erroPrimeiroAdmin = signal('');

  // Verifica se ainda não existe nenhum usuário cadastrado no sistema
  verificarPrimeiroAdmin(): void {
    this.usuariosService.primeiroAdminDisponivel().subscribe({
      next: (resposta) => {
        this.primeiroAdminDisponivel.set(resposta.disponivel);
      },

      error: (erro) => {
        console.error('Erro ao verificar disponibilidade do primeiro administrador:', erro);
      },
    });
  }

  // Abre ou fecha o formulário do primeiro administrador
  alterarFormularioPrimeiroAdmin(aberto: boolean): void {
    this.formularioPrimeiroAdminAberto.set(aberto);
    this.erroPrimeiroAdmin.set('');

    if (!aberto) {
      this.nomePrimeiroAdmin.set('');
      this.emailPrimeiroAdmin.set('');
      this.senhaPrimeiroAdmin.set('');
    }
  }

  // Valida os campos e cria o primeiro administrador do sistema
  criarPrimeiroAdmin(): void {
    const nome = this.nomePrimeiroAdmin().trim();
    const email = this.emailPrimeiroAdmin().trim();
    const senha = this.senhaPrimeiroAdmin();
    if (!nome || !email || !senha) {
      this.erroPrimeiroAdmin.set('Preencha todos os campos.');
      return;
    }
    this.erroPrimeiroAdmin.set('');

    this.usuariosService
      .criarPrimeiroAdmin({
        nome,
        email,
        senha,
      })
      .pipe(
        switchMap(() =>
          this.authService.login({
            email,
            senha,
          }),
        ),
      )
      .subscribe({
        next: (resposta) => {
          // Salva o JWT e os dados do primeiro administrador
          this.authService.salvarSessao(resposta);

          this.primeiroAdminDisponivel.set(false);
          this.alterarFormularioPrimeiroAdmin(false);

          // Redireciona para o sistema já autenticado
          this.router.navigate(['/dashboard']);
        },
        error: (erro: HttpErrorResponse) => {
          const mensagem = erro.error?.message;
          if (Array.isArray(mensagem)) {
            this.erroPrimeiroAdmin.set(mensagem.join(' '));
            return;
          }
          this.erroPrimeiroAdmin.set(mensagem || 'Não foi possível criar o administrador.');
        },
      });
  }
}
