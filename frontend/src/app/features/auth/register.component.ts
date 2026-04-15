import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/interfaces';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    InputTextModule, PasswordModule, ButtonModule,
    MessageModule, InputGroupModule, InputGroupAddonModule, SelectButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  selectedRole: UserRole = 'CLIENT';
  loading = signal(false);
  error = signal('');

  roleOptions = [
    { label: 'Cliente', value: 'CLIENT', icon: 'pi pi-user' },
    { label: 'Administrador', value: 'ADMIN', icon: 'pi pi-shield' },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onRegister(): void {
    this.loading.set(true);
    this.error.set('');
    this.authService.register(this.email, this.password, this.fullName, this.selectedRole).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate([res.user.role === 'ADMIN' ? '/dashboard' : '/portal']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Error al registrarse');
      },
    });
  }
}
