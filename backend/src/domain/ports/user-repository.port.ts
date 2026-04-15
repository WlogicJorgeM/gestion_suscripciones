import { UserEntity } from '../entities/user.entity';
import { Role } from '../enums/role.enum';

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

/** Puerto: Contrato para el repositorio de usuarios */
export interface UserRepositoryPort {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: CreateUserData): Promise<UserEntity>;
  findAll(): Promise<UserEntity[]>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
