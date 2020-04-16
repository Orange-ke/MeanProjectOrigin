import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy, OnChanges {

  @Output('toggleDrawer') toggleDrawer = new EventEmitter<any>();

  @Input() showDrawer: boolean;

  isAuth = false;
  isSmallScreen = false;
  toggleDrawerSign = false;
  private authListenerSubs: Subscription;
  constructor(private authService: AuthService, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
        'menu',
        sanitizer.bypassSecurityTrustResourceUrl('assets/menu-24px.svg'));
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnInit() {
    this.isAuth = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuth => {
      this.isAuth = isAuth;
    });
    if (window.screen.width < 600) {
      this.isSmallScreen = true;
    }
    this.toggleDrawerSign = this.showDrawer;
  }

  ngOnChanges() {
    this.toggleDrawerSign = this.showDrawer;
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

  toggleDrawerBtn() {
    this.toggleDrawerSign = !this.toggleDrawerSign;
    this.toggleDrawer.emit(this.toggleDrawerSign);
  }

}
