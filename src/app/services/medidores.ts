import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

import { MedidorListagem } from '../models/medidores/medidor-listagem';
import { ConsumoPeriodo } from '../models/medidores/consumo-periodo.model';
import { CriarMedidorDto } from '../models/medidores/criar-medidor.dto';
import { Medidor } from '../models/medidores/medidor.model';
import { AtualizarMedidorDto } from '../models/medidores/atualizar-medidor.dto';
import { MedidoresPaginados } from '../models/medidores/medidores-paginados.model';
import { MedidorDetalhes } from '../models/medidores/medidor-detalhes.model';
import { PeriodoConsumo } from '../models/imoveis/consumo-imovel';
import { ComparacaoConsumoMedidor } from '../models/medidores/comparacao-consumo-medidor.model';

@Injectable({
  providedIn: 'root',
})
export class MedidoresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/medidores`;

  // ===========
  // CRUD Básico
  // ===========

  listar(): Observable<MedidorListagem[]> {
    return this.http.get<MedidorListagem[]>(this.apiUrl);
  }

  criar(dto: CriarMedidorDto): Observable<Medidor> {
    return this.http.post<Medidor>(this.apiUrl, dto);
  }

  atualizar(id: string, dto: AtualizarMedidorDto): Observable<Medidor> {
    return this.http.patch<Medidor>(`${this.apiUrl}/${id}`, dto);
  }

  deletar(id: string): Observable<{ mensagem: string }> {
    return this.http.delete<{ mensagem: string }>(`${this.apiUrl}/${id}`);
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

  listarPaginado(pagina: number, limite: number): Observable<MedidoresPaginados> {
    return this.http.get<MedidoresPaginados>(
      `${this.apiUrl}/paginado?pagina=${pagina}&limite=${limite}`,
    );
  }

  // ===================
  // Medidor Específico
  // ===================

  buscarComDetalhes(id: string): Observable<MedidorDetalhes> {
    return this.http.get<MedidorDetalhes>(`${this.apiUrl}/${id}/detalhes`);
  }

  buscarComparacaoConsumo(
    medidorId: string,
    periodo: PeriodoConsumo,
  ): Observable<ComparacaoConsumoMedidor> {
    return this.http.get<ComparacaoConsumoMedidor>(`${this.apiUrl}/${medidorId}/comparacao`, {
      params: {
        periodo,
      },
    });
  }

  // ==================
  // Consumo do Medidor
  // ==================

  obterConsumo(
    medidorId: string,
    nivel: 'ano' | 'mes' | 'dia',
    ano?: number,
    mes?: number,
  ): Observable<ConsumoPeriodo[]> {
    const params: Record<string, string> = {
      nivel,
    };

    if (ano !== undefined) {
      params['ano'] = String(ano);
    }
    if (mes !== undefined) {
      params['mes'] = String(mes);
    }

    return this.http.get<ConsumoPeriodo[]>(`${this.apiUrl}/${medidorId}/consumo`, {
      params,
    });
  }
}
