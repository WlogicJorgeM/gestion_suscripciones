import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { map, catchError, of } from 'rxjs';

/**
 * Guard que bloquea funciones si la suscripción del usuario está "Vencida".
 * Redirige al dashboard con un mensaje si no tiene suscripción activa.
 */
export const subscriptionGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const apiService = inject(ApiService);
  const router = inject(Router);

  const user = authService.user();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  return apiService.getUserSubscriptions(user.id).pipe(
    map((subscriptions) => {
      const hasActive = subscriptions.some((s) => s.status === 'ACTIVE');
      if (!hasActive) {
        router.navigate(['/dashboard'], { queryParams: { expired: 'true' } });
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/dashboard']);
      return of(false);
    }),
  );
};
