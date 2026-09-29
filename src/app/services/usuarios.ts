import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

import { CriarUsuarioDto } from '../models/usuarios/criar-usuario.dto';
import { Usuario } from '../models/usuarios/usuario.model';

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
}
