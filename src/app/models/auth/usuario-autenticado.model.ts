import { CargoUsuario } from '../../enums/usuarios/cargo-usuario';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
}
