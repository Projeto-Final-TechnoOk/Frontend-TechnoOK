import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { Observable } from 'rxjs';
import { MedidorListagem } from '../models/medidores/medidor-listagem';
import { ConsumoPeriodo } from '../models/medidores/consumo-periodo.model';

@Service()
export class MedidoresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/medidores`;

  listar(): Observable<MedidorListagem[]> {
    return this.http.get<MedidorListagem[]>(this.apiUrl);
  }

  // Consumo
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
