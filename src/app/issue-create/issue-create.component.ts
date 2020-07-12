import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { IssueApiService } from '../issue-api.service';
import { Location } from '@angular/common';
import { user } from '../users';
import { SocketService } from '../socket.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-issue-create',
  templateUrl: './issue-create.component.html',
  styleUrls: ['./issue-create.component.css'],
})
export class IssueCreateComponent implements OnInit {
  public issueTitle: string;
  public issueDescription = '';
  public issueState: string = '';
  public selectedUserId = '';
  public loading = false;
  public issueTypeArr = ['BACKLOG', 'IN-PROGRESS', 'IN-Test', 'DONE'];
  public allUserList: user[] = [];
  // public htmlContent = '';

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '10rem',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '5rem',
    translate: 'no',
    enableToolbar: true,
    showToolbar: true,
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    toolbarHiddenButtons: [[], ['insertImage', 'insertVideo']],
  };

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private apiService: IssueApiService,
    private location: Location,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.fetchAllUsers();
    this.newUserAddedOnSystem();
  }

  public createIssue() {
    if (!this.issueTitle) {
      this.toastr.warning('Enter Issue Title');
    } else if (!this.issueState) {
      this.toastr.warning('Select Issue State');
    } else {
      const userObj = this.apiService.getUserInfoFromLocalStorage();
      const data = {
        title: this.issueTitle,
        description: this.issueDescription || '',
        issueState: this.issueState,
        createdByName: `${userObj.firstName} ${userObj.lastName}`,
        createdById: this.cookieService.get('userId'),
      };

      if (this.selectedUserId) {
        console.log(this.selectedUserId);
        let selectedUser: user;
        for (let user of this.allUserList) {
          if (user.userId === this.selectedUserId) {
            selectedUser = user;
            break;
          }
        }
        data['assignedUserId'] = `${selectedUser.userId}`;
        data[
          'assignedUserName'
        ] = `${selectedUser.firstName} ${selectedUser.lastName}`;
      }

      this.apiService.issueCreate(data).subscribe(
        (apiResponse) => {
          this.loading = false;
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            const data = {
              issueId: apiResponse.data.issueId,
              title: apiResponse.data.title,
              watcherList: apiResponse.data.watcherList,
              createdBy: apiResponse.data.createdByName,
              assignedTo: apiResponse.data.assignedUserId,
            };
            this.socketService.issueCreate(data);
            this.toastr.success(apiResponse.message);
            this.location.back();
          } else if (apiResponse.status === 401) {
            this.router.navigate([
              '/serverError',
              `${apiResponse.status}`,
              `${apiResponse.message}`,
            ]);
            this.apiService.clearLoginData();
          } else {
            this.toastr.error(apiResponse.message);
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
            this.toastr.error(err.error.message);
          }
        }
      );
    }
  }

  fetchAllUsers() {
    this.loading = true;
    this.apiService.userList().subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          if (apiResponse.data.length > 0) {
            if (this.allUserList.length > 0) {
              this.allUserList.splice(0, this.allUserList.length);
            }
            this.allUserList = apiResponse.data;
          }
        } else if (apiResponse.status === 401) {
          this.router.navigate([
            '/serverError',
            `${apiResponse.status}`,
            `${apiResponse.message}`,
          ]);
          this.apiService.clearLoginData();
        } else {
          this.toastr.error(apiResponse.message);
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
          this.toastr.error(err.error.message);
        }
      }
    );
  }

  newUserAddedOnSystem() {
    this.socketService.newUserAddedOnSystem().subscribe((data) => {
      console.log('new user added on system: ', data);
      this.fetchAllUsers();
    });
  }
}
