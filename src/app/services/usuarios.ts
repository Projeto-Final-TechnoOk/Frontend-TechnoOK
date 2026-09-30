import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

import { Usuario } from '../models/usuarios/usuario.model';
import { CriarUsuarioDto } from '../models/usuarios/criar-usuario.dto';
import { CriarPrimeiroAdminDto } from '../models/usuarios/criar-primeiro-admin.dto';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  // ==================
  // Criação de Usuário
  // ==================

  criar(dto: CriarUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, dto);
  }

  // =========================
  // Criação do primeiro Admin
  // =========================

  primeiroAdminDisponivel(): Observable<{ disponivel: boolean }> {
    return this.http.get<{ disponivel: boolean }>(`${this.apiUrl}/primeiro-admin/disponivel`);
  }

  criarPrimeiroAdmin(dto: CriarPrimeiroAdminDto): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/primeiro-admin`, dto);
  }
}
