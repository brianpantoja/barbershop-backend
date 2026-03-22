import { User } from '../modules/users/user.entity';

export type UserWithoutPassword = Omit<User, 'password'>;

export interface LoginResponse {
  access_token: string;
  user: UserWithoutPassword;
}
