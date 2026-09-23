import { Imovel } from './imovel.model';

export interface ImoveisPaginados {
  dados: Imovel[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}
