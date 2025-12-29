import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/services/alert.service';
import { CustomerService } from '../../../core/services/customer.service';
import { Observable } from 'rxjs';
import { Customer } from '../../../shared/models/customer.model';

// import { Subject,tap } from 'rxjs';
// import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-add-customer',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.css',
})
export class AddCustomer implements OnInit {
  AddOrUpdateCustomerForm!: FormGroup;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  imagePreview: string | null = null;
  imageError: string | null = null;

  //  customerList : any[] = [];

  customerList$!: Observable<Customer[]>;

  isEditMode = false;
  emailExists = false;
  mobileExists = false;

  originalEmail?: string = '';
  originalMobile?: string = '';

  /* for Table desing UI */
  // dtOptions: any = {};
  // @ViewChild(DataTableDirective, { static: false })
  // dtElement!: DataTableDirective;

  // dtTrigger: Subject<void> = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: NonNullableFormBuilder,
    private alert: AlertService,
    private CService: CustomerService
  ) {
    this.AddOrUpdateCustomerForm = this.fb.group({
      customerId: [0],
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
      address: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      postcode: ['', [Validators.required, Validators.pattern('[0-9]{6}')]],
      gender: ['', Validators.required],
      isActive: [true],
      profileImage: [null],
    });
  }

  ngOnInit(): void {
    /* this.dtOptions = {
      pagingType: 'simple_numbers',
      pageLength: 5,
      responsive: true,
      dom: 'Bfrtip', // enables buttons
      buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
    }; */

    //this.customerList$ = this.CService.getAllCustomers();

    this.loadCustomers();
    //this.getAllCustomers();
  }
  /* getAllCustomers(): void {
    //this.CService.getAllCustomers().pipe(map((res) => res.result ?? []));
    this.CService.getAllCustomers().subscribe({
    next: (res: any) => {
      // res is actually the full API response
      this.customerList = res.result ?? [];
    },
    error: () => {
      console.error('Error fetching customers');
    }
  });
  } */

  loadCustomers(): void {
    this.customerList$ = this.CService.getAllCustomers();
  }
  //add customer Data
  addCustomerData() {
    if (this.AddOrUpdateCustomerForm.invalid) {
      this.AddOrUpdateCustomerForm.markAllAsTouched();
      return;
    }

    const fv = this.AddOrUpdateCustomerForm.value;
    const formData = new FormData();

    formData.append('CustomerId', String(fv.customerId ?? 0));
    formData.append('Name', (fv.name ?? '').trim());
    formData.append('Email', (fv.email ?? '').trim().toLowerCase());
    formData.append('Mobile', (fv.mobile ?? '').trim());
    formData.append('Address', (fv.address ?? '').trim());
    formData.append('PostCode', (fv.postcode ?? '').trim());
    formData.append('Gender', fv.gender ?? '');
    formData.append('IsActive', String(fv.isActive ?? false));

    //formData.append('PasswordHash', fv.passwordHash);
    formData.append('IsActive', String(fv.isActive ?? false));

    //only select image if admin choose file
    if (fv.profileImage) {
      formData.append('ProfileImage', fv.profileImage);
    }

    //now the code for data send to api

    this.CService.addCustomerData(formData).subscribe({
      next: (res: any) => {
        console.log('api response', res);

        if (res.statusCode === 200 || res.statusCode === 201) {
          this.alert.success('Customer saved successfully');
          this.onReset(); //form clear
          this.isEditMode = false;

          this.loadCustomers();
        } else if (res.statusCode === 409) {
          this.alert.warning('emal or mobile already registed');
        }
      },
      error: () => {
        alert('Server error occurred');
      },
    });
  }

  //delete customer data
  deleteCustomerDataById(id: number): void {
    this.alert.confirm('Are you sure?', 'Customer data will be deleted').then((result: any) => {
      if (result.isConfirmed) {
        
        this.CService.deleteCusomerData(id).subscribe({
          next: (res: any) => {
            if (res.statusCode === 200) {
              this.alert.success('Deleted', 'Customer deleted successfully');
              this.loadCustomers();
            }
          },
          error: () => {
            this.alert.error('Error', 'Server error occurred');
          },
        });
      }
    });
  }

  //image preview and validation
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.imageError = null;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Only JPG or PNG images are allowed';

      input.value = '';
      this.imagePreview = null;
      this.cdr.detectChanges();

      return;
    }

    if (file.size > maxSize) {
      this.imageError = 'Image size must be less than 2MB';

      input.value = '';
      this.imagePreview = null;
      this.cdr.detectChanges();
      return;
    }

    // VALID IMAGE
    this.AddOrUpdateCustomerForm.patchValue({
      profileImage: file,
    });

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string; // image replaces icon

      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  //for validation
  hasError(controlName: string, errorName?: string): boolean {
    const control = this.AddOrUpdateCustomerForm.get(controlName);

    if (!control || !(control.touched || control.dirty)) return false;

    return errorName ? !!control.errors?.[errorName] : control.invalid;
  }

  onReset(): void {
    // Reset reactive form (keep default isActive = true)
    this.AddOrUpdateCustomerForm.reset({
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
    //this.passwordStrength = '';
  }

  //for editor update at admin side
  onUpdate(customerId: any): void {
    // switch to edit mode
    this.isEditMode = true;

    // scroll to top smoothly
    document.getElementById('customerFormTop')?.scrollIntoView({
      behavior: 'smooth',
    });

    this.CService.getCustomerDataById(customerId).subscribe((res: any) => {
      if (res.statusCode === 200) {
        const cdata = res.result;

        //console.log(cdata);

        this.originalEmail = cdata.email;
        this.originalMobile = cdata.mobile;

        this.AddOrUpdateCustomerForm.patchValue({
          customerId: cdata.customerId,
          name: cdata.name,
          address: cdata.address,
          email: cdata.email,
          mobile: cdata.mobile,
          postcode: cdata.postCode,
          gender: cdata.gender[0].toUpperCase() + cdata.gender.slice(1).toLowerCase(),
          isActive: cdata.isActive,
        });

        this.imagePreview = cdata.profileImage
          ? `http://localhost:5084/images/${cdata.profileImage}`
          : null;
      }
    });
  }

  //back to add customer data
  onCancel(): void {
    this.isEditMode = false;

    this.originalEmail = '';
    this.originalMobile = '';

    this.emailExists = false;
    this.mobileExists = false;

    this.AddOrUpdateCustomerForm.reset({
      customerId: 0,
      isActive: false,
    });
  }

  //will check email or mobile already registred
  onKeyUpEmailMobile(): void {
    const email = this.AddOrUpdateCustomerForm.get('email')?.value;
    const mobile = this.AddOrUpdateCustomerForm.get('mobile')?.value;
    const customerId = this.AddOrUpdateCustomerForm.get('customerId')?.value || 0;

    // reset flags
    this.emailExists = false;
    this.mobileExists = false;

    // on edit mode skip check if value unchanged
    if (this.isEditMode) {
      if (email === this.originalEmail && mobile === this.originalMobile) {
        return; // same customer data → no error
      }
    }

    // basic guard
    if (!email && !mobile) return;

    this.CService.checkEmailMobile(email, mobile, customerId).subscribe((res) => {
      this.emailExists = res.emailExists;
      this.mobileExists = res.mobileExists;
    });
  }
}
