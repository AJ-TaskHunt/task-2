import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { CustomerRegister } from './features/customer-register/customer-register';
import { Home } from './features/home/home';
import { MyProfile } from './features/my-profile/my-profile';
import { AuthLayout } from './core/layouts/auth-layout/auth-layout';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { AdminLayout } from './core/layouts/admin-layout/admin-layout';
import { AddCustomer } from './features/admin/add-customer/add-customer';
import { adminGuard } from './core/guard/admin-guard';
import { userGuard } from './core/guard/user-guard';
import { AccessDenied } from './shared/access-denied/access-denied';
import { PageNotFound } from './shared/page-not-found/page-not-found';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayout,
    title : 'Admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'add-customer',
        component: AddCustomer,
        title : 'Add Customer',
        canActivate: [adminGuard],
      },
    ],
  },

  {
    path: 'access-denied',
    component: AccessDenied,
    title : 'Access Denied'
  },
  //Auth pages only(No navabar nedded)
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
    title: 'Login',
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: Login,
        title : 'Login'
      },
      {
        path: 'register',
        component: CustomerRegister,
        title : 'Register'
      },
    ],
  },

  //main app(with nav bar)

  {
    path: '',
    component: MainLayout,
    canActivate: [userGuard],
    children: [
      {
        path: 'myProfile',
        component: MyProfile,
        title : 'My Profile',
        canActivate: [userGuard],
      },
      {
        path: 'home',
        component: Home,
        title : 'Home',
        canActivate: [userGuard],
      },
    ],
  },
  // 404 (LAST)
  {
    path: '**',
    component: PageNotFound,
    title : 'Page not found'
  },
];
