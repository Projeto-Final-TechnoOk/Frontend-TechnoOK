import { CargoUsuario } from '../../enums/usuarios/cargo-usuario';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
}
