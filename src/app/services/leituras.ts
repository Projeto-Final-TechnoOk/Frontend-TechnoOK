import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviroments/enviroment';
import { LeiturasPaginadas } from '../models/leituras/leituras-paginadas.model';
import { CriarLeituraDto } from '../models/leituras/criari-leitura.dto';

@Injectable({
  providedIn: 'root',
})
export class LeiturasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/leituras`;

  // ==================
  // Tabela de leituras
  // ==================

  listarPaginado(pagina: number, limite: number): Observable<LeiturasPaginadas> {
    return this.http.get<LeiturasPaginadas>(
      `${this.apiUrl}/paginado?pagina=${pagina}&limite=${limite}`,
    );
  }

  criar(dto: CriarLeituraDto): Observable<unknown> {
    return this.http.post(this.apiUrl, dto);
  }
}
