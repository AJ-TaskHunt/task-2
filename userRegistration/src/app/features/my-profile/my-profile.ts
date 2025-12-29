import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { Router, RouterLink } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { Auth } from '../../core/guard/auth';

@Component({
  selector: 'app-my-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile {
  existingImageUrl!: string;
  profileForm!: FormGroup;
  loggedUser: any;
  imagePreview: string | null = null;
  selectedImage!: File | null;
  imageError: string | null = null;

  isEditMode = false;
  emailExists = false;
  mobileExists = false;
  originalEmail?: string = '';
  originalMobile?: string = '';

  constructor(
    private service: CustomerService,
    private fb: NonNullableFormBuilder,
    private router: Router,
    private alert: AlertService,
    private cdr: ChangeDetectorRef,
    private authState: Auth,
    private CService: CustomerService
  ) {
    this.profileForm = this.fb.group({
      customerId: [0],

      name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]+')]],

      address: ['', Validators.required],

      email: ['', [Validators.required, Validators.email]],

      mobile: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],

      postcode: ['', Validators.required],

      gender: ['', Validators.required],

      profileImage: [null],
    });
  }

  ngOnInit(): void {
    /* this.loadLoggedUser(); */
    this.loadMyProfile();
  }

  loadMyProfile() {
    this.service.MyProfileData().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          const cdata = res.result;

          this.profileForm.patchValue({
            customerId: cdata.customerId,
            name: cdata.name,
            address: cdata.address,
            email: cdata.email,
            mobile: cdata.mobile,
            postcode: cdata.postCode,
            gender: cdata.gender[0].toUpperCase() + cdata.gender.slice(1).toLowerCase(),
          });

          this.originalEmail = cdata.email;
          this.originalMobile = cdata.mobile;

          this.isEditMode = true;

          this.imagePreview = cdata.profileImage
            ? 'http://localhost:5084/images/' + cdata.profileImage
            : 'assets/images/Default.png';
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  onUpdate(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const fv = this.profileForm.value;
    const formData = new FormData();

    formData.append('Name', fv.name.trim());
    formData.append('Email', fv.email.trim().toLowerCase());
    formData.append('Mobile', fv.mobile.trim());
    formData.append('Address', fv.address.trim());
    formData.append('Gender', fv.gender);
    formData.append('PostCode', fv.postcode.trim());
    // formData.append('PasswordHash', fv.passwordHash);
    // formData.append('IsActive', fv.isActive.toString());

    if (this.selectedImage) {
      formData.append('ProfileImage', this.selectedImage);
    }

    this.service.updateMyProfile(formData).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          const newName = this.profileForm.value.name;

          // update reactive state
          this.authState.setUserName(newName);

          //sync session storage
          const user = JSON.parse(sessionStorage.getItem('user')!);
          user.name = newName;
          sessionStorage.setItem('user', JSON.stringify(user));

          this.alert
            .success('Success', 'Profile updated successfully')
            .then(() => this.loadMyProfile());
        } else {
          this.alert.error('Error', res.message);
        }
      },
      error: () => {
        this.alert.error('Error', 'Server error occurred');
      },
    });
  }

  /* loadLoggedUser() {
    const userData = sessionStorage.getItem('user');

    if (!userData) {
      this.router.navigate(['/login']);
      return;
    }

    this.loggedUser = JSON.parse(userData);

    //fill form

    console.log('Logged User:', this.loggedUser);

    this.profileForm.patchValue({
      name: this.loggedUser.name,
      address: this.loggedUser.address,
      email: this.loggedUser.email,
      mobile: this.loggedUser.mobile,
      postcode: this.loggedUser.postCode,
      gender: this.loggedUser.gender === 'male' ? 'Male' : 'Female',
    });
    
    
    this.imagePreview = this.loggedUser.profileImage
    ? 'http://localhost:5084/images/' + this.loggedUser.profileImage
    : 'assets/images/Default.png';
    
    console.log('Image URL:', this.imagePreview);

  }
 */
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.imageError = null;

    this.selectedImage = file;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    // TYPE VALIDATION
    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Only JPG or PNG images are allowed';

      input.value = ''; // reset file input
      this.imagePreview = null; //show icon placeholder
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

    // ✅ VALID IMAGE
    this.profileForm.patchValue({
      profileImage: file,
    });

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string; // image replaces icon

      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  hasError(controlName: string, errorName?: string): boolean {
    const control = this.profileForm.get(controlName);

    if (!control || !(control.touched || control.dirty)) return false;

    return errorName ? !!control.errors?.[errorName] : control.invalid;
  }

  //will check email or mobile already registred
  onKeyUpEmailMobile(): void {
    const email = this.profileForm.get('email')?.value;
    const mobile = this.profileForm.get('mobile')?.value;
    const customerId = this.profileForm.get('customerId')?.value || 0;

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
    if (email && this.profileForm.get('email')?.invalid) return;
    if (mobile && this.profileForm.get('mobile')?.invalid) return;

    this.CService.checkEmailMobile(email, mobile, customerId).subscribe((res) => {
      this.emailExists = res.emailExists;
      this.mobileExists = res.mobileExists;
    });
  }
}
