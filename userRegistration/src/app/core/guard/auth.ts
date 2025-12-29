import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  
  private userNameSource = new BehaviorSubject<string | null>(null);
  userName$ = this.userNameSource.asObservable();

  setUserName(name: string) {
    this.userNameSource.next(name);
  }

  clearUser() {
    this.userNameSource.next(null);
  }
}
