import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  
  const router = inject(Router);
  const session = sessionStorage.getItem('user');
  
  if(session == null){
    router.navigate(['/login']);
    
    return false;
  }
  
  return true;
};
