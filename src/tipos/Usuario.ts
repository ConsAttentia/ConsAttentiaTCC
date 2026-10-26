export interface Usuario {
  codigo: string;
  nome: string;
  email: string;
}

export type UsuarioTipo = Partial<Usuario>;
