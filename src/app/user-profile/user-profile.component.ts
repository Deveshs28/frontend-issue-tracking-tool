import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { IssueApiService } from '../issue-api.service';
import { SocketService } from '../socket.service';
import { SocialAuthService } from 'angularx-social-login';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  public userInfo;
  public loading = false;
  constructor(
    private toasterServie: ToastrService,
    private _route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService,
    private apiService: IssueApiService,
    private socketService: SocketService,
    private authService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.apiService.getUserInfoFromLocalStorage();
  }

  logout() {
    this.loading = true;
    this.apiService.logoutUser().subscribe(
      (response) => {
        this.loading = false;
        if (response.status === 200) {
          const data = {
            userId: this.cookieService.get('userId'),
          };
          this.socketService.disconnectedSocket(data);
          this.toasterServie.success(response.message);
          if (this.cookieService.check('authToken'))
            this.cookieService.delete('authToken', '/');
          if (this.cookieService.check('userId'))
            this.cookieService.delete('userId', '/');

          if (this.cookieService.check('userType')) {
            let userType = this.cookieService.get('userType');
            if (userType === 'Social') {
              console.log('userType', userType);
              (async () => {
                let socialLogout = this.authService
                  .signOut(true)
                  .then(function () {
                    console.log('social signout');
                  })
                  .catch((err) => console.log(err));
                await socialLogout;
                this.removeSocialCookies();
              })();
            } else {
              if (this.cookieService.check('userType'))
                this.cookieService.delete('userType', '/');
              this.apiService.removeUserInfoFromLocalStorage();
              this.router.navigate(['/']);
            }
          }
        } else {
          this.toasterServie.error(response.message);
        }
      },
      (err) => {
        this.loading = false;
        if (err.status === 404 || err.status === 500) {
          this.router.navigate([
            '/serverError',
            `${err.status}`,
            `${err.error.message}`,
          ]);
        } else if (err.status === 401) {
          this.router.navigate([
            '/serverError',
            `${err.status}`,
            `${err.error.message}`,
          ]);
          this.apiService.clearLoginData();
        } else {
          this.toasterServie.error(err.error.message);
        }
      }
    );
  }

  removeSocialCookies() {
    console.log('clearing cookies');
    if (this.cookieService.check('userType'))
      this.cookieService.delete('userType', '/');
    if (this.cookieService.check('G_AUTHUSER_H'))
      this.cookieService.delete('G_AUTHUSER_H', '/');
    this.apiService.removeUserInfoFromLocalStorage();
    // this.socketService.exitSocket();
    this.router.navigate(['/']);
  }
}
