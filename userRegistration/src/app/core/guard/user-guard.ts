import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const userGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.roleId !== 2) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
