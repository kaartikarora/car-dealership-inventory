import { Role } from '../../generated/prisma/enums';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

// What the API is allowed to show about a user. The hash never leaves the service layer.
export type PublicUser = Omit<User, 'passwordHash'>;

export const toPublicUser = ({ id, name, email, role }: User): PublicUser => ({ id, name, email, role });

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
}
