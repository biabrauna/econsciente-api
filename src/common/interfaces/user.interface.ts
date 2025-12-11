export interface UserPayload {
  id: string;
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
