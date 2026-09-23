import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../enviroments/enviroment';
import { LeituraListagem } from '../models/leituras/leitura-listagem';
import { LeiturasPaginadas } from '../models/leituras/leituras-paginadas.model';

@Injectable({
  providedIn: 'root',
})
export class LeiturasService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/leituras`;

  listarPaginado(pagina: number, limite: number): Observable<LeiturasPaginadas> {
    return this.http.get<LeiturasPaginadas>(
      `${this.apiUrl}/paginado?pagina=${pagina}&limite=${limite}`,
    );
  }
}
