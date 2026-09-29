import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../enviroments/enviroment';

import { LoginDto } from '../models/auth/login.dto';
import { LoginResposta } from '../models/auth/login-resposta.model';
import { UsuarioAutenticado } from '../models/auth/usuario-autenticado.model';
import { CargoUsuario } from '../enums/usuarios/cargo-usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly chaveToken = 'technook_access_token';

  private readonly chaveUsuario = 'technook_usuario';

  // =====
  // Login
  // =====

  // Envia as credenciais para o backend e recebe o token JWT junto aos dados do usuário.
  login(dto: LoginDto): Observable<LoginResposta> {
    return this.http.post<LoginResposta>(`${this.apiUrl}/login`, dto);
  }

  // ======
  // Sessão
  // ======

  // Armazena o token JWT e os dados do usuário autenticado no navegador.
  salvarSessao(resposta: LoginResposta): void {
    localStorage.setItem(this.chaveToken, resposta.accessToken);
    localStorage.setItem(this.chaveUsuario, JSON.stringify(resposta.usuario));
  }

  // Retorna o token JWT armazenado.
  obterToken(): string | null {
    return localStorage.getItem(this.chaveToken);
  }

  // ======
  // Logout
  // ======

  // Remove os dados da sessão armazenados no navegador.
  logout(): void {
    localStorage.removeItem(this.chaveToken);
    localStorage.removeItem(this.chaveUsuario);
  }

  obterUsuario(): UsuarioAutenticado | null {
    const usuario = localStorage.getItem(this.chaveUsuario);
    if (!usuario) {
      return null;
    }

    return JSON.parse(usuario) as UsuarioAutenticado;
  }

  // ==========
  // Autorização
  // ==========

  // Verifica se o usuário atualmente autenticado possui cargo de administrador.
  ehAdmin(): boolean {
    const usuario = this.obterUsuario();

    return usuario?.cargo === CargoUsuario.ADMIN;
  }
}
