import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IssueApiService } from '../issue-api.service';
import { Location } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { SocketService } from '../socket.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css'],
})
export class IssueDetailComponent implements OnInit {
  public issueTitle: string;
  public issueDescription: string;
  public issueState: string;
  public issueAssigned: string;
  public loading = false;
  public issueId: string;
  public comment: string;
  public alreadyWatchingIssue = false;
  public commentsList = [];
  public watcherListUsers = [];
  public showDeleteButton = false;
  public issueDetailObj;

  editorConfig: AngularEditorConfig = {
    editable: false,
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
    private cookieService: CookieService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.issueId = this._route.snapshot.paramMap.get('issueId');
    this.fetchIssueDetail();
    this.issueUpdated();
    this.issueDeleted();
    this.newCommentAdded();
  }

  public editIssue() {
    this.router.navigate(['/edit', this.issueId]);
  }

  deleteIssue() {
    this.loading = true;
    this.apiService.deleteIssue(this.issueId).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          const data = {
            title: this.issueDetailObj.title,
            watcherList: this.issueDetailObj.watcherList,
            issueId: this.issueDetailObj.issueId,
          };
          this.socketService.issueDeleteSuccess(data);
          // this.toastr.success(apiResponse.message);
          // this.location.back();
          this.router.navigate(['/home']);
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
          this.issueAssigned = apiResponse.data.issue.assignedUserName;
          let loggedInUserId = this.cookieService.get('userId');
          if (apiResponse.data.issue.createdById === loggedInUserId) {
            this.showDeleteButton = true;
          } else if (apiResponse.data.issue.assignedUserId === loggedInUserId) {
            this.showDeleteButton = true;
          } else {
            this.showDeleteButton = false;
          }

          if (apiResponse.data.issue.watcherList.length > 0) {
            if (
              apiResponse.data.issue.watcherList.includes(
                this.cookieService.get('userId')
              )
            ) {
              this.alreadyWatchingIssue = true;
            } else {
              this.alreadyWatchingIssue = false;
            }
          } else {
            this.alreadyWatchingIssue = false;
          }

          if (apiResponse.data.comments > 0) {
            if (this.commentsList.length > 0) {
              this.commentsList.splice(0, this.commentsList.length);
            }
          }

          this.commentsList = apiResponse.data.comments;

          console.log(
            'apiResponse.data.issue.watcherListUsers',
            apiResponse.data.issue.watcherListUsers
          );
          if (apiResponse.data.issue.watcherListUsers > 0) {
            if (this.watcherListUsers.length > 0) {
              this.watcherListUsers.splice(0, this.watcherListUsers.length);
            }
          }
          console.log('this.watcherListUsers', this.watcherListUsers);
          this.watcherListUsers = apiResponse.data.issue.watcherListUsers;
          console.log('this.watcherListUsers1', this.watcherListUsers);
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

  addComment() {
    if (!this.comment) {
      this.toastr.warning('Enter Comment');
    } else {
      const userObj = this.apiService.getUserInfoFromLocalStorage();
      const data = {
        comment: this.comment,
        createdByName: `${userObj.firstName} ${userObj.lastName}`,
        createdById: `${userObj.userId}`,
      };
      this.loading = true;
      this.apiService.addComment(this.issueId, data).subscribe(
        (apiResponse) => {
          this.loading = false;
          if (apiResponse.status === 200) {
            this.socketService.commentAddedSuccess(this.issueId);
            this.toastr.success(apiResponse.message);
            this.fetchIssueDetail();
            this.comment = '';
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

  removeWatcher() {
    this.loading = true;
    this.apiService.removeWatcher(this.issueId).subscribe(
      (apiResponse) => {
        this.loading = false;
        if (apiResponse.status === 200) {
          this.toastr.success(apiResponse.message);
          this.fetchIssueDetail();
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

  addWatcher() {
    this.loading = true;
    this.apiService.addWatcher(this.issueId).subscribe(
      (apiResponse) => {
        this.loading = false;
        if (apiResponse.status === 200) {
          this.toastr.success(apiResponse.message);
          this.fetchIssueDetail();
        } else if (apiResponse.status === 401) {
          this.router.navigate([
            '/serverError',
            `${apiResponse.status}`,
            `${apiResponse.error.message}`,
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
        this.toastr.info(`This Issue Updated By: ${data.updatedBy}`);
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

  newCommentAdded() {
    this.socketService.newCommentAdded().subscribe((data) => {
      if (data.issueId === this.issueId) {
        this.toastr.info('New comment added on this issue');
        this.fetchIssueDetail();
      }
    });
  }

  issueDeleted() {
    this.socketService.singleIssueDeleted().subscribe((data) => {
      if (data.issueId === this.issueId) {
        console.log('issue updated on system: ', data);
        this.toastr.info('Issue Deleted');
        // this.location.back();
        this.router.navigate(['/home']);
      }
    });
  }
}
