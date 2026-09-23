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

@Injectable({
  providedIn: 'root',
})
export class MedidoresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/medidores`;

  listar(): Observable<MedidorListagem[]> {
    return this.http.get<MedidorListagem[]>(this.apiUrl);
  }

  listarPaginado(pagina: number, limite: number): Observable<MedidoresPaginados> {
    return this.http.get<MedidoresPaginados>(
      `${this.apiUrl}/paginado?pagina=${pagina}&limite=${limite}`,
    );
  }

  contar(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar`);
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

  obterConsumo(
    medidorId: string,
    nivel: 'ano' | 'mes' | 'dia',
    ano?: number,
    mes?: number,
  ): Observable<ConsumoPeriodo[]> {
    let params: Record<string, string> = {
      nivel,
    };

    if (ano !== undefined) {
      params['ano'] = String(ano);
    }
    if (mes !== undefined) {
      params['mes'] = String(mes);
    }

    return this.http.get<ConsumoPeriodo[]>(`${this.apiUrl}/${medidorId}/consumo`, { params });
  }
}
