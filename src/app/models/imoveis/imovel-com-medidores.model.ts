import { TipoMedidor } from '../../enums/medidores/tipo-medidor';

export interface ImovelComMedidores {
  id: string;
  nome: string;
  endereco: string;

  medidores: {
    id: string;
    identificador: string;
    tipo: TipoMedidor;
  }[];
}
