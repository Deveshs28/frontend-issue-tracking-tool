import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueApiService } from '../issue-api.service';
import { pairs } from 'rxjs';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-all-issues',
  templateUrl: './all-issues.component.html',
  styleUrls: ['./all-issues.component.css'],
})
export class AllIssuesComponent implements OnInit {
  public issues = [];
  public page = 0;
  public pageSize = 10;
  public loading = false;
  public totalIssueCount = 0;
  public pageCount = 0;
  public sortColumn = 'title';
  public sortType = 'asc';
  public sortAsc = true;

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private issueApi: IssueApiService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.showPageData(this.page);
    this.newIssuedAddedOnSystem();
    this.issueDeletedFromSystem();
    this.issueUpdatedOnSystem();
  }

  showPageData(pageNumber) {
    this.loading = true;
    this.page = pageNumber + 1;
    this.issueApi.issueListAll(this.page, this.pageSize).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          if (apiResponse.data.issueList.length > 0) {
            if (this.issues.length > 0) {
              this.issues.splice(0, this.issues.length);
            }
            this.issues = apiResponse.data.issueList;
            this.totalIssueCount = apiResponse.data.count;
            this.pageCount = Math.ceil(this.totalIssueCount / this.pageSize);
          } else {
            this.toastr.error(apiResponse.message);
          }
        } else if (apiResponse.status === 204) {
          this.page = this.page - 1;
          this.issues = [];
          this.toastr.error(apiResponse.message);
        } else if (apiResponse.status === 401) {
          this.router.navigate([
            '/serverError',
            `${apiResponse.status}`,
            `${apiResponse.message}`,
          ]);
          this.issueApi.clearLoginData();
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
          this.issueApi.clearLoginData();
        } else {
          this.toastr.error(err.error.message);
        }
      }
    );
  }

  issueDetail(issueId) {
    this.router.navigate(['/detail', issueId]);
  }

  newIssuedAddedOnSystem() {
    this.socketService.issueAddedOnSystem().subscribe((data) => {
      // {
      //   issueId: data.issueId,
      //   title: data.title,
      //   watcherList: data.watcherList,
      // }
      this.toastr
        .info('New Issue Added On System')
        .onTap.subscribe(() => this.toasterClickedHandler(data.issueId));
      console.log('issue added on system: ', data);
      this.page = 0;
      this.sortColumn = 'title';
      this.sortType = 'asc';
      this.sortAsc = true;
      this.showPageData(this.page);
    });
  }

  issueDeletedFromSystem() {
    this.socketService.issueDeletedFromSystem().subscribe((data) => {
      this.toastr.info('Issue Deleted From System');
      console.log('issue deleted from system: ', data);
      this.page = 0;
      this.sortColumn = 'title';
      this.sortType = 'asc';
      this.sortAsc = true;
      this.showPageData(this.page);
    });
  }

  issueUpdatedOnSystem() {
    // {
    //   issueId: data.issueId,
    //   title: data.title,
    //   updatedBy: data.updatedBy,
    // };
    this.socketService.issueUpdatedOnSystem().subscribe((data) => {
      console.log('issue updated on system: ', data);
      this.toastr
        .info(`An Issue Update by: ${data.updatedBy}`)
        .onTap.subscribe(() => this.toasterClickedHandler(data.issueId));
      this.page = 0;
      this.sortColumn = 'title';
      this.sortType = 'asc';
      this.sortAsc = true;
      this.showPageData(this.page);
    });
  }

  toasterClickedHandler(issueId) {
    this.issueDetail(issueId);
  }

  public sortTable(column) {
    if (column === 'title') {
      this.sortColumn = 'title';
      if (this.sortAsc) {
        this.sortAsc = false;
        this.sortType = 'asc';
      } else {
        this.sortAsc = true;
        this.sortType = 'desc';
      }
    } else if (column === 'state') {
      this.sortColumn = 'issueState';
      if (this.sortAsc) {
        this.sortAsc = false;
        this.sortType = 'asc';
      } else {
        this.sortAsc = true;
        this.sortType = 'desc';
      }
    } else if (column === 'assignee') {
      this.sortColumn = 'assignedUserName';
      if (this.sortAsc) {
        this.sortAsc = false;
        this.sortType = 'asc';
      } else {
        this.sortAsc = true;
        this.sortType = 'desc';
      }
    } else if (column === 'reportor') {
      this.sortColumn = 'createdByName';
      if (this.sortAsc) {
        this.sortAsc = false;
        this.sortType = 'asc';
      } else {
        this.sortAsc = true;
        this.sortType = 'desc';
      }
    } else if (column === 'createdDate') {
      this.sortColumn = 'createdOn';
      if (this.sortAsc) {
        this.sortAsc = false;
        this.sortType = 'asc';
      } else {
        this.sortAsc = true;
        this.sortType = 'desc';
      }
    }
  }
}
