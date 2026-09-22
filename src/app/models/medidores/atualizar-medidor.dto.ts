import { TipoMedidor } from '../../enums/medidores/tipo-medidor';

export interface AtualizarMedidorDto {
  identificador: string;
  tipo: TipoMedidor;
  imovelId: string;
}
