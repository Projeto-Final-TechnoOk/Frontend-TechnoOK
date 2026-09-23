import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviroments/enviroment';
import { CriarImovelDto } from '../models/imoveis/criar-imovel.dto';
import { AtualizarImovelDto } from '../models/imoveis/atualizar-imovel.dto';
import { Imovel } from '../models/imoveis/imovel.model';
import { ImoveisPaginados } from '../models/imoveis/imoveis-paginados.model';

@Injectable({
  providedIn: 'root',
})
export class ImoveisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/imoveis`;

  listar(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(this.apiUrl);
  }

  listarPaginado(pagina: number, limite: number): Observable<ImoveisPaginados> {
    return this.http.get<ImoveisPaginados>(
      `${this.apiUrl}/paginado?pagina=${pagina}&limite=${limite}`,
    );
  }

  contar(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar`);
  }

  criar(dto: CriarImovelDto): Observable<Imovel> {
    return this.http.post<Imovel>(this.apiUrl, dto);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: string, dto: AtualizarImovelDto): Observable<Imovel> {
    return this.http.patch<Imovel>(`${this.apiUrl}/${id}`, dto);
  }

  buscarPorId(id: string): Observable<Imovel> {
    return this.http.get<Imovel>(`${this.apiUrl}/${id}`);
  }
}
