import { Component } from '@angular/core';
import {
  NonNullableFormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { AlertService } from '../../core/services/alert.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export function emailOrMobileValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^\d{10}$/

  const isEmail = emailRegex.test(value);
  const isMobile = mobileRegex.test(value);

  return isEmail || isMobile ? null : { emailOrMobile: true };
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private service: CustomerService,
    private alert: AlertService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, emailOrMobileValidator]], // email OR mobile
      passwordHash: ['', Validators.required],
    });
  }

  onLogin(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  const payload = {
    username: this.loginForm.value.username.trim(),
    passwordHash: this.loginForm.value.passwordHash.trim(),
  };

  this.service.onLogin(payload).subscribe({
    next: (res: any) => {
      console.log('LOGIN RESPONSE:', res);

      switch (res.statusCode) {

        //SUCCESS
        case 200:
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('user', JSON.stringify(res.result));

          // ADMIN
          if (res.result.roleId === 1) {
            sessionStorage.setItem('admin', 'Admin');

            this.alert.success(
              'Login Successful',
              `Welcome ${res.result.name}`
            ).then(() => {
              this.router.navigate(['/admin/add-customer']);
            });
          }

          // CUSTOMER
          if (res.result.roleId === 2) {
            this.alert.success(
              'Login Successful',
              `Welcome ${res.result.name}`
            ).then(() => {
              this.router.navigate(['/home']);
            });
          }
          break;

        // INVALID PASSWORD
        case 401:
          this.alert.error('Login Failed', 'Invalid username or password');
          break;

        // BLOCKED USER / UNAUTHORIZED
        case 403:
          this.alert.warning('Access Denied', res.message);
          break;

        // USER NOT FOUND
        case 404:
          this.alert.error('Login Failed', 'User not found');
          break;

        // ANY OTHER ERROR
        default:
          this.alert.error('Error', res.message || 'Something went wrong');
      }
    },

    // 🚨 SERVER / NETWORK ERROR
    error: () => {
      this.alert.error('Server Error', 'Unable to connect to server');
    }
  });
}


  //get validator message
  hasError(controlName: string, errorName?: string): boolean {
    const control = this.loginForm.get(controlName);

    if (!control || !(control.touched || control.dirty)) return false;

    return errorName ? !!control.errors?.[errorName] : control.invalid;
  }
}
