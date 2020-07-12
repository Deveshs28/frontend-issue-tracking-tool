import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { IssueApiService } from '../issue-api.service';
import { SocketService } from '../socket.service';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public emailId: string;
  public password: string;
  public loading = false;
  public emailPattern = '[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}';
  user: SocialUser;
  loggedIn: boolean;

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private apiService: IssueApiService,
    private socketService: SocketService,
    private authService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      //       authToken: "ya29.a0AfH6SMACNxVOqLL3APrIVZwJix5vGwBXJ3vIoV6zFZwBn7oBm6RpV8uVM9nxZCwLYJdAmsT2FVBHy5dBkp5gxac1bjDKpUn116Cj90Q9Q50Lfgmsd_iTAoJrjmPazLofB6YS2bkSc_Tg1FaGiX4wLoApT_2uNP3MiNg"
      // email: "dshar.0428@gmail.com"
      // firstName: "Devesh"
      // id: "109560310926317904697"
      // idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE0MWEzNTcwYjhlM2FlMWI3MmNhYWJjYWE3YjhkMmRiMjA2NWQ3YzEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNzU1MDgzNzAxNTExLXUxNGc3MzI4MnJ2ZDlqcHVhbnZlZG1vMmdmMW5nZmFjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNzU1MDgzNzAxNTExLXUxNGc3MzI4MnJ2ZDlqcHVhbnZlZG1vMmdmMW5nZmFjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA5NTYwMzEwOTI2MzE3OTA0Njk3IiwiZW1haWwiOiJkc2hhci4wNDI4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiT1R0WG9GeXNlejI5RGZBY1lJQ090dyIsIm5hbWUiOiJEZXZlc2ggU2hhcm1hIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tcnB3YTFrZEV3M00vQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVja092ZHdwb0JlbVB3UzdoZlFDdHZvdTFLMzdiZy9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiRGV2ZXNoIiwiZmFtaWx5X25hbWUiOiJTaGFybWEiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTU5Mzk1MDc2MiwiZXhwIjoxNTkzOTU0MzYyLCJqdGkiOiIzOGE3NGI0MTdiMGJjZjlmODczOTk4YWY1MjE2MjBmNjFkNDM0Y2U0In0.DWaOacY8wk5w1rJvgz00TnNyn-QjiZUz5G_TAe2jPUKaGIrQ8rTtxch0fe4prIKE1xRKSUmZC_DVOHaxxkwMnIxtJIeX3eKbGQqC2uy2OSBUofIwAuExGVOtEyLuVKTKqvuiTjAAIPuxRilghI7K70xvHqFUxI0kt5kl4seuVf1jrpWxju1Ny2VQ3pZohN3n4ByhgRRIALJ8G0w3p5FjGX30bq8Adz5NvLqoX77stdwziYwo-Kf144c3Gv5xLGoXjGdoyhIjbDaPKG9H6Ig3tM-lS7yp0mwPt8v5ghq9_5qm5SK9kTmdz3f-s5OPEfyAlR-xFXicM5V7RuHOwuUjJQ"
      // lastName: "Sharma"
      // name: "Devesh Sharma"
      // photoUrl: "https://lh3.googleusercontent.com/-rpwa1kdEw3M/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckOvdwpoBemPwS7hfQCtvou1K37bg/s96-c/photo.jpg"
      // provider: "GOOGLE"
      console.log('user:', user);
      this.user = user;
      this.loggedIn = user != null;
      console.log('this.loggedIn', this.loggedIn);
      if (this.loggedIn) {
        this.socialLogin(
          this.user.email,
          this.user.firstName,
          this.user.lastName
        );
      }
    });
  }

  public loginUser = () => {
    if (!this.emailId) {
      this.toastr.warning('Enter email');
    } else if (!this.password) {
      this.toastr.warning('Enter password');
    } else {
      this.loading = true;
      this.apiService.loginUser(this.emailId, this.password).subscribe(
        (apiResponse) => {
          this.loading = false;
          console.log('resp: ', apiResponse);
          if (apiResponse.status === 200) {
            this.socketService.setUser(apiResponse.data.authToken);
            this.toastr.success('Login Successfull');
            let authToken = apiResponse.data.authToken;
            let userObj = apiResponse.data.userDetails;
            this.cookieService.set('authToken', authToken);
            this.cookieService.set('userId', userObj.userId);
            this.cookieService.set('userType', userObj.userType);
            this.apiService.setUserInfoInLocalStorage(userObj);
            this.router.navigate(['/home']);
          } else {
            this.toastr.error('Error while login');
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
          } else {
            this.toastr.error(err.error.message);
          }
        }
      );
    }
  };

  public socialLogin = (email, firstName, lastName) => {
    this.loading = true;
    this.apiService.socialLogin(email, firstName, lastName).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log('resp: ', apiResponse);
        if (apiResponse.status === 200) {
          if (apiResponse.data.userDetails.loginType === 'firstLogin') {
            this.socketService.userCreated();
          }
          this.cookieService.set(
            'userType',
            apiResponse.data.userDetails.userType
          );
          this.socketService.setUser(apiResponse.data.authToken);
          this.toastr.success('Login Successfull');
          let authToken = apiResponse.data.authToken;
          let userObj = apiResponse.data.userDetails;
          this.cookieService.set('authToken', authToken);
          this.cookieService.set('userId', userObj.userId);
          this.apiService.setUserInfoInLocalStorage(userObj);
          this.router.navigate(['/home']);
        } else if (apiResponse.status === 302) {
          this.toastr.error(apiResponse.message);
        } else {
          this.toastr.error('Error while login');
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
        } else {
          this.toastr.error(err.error.message);
        }
      }
    );
  };

  signInWithGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
}
