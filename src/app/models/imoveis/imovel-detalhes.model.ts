import { TipoMedidor } from '../../enums/medidores/tipo-medidor';

export interface ImovelDetalhes {
  id: string;
  nome: string;
  endereco: string;

  medidores: {
    id: string;
    identificador: string;
    tipo: TipoMedidor;
  }[];

  ultimaLeitura: {
    dataHora: Date;
    valor: number;
    medidorId: string;
    medidorIdentificador: string;
  } | null;
}
