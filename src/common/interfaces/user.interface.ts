export interface UserPayload {
  id: number;
  email: string;
  name: string;
  dataNascimento: Date;
  biografia?: string;
  pontos: number;
  seguidores: number;
  seguindo: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
