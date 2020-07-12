import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IssueApiService } from '../issue-api.service';
import { Location } from '@angular/common';
import { user } from '../users';
import { SocketService } from '../socket.service';
import { CookieService } from 'ngx-cookie-service';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-issue-edit',
  templateUrl: './issue-edit.component.html',
  styleUrls: ['./issue-edit.component.css'],
})
export class IssueEditComponent implements OnInit {
  public issueTitle: string;
  public issueDescription: string;
  public issueState: string;
  public assignedUser: string;
  public loading = false;
  public issueId: string;

  public updatedIssueState: string = '';
  public selectedUserId = '';
  public issueTypeArr = ['BACKLOG', 'IN-PROGRESS', 'IN-Test', 'DONE'];
  public allUserList = [];
  public issueDetailObj;

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
    private apiService: IssueApiService,
    private location: Location,
    private socketService: SocketService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.issueId = this._route.snapshot.paramMap.get('issueId');
    this.fetchIssueDetail();
    this.fetchUserList();
    this.issueUpdated();
    this.issueDeleted();
  }

  updateDetails() {
    if (!this.issueTitle) {
      this.toastr.warning('Enter Issue Title');
    } else {
      var data = {
        title: this.issueTitle,
        description: this.issueDescription || '',
      };

      if (this.updatedIssueState) {
        data['issueState'] = this.updatedIssueState;
      }

      if (this.selectedUserId) {
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
        if (!this.issueDetailObj.watcherList.includes(selectedUser.userId)) {
          var newWatcherList = this.issueDetailObj.watcherList;
          newWatcherList.push(selectedUser.userId);
          data['watcherList'] = newWatcherList;

          var watcherListUsers = this.issueDetailObj.watcherListUsers;
          watcherListUsers.push(
            `${selectedUser.firstName} ${selectedUser.lastName}`
          );
          data['watcherListUsers'] = watcherListUsers;
        }
      }

      console.log('d:', data);

      this.apiService.editIssue(this.issueId, data).subscribe(
        (apiResponse) => {
          this.loading = false;
          this.issueDetailObj = apiResponse.data;
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            const data = {
              title: this.issueDetailObj.title,
              watcherList: this.issueDetailObj.watcherList,
              issueId: this.issueDetailObj.issueId,
              updatedBy: this.cookieService.get('userId'),
            };
            this.socketService.issueEditSuccess(data);
            // this.toastr.success(apiResponse.message);
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

  fetchIssueDetail() {
    this.loading = true;
    this.apiService.issueDetail(this.issueId).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.issueDetailObj = apiResponse.data.issue;
          this.issueTitle = apiResponse.data.issue.title;
          this.issueDescription = apiResponse.data.issue.description;
          this.issueState = apiResponse.data.issue.issueState;
          this.assignedUser = apiResponse.data.issue.assignedUserName;
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

  fetchUserList() {
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

  issueUpdated() {
    this.socketService.singleIssueEdited().subscribe((data) => {
      if (data.issueId === this.issueId) {
        console.log('issue updated on system: ', data);
        this.toastr.info('This Issue Updated');
        this.fetchIssueDetail();
      } else {
        this.toastr
          .info(`Issue Updated By: ${data.updatedBy}`)
          .onTap.subscribe(() =>
            this.router.navigate(['/detail', data.issueId])
          );
      }
    });
  }

  issueDeleted() {
    this.socketService.singleIssueDeleted().subscribe((data) => {
      if (data.issueId === this.issueId) {
        console.log('issue updated on system: ', data);
        this.toastr.info('This Issue Deleted');
        this.location.back();
      }
    });
  }
}
