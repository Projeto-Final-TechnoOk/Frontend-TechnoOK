import { TipoMedidor } from '../../enums/medidores/tipo-medidor';

export type PeriodoConsumo = '24h' | '7d' | '30d';

export interface IntervaloConsumo {
  inicio: string;
  fim: string;
  rotulo: string;
}

export interface MedidorConsumo {
  id: string;
  identificador: string;
  consumos: number[];
}

export interface ConsumoImovel {
  tipo: TipoMedidor;
  periodo: PeriodoConsumo;
  unidade: string;

  intervalos: IntervaloConsumo[];

  medidores: MedidorConsumo[];
}
