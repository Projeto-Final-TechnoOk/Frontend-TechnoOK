import { MedidorListagem } from './medidor-listagem';

export interface MedidoresPaginados {
  dados: MedidorListagem[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}
