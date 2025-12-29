import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,map } from 'rxjs';
import { Customer } from '../../shared/models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  apiUrl = 'http://localhost:5084/api/';

  constructor(private httpclient: HttpClient) {}

  //service for add customer data
  addCustomerData(CustomerData: FormData): Observable<any> {
    return this.httpclient.post(this.apiUrl + 'addUpdateCustomerData', CustomerData);
  }

  //login service
  onLogin(userData: any): Observable<any> {
    return this.httpclient.post(this.apiUrl + 'login', userData, { withCredentials: true });
  }


  //get all the customer data
  // getAllCustomers(): Observable<any>{
  //   return this.httpclient.get(this.apiUrl + 'getAllCustomerData');
  // }
  getAllCustomers(): Observable<Customer[]> {
  return this.httpclient
    .get<any>(this.apiUrl + 'getAllCustomerData')
    .pipe(
      map(res => res.result ?? []));
}

  getCustomerDataById(id: any): Observable<any> {
    return this.httpclient.get<any>(this.apiUrl + 'getCustomerDataById?id=' + id);
  }

  MyProfileData() {
    return this.httpclient.get<any>(this.apiUrl + 'myProfile', { withCredentials: true });
  }

  updateMyProfile(userData: any): Observable<any> {
    return this.httpclient.post(this.apiUrl + 'updateMyProfile', userData, {
      withCredentials: true,
    });
  }

  //for mobile and email validation
  checkEmailMobile(email: string, mobile: string, customerId: number) {
  return this.httpclient.get<any>(
    `${this.apiUrl}check-email-mobile?email=${email}&mobile=${mobile}&customerId=${customerId}`
  );
}

  deleteCusomerData(id : any) : Observable<any>{
    return this.httpclient.get(this.apiUrl+ 'deleteCustomerDataById?id='+ id );
  }

}
