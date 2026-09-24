import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviroments/enviroment';
import { CriarImovelDto } from '../models/imoveis/criar-imovel.dto';
import { AtualizarImovelDto } from '../models/imoveis/atualizar-imovel.dto';
import { Imovel } from '../models/imoveis/imovel.model';
import { ImoveisPaginados } from '../models/imoveis/imoveis-paginados.model';
import { ImovelComMedidores } from '../models/imoveis/imovel-com-medidores.model';
import { ImovelDetalhes } from '../models/imoveis/imovel-detalhes.model';
import { ConsumoImovel, PeriodoConsumo } from '../models/imoveis/consumo-imovel';
import { TipoMedidor } from '../enums/medidores/tipo-medidor';

@Injectable({
  providedIn: 'root',
})
export class ImoveisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/imoveis`;

  // ===========
  // CRUD Básico
  // ===========

  listar(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(this.apiUrl);
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

  // =========
  // Dashboard
  // =========

  contar(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar`);
  }

  // ======
  // Tabela
  // ======

  listarPaginado(pagina: number, limite: number): Observable<ImoveisPaginados> {
    return this.http.get<ImoveisPaginados>(
      `${this.apiUrl}/paginado?pagina=${pagina}&limite=${limite}`,
    );
  }

  // =================
  // Imóvel Específico
  // =================

  buscarComMedidores(id: string): Observable<ImovelComMedidores> {
    return this.http.get<ImovelComMedidores>(`${this.apiUrl}/${id}/medidores`);
  }

  buscarComDetalhes(id: string): Observable<ImovelDetalhes> {
    return this.http.get<ImovelDetalhes>(`${this.apiUrl}/${id}/detalhes`);
  }

  buscarConsumo(id: string, tipo: TipoMedidor, periodo: PeriodoConsumo): Observable<ConsumoImovel> {
    return this.http.get<ConsumoImovel>(`${this.apiUrl}/${id}/consumo`, {
      params: {
        tipo,
        periodo,
      },
    });
  }
}
