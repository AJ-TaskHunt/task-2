import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/guard/auth';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  userName: string | null = null;

  constructor(
    private router: Router,
    private authState: Auth
  ) {}

  ngOnInit(): void {

    // Load initial value from sessionStorage
    const user = sessionStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.authState.setUserName(userData.name);
    }

    // Listen for updates
    this.authState.userName$.subscribe(name => {
      this.userName = name;
    });
  }

  logout(): void {
    sessionStorage.clear();
    this.authState.clearUser();
    this.router.navigate(['/login']);
  }
}
