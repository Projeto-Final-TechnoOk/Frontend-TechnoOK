import { TipoMedidor } from '../../enums/medidores/tipo-medidor';
import { PeriodoConsumo } from '../imoveis/consumo-imovel';

export interface ComparacaoConsumoMedidor {
  tipo: TipoMedidor;
  periodo: PeriodoConsumo;
  unidade: string;

  mediaOutrosMedidores: number | null;
  quantidadeOutrosMedidores: number;
}
