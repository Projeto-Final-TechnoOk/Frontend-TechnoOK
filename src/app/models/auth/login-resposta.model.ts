import { UsuarioAutenticado } from './usuario-autenticado.model';

export interface LoginResposta {
  accessToken: string;
  usuario: UsuarioAutenticado;
}
