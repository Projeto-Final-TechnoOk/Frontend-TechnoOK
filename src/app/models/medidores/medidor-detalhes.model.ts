import { TipoMedidor } from '../../enums/medidores/tipo-medidor';

export interface MedidorDetalhes {
  id: string;
  identificador: string;
  tipo: TipoMedidor;

  imovel: {
    id: string;
    nome: string;
    endereco: string;
  };

  ultimaLeitura: {
    id: string;
    dataHora: string;
    valor: number;
  } | null;

  ultimasLeituras: {
    id: string;
    dataHora: string;
    valor: number;
  }[];
}
