import { SetMetadata } from '@nestjs/common';

export type Role = 'USER' | 'MODERATOR' | 'ROOT';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
