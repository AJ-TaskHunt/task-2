import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.roleId !== 1) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
