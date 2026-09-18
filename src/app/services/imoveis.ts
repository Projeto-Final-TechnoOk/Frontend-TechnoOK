import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviroments/enviroment';
import { CriarImovelDto } from '../models/imoveis/criar-imovel.dto';

export interface Imovel {
  id: string;
  nome: string;
  endereco: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImoveisService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/imoveis`;

  listar(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(this.apiUrl);
  }

  contar(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar`);
  }

  criar(dto: CriarImovelDto): Observable<Imovel> {
    return this.http.post<Imovel>(this.apiUrl, dto);
  }
}
