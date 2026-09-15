import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { Observable } from 'rxjs';
import { MedidorListagem } from '../models/medidores/medidor-listagem';

@Service()
export class MedidoresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/medidores`;

  listar(): Observable<MedidorListagem[]> {
    return this.http.get<MedidorListagem[]>(this.apiUrl);
  }
}
