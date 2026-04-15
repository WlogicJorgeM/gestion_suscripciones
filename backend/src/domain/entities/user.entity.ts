import { Role } from '../enums/role.enum';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly fullName: string,
    public readonly role: Role,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    email: string;
    password: string;
    fullName: string;
    role?: Role | string;
    createdAt?: Date;
    updatedAt?: Date;
  }): UserEntity {
    return new UserEntity(
      props.id,
      props.email,
      props.password,
      props.fullName,
      (props.role as Role) ?? Role.CLIENT,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  get isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }
}
