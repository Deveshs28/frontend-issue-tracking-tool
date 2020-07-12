import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IssueApiService } from '../issue-api.service';
import { SocketService } from '../socket.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  public firstName: string;
  public lastName: string;
  public emailId: string;
  public password: string;
  public loading = false;
  public emailPattern = '[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}';

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private apiService: IssueApiService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {}

  public registerUser = () => {
    if (!this.firstName) {
      this.toastr.warning('Enter first name');
    } else if (!this.lastName) {
      this.toastr.warning('Enter last name');
    } else if (!this.emailId) {
      this.toastr.warning('Enter email');
    } else if (!this.password) {
      this.toastr.warning('Enter password');
    } else {
      let data = {
        email: this.emailId,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
      };

      this.loading = true;
      this.apiService.register(data).subscribe(
        (apiResponse) => {
          this.loading = false;
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.socketService.userCreated();
            this.toastr.success('Registration Successful');
            this.router.navigate(['/login']);
          } else {
            this.toastr.error('Error while registration');
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
}
