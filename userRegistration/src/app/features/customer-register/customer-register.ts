import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import {
  NonNullableFormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';
import { Router, RouterLink } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';

//Compare password
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('passwordHash');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-customer-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './customer-register.html',
  styleUrl: './customer-register.css',
})
export class CustomerRegister {
  registerForm!: FormGroup;
  imagePreview: string | null = null;
  imageError: string | null = null;
  passwordStrength = '';

  isEditMode = false;
  emailExists = false;
  mobileExists = false;
  originalEmail?: string = '';
  originalMobile?: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: NonNullableFormBuilder,
    private cdr: ChangeDetectorRef,
    private service: CustomerService,
    private alert : AlertService,
    private router : Router
  ) {
    this.registerForm = this.fb.group(
      {
        customerId: [0],
        name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
        address: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
        postcode: ['', [Validators.required, Validators.pattern('[0-9]{6}')]],
        gender: ['', Validators.required],
        passwordHash: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
        isActive: [true],
        profileImage: [null],
      },
      {
        validators: passwordMatchValidator,
      }
    );
  }

  /* async onImageSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];

  // ✅ VALIDATION
  this.imageError = this.imageService.validateImage(file);
  if (this.imageError) return;

  // ✅ RESIZE
  const resizedFile = await this.imageService.resizeImage(file);

  // ✅ PREVIEW
  this.imagePreview = await this.imageService.getPreview(resizedFile);

  // ✅ BIND TO FORM
  this.registerForm.patchValue({
    profileImage: resizedFile
  });
} */

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.imageError = null;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    // TYPE VALIDATION
    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Only JPG or PNG images are allowed';

      input.value = ''; // 🔥 reset file input
      this.imagePreview = null; // 🔥 show icon placeholder
      this.cdr.detectChanges();
      
      return;
    }

    // SIZE VALIDATION
    if (file.size > maxSize) {
      this.imageError = 'Image size must be less than 2MB';

      input.value = '';
      this.imagePreview = null;
      this.cdr.detectChanges();
      return;
    }

    // VALID IMAGE
    this.registerForm.patchValue({
      profileImage: file,
    });

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string; // 🔥 image replaces icon

      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  addCustomerData(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const fv = this.registerForm.value;
    const formData = new FormData();

    // formData.append('CustomerId', fv.customerId.toString());
    formData.append('Name', fv.name.trim());
    formData.append('Email', fv.email.trim().toLowerCase());
    formData.append('Mobile', fv.mobile.trim());
    formData.append('Address', fv.address.trim());
    formData.append('Gender', fv.gender);
    formData.append('PostCode', fv.postcode.trim());
    formData.append('PasswordHash', fv.passwordHash);
    formData.append('IsActive', fv.isActive.toString());

    // only append image if user selected it
    if (fv.profileImage) {
      formData.append('ProfileImage', fv.profileImage);
    }
    

    //code send to the api
    this.service.addCustomerData(formData).subscribe({
      next: (res: any) => {
        //console.log('API Response:', res);

        if (res.statusCode === 200 || res.statusCode === 201) {
          this.alert.success('Customer saved successfully').then(()=>this.router.navigate(['/login']));
          this.onReset(); //reset from after data added
        } else if(res.statusCode === 409) {
          this.alert.warning('emal or mobile already registed');
        }
        else{
          alert(res.message); // show backend validation error
        }
      },
      error: () => {
        //console.error(err);
        alert('Server error occurred');
      },
    });
  }

  /* onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // VALIDATION RULES
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    // TYPE CHECK
    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Only JPG and PNG images are allowed';
      input.value = '';
      return;
    }

    // SIZE CHECK
    if (file.size > maxSize) {
      this.imageError = 'Image size must be less than 2MB';
      input.value = '';
      return;
    }

    // Bind image to reactive form
    this.registerForm.patchValue({
      profileImage: file,
    });

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;

      // Force Angular to update UI immediately
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  } */

  //password Stewngth checker
  checkPasswordStrength() {
    const value = this.registerForm.get('passwordHash')?.value || '';

    if (value.length < 6) {
      this.passwordStrength = 'Weak';
    } else if (
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[\W]/.test(value)
    ) {
      this.passwordStrength = 'Strong';
    } else {
      this.passwordStrength = 'Medium';
    }
  }

  //get validator message
  hasError(controlName: string, errorName?: string): boolean {
    const control = this.registerForm.get(controlName);

    if (!control || !(control.touched || control.dirty)) return false;

    return errorName ? !!control.errors?.[errorName] : control.invalid;
  }

  onReset(): void {
    // Reset reactive form (keep default isActive = true)
    this.registerForm.reset({
      isActive: true,
    });

    // Reset image preview
    this.imagePreview = null;
    this.imageError = null;

    // CLEAR FILE INPUT (THIS IS REQUIRED)
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    //Optional: reset password strength
    this.passwordStrength = '';
  }

  //will check email or mobile already registred
  onKeyUpEmailMobile(): void {
    const email = this.registerForm.get('email')?.value;
    const mobile = this.registerForm.get('mobile')?.value;
    const customerId = this.registerForm.get('customerId')?.value || 0;

    this.emailExists = false;
    this.mobileExists = false;

    if (this.isEditMode) {
      const emailUnchanged = email === this.originalEmail;
      const mobileUnchanged = mobile === this.originalMobile;

      if (emailUnchanged && mobileUnchanged) {
        return;
      }
    }

    if (!email && !mobile) return;
    if (email && this.registerForm.get('email')?.invalid) return;
    if (mobile && this.registerForm.get('mobile')?.invalid) return;

    this.service.checkEmailMobile(email, mobile, customerId).subscribe((res) => {
      this.emailExists = res.emailExists;
      this.mobileExists = res.mobileExists;
    });
  }
}
