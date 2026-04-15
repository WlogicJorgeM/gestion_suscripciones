import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort, USER_REPOSITORY } from '@domain/ports/user-repository.port';
import { Role } from '@domain/enums/role.enum';

export interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; fullName: string; role: string };
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, fullName: string, role?: Role): Promise<AuthResponse> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      email,
      password: hashedPassword,
      fullName,
      role: role ?? Role.CLIENT,
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      accessToken: token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      accessToken: token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }

  async getUsers(): Promise<{ id: string; email: string; fullName: string; role: string }[]> {
    const users = await this.userRepo.findAll();
    return users.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role }));
  }
}
