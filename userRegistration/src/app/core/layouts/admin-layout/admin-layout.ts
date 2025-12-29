import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Auth } from '../../guard/auth';



@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule,RouterLink],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {

  userName: string | null = null;

  
  
  constructor(
    private router: Router,
    private authState: Auth
  ) {

    const user = sessionStorage.getItem('admin');

    this.userName = user;
  }
  
  toggleSidebar(): void {
    document.body.classList.toggle('toggle-sidebar');
  }
  logout(): void {
    sessionStorage.clear();
    this.authState.clearUser();
    this.router.navigate(['/login']);
  }
}

