import { TipoMedidor } from '../../enums/medidores/tipo-medidor';

export interface Medidor {
  id: string;
  identificador: string;
  tipo: TipoMedidor;
  imovel: {
    id: string;
    nome: string;
    endereco: string;
  };
}
