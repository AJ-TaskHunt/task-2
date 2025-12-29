import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  // userName : string | null = null

  // constructor(private router: Router){

  //   const user = sessionStorage.getItem('user');

  //   if(user){
  //     const userData = JSON.parse(user);
  //     this.userName = userData.name;
  //   }
  // }
  
  // logout():void{
  //   sessionStorage.clear();
  //   this.router.navigate(['/login']);
  // }
}
