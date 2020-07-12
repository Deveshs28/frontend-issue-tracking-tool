import { Injectable } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';
import { SocialAuthService } from 'angularx-social-login';

import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class IssueApiService {
  private url = 'https://api.epril-dev.co.in/api/v1/issueTrackingTool';
  // private url = 'http://localhost:3000/api/v1/issueTrackingTool';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private socketService: SocketService,
    private authService: SocialAuthService
  ) {}

  public register(data): Observable<any> {
    return this.http
      .post(`${this.url}/signup`, data)
      .pipe(catchError(this.handleError));
  }

  public loginUser(emailId, password): Observable<any> {
    const params = { email: emailId, password: password };
    return this.http
      .post(`${this.url}/login`, params)
      .pipe(catchError(this.handleError));
  }

  public socialLogin(emailId, firstName, lastName): Observable<any> {
    const params = { email: emailId, firstName: firstName, lastName: lastName };
    return this.http
      .post(`${this.url}/socialLogin`, params)
      .pipe(catchError(this.handleError));
  }

  public logoutUser(): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let userId = this.cookieService.get('userId');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };

    return this.http
      .post(`${this.url}/logout/${userId}`, null, options)
      .pipe(catchError(this.handleError));
  }

  public userList(): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    let userId = this.cookieService.get('userId');
    return this.http
      .get(`${this.url}/user/list`, options)
      .pipe(catchError(this.handleError));
  }

  public issueCreate(data): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .post(`${this.url}/issue/create`, data, options)
      .pipe(catchError(this.handleError));
  }

  public issueListAll(page, recordCount): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .get(`${this.url}/issue/all/${page}/${recordCount}`, options)
      .pipe(catchError(this.handleError));
  }

  public userIssueList(page, recordCount): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let userId = this.cookieService.get('userId');
    let options = { headers: headers };
    return this.http
      .get(
        `${this.url}/issue/userIssueList/${userId}/${page}/${recordCount}`,
        options
      )
      .pipe(catchError(this.handleError));
  }

  public issueDetail(issueId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .get(`${this.url}/issue/view/${issueId}`, options)
      .pipe(catchError(this.handleError));
  }

  public issueSearch(page, recordCount, queryTxt): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    var data = {
      query: queryTxt,
    };
    console.log('data', data);
    return this.http
      .post(`${this.url}/issue/search/${page}/${recordCount}`, data, options)
      .pipe(catchError(this.handleError));
  }

  public editIssue(issueId, data): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .put(`${this.url}/issue/edit/${issueId}`, data, options)
      .pipe(catchError(this.handleError));
  }

  public deleteIssue(issueId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .post(`${this.url}/issue/delete/${issueId}`, null, options)
      .pipe(catchError(this.handleError));
  }

  public addComment(issueId, data): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .post(`${this.url}/issue/addComment/${issueId}`, data, options)
      .pipe(catchError(this.handleError));
  }

  public addWatcher(issueId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    let userId = this.cookieService.get('userId');
    const userObj = this.getUserInfoFromLocalStorage();
    const data = {
      username: `${userObj.firstName} ${userObj.lastName}`,
    };
    return this.http
      .put(`${this.url}/issue/addWatcher/${issueId}/${userId}`, data, options)
      .pipe(catchError(this.handleError));
  }

  public removeWatcher(issueId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    let userId = this.cookieService.get('userId');
    const userObj = this.getUserInfoFromLocalStorage();
    const data = {
      username: `${userObj.firstName} ${userObj.lastName}`,
    };
    return this.http
      .put(
        `${this.url}/issue/removeWatcher/${issueId}/${userId}`,
        data,
        options
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError(error);
  }

  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  public getUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  };

  public removeUserInfoFromLocalStorage = () => {
    localStorage.removeItem('userInfo');
  };

  public clearLoginData() {
    const data = {
      userId: this.cookieService.get('userId'),
    };
    this.socketService.disconnectedSocket(data);
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
        this.removeUserInfoFromLocalStorage();
      }
    }
  }

  removeSocialCookies() {
    console.log('clearing cookies');
    if (this.cookieService.check('userType'))
      this.cookieService.delete('userType', '/');
    if (this.cookieService.check('G_AUTHUSER_H'))
      this.cookieService.delete('G_AUTHUSER_H', '/');
    this.removeUserInfoFromLocalStorage();
  }
}
