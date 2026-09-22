import { TipoMedidor } from '../../enums/medidores/tipo-medidor';

export interface CriarMedidorDto {
  identificador: string;
  tipo: TipoMedidor;
  imovelId: string;
}
