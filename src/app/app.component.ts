import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  showDrawer = false;
  isAuth = false;
  private authListenerSubs: Subscription;
  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.autoAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuth => {
      this.isAuth = isAuth;
    });
    this.isAuth = this.authService.getIsAuth();
  }

  toggleDrawer(showDrawer) {
    this.showDrawer = showDrawer;
  }

  hideDrawer() {
    this.showDrawer = false;
  }

  onLogout() {
    this.authService.logout();
  }

}
