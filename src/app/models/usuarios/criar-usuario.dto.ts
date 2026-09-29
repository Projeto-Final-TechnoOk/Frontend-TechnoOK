import { CargoUsuario } from '../../enums/usuarios/cargo-usuario';

export interface CriarUsuarioDto {
  nome: string;
  email: string;
  senha: string;
  cargo: CargoUsuario;
}
