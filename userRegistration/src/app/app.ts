import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  //protected readonly title = signal('userRegistration');

  title = signal('userRegistration');

  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const route = this.router.routerState.root.firstChild;
      const pageTitle = route?.snapshot.data['title'];
      this.title.set(pageTitle ?? 'userRegistration');
    });
  }
}
