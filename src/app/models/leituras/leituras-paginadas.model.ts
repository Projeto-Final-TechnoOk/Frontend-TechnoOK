import { LeituraListagem } from './leitura-listagem';

export interface LeiturasPaginadas {
  dados: LeituraListagem[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}
