import { TipoMedidor } from '../../enums/medidores/tipo-medidor';

export type MedidorListagem = {
  id: string;
  identificador: string;
  tipo: TipoMedidor;
  imovelId: string;
  imovelNome: string;
};
