import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueApiService } from '../issue-api.service';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-issue-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.css'],
})
export class IssueListComponent implements OnInit {
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
    this.issueAssigned();
    this.assignedIssueEdited();
    this.assignedIssueDeleted();
  }

  showPageData(pageNumber) {
    this.loading = true;
    this.page = pageNumber + 1;
    this.issueApi.userIssueList(this.page, this.pageSize).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          if (apiResponse.data.issueList.length > 0) {
            this.issues.splice(0, this.issues.length);
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
        console.log('err.status1', err.status);
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

  issueAssigned() {
    // {
    //   issueId: data.issueId,
    //   title: data.title,
    //   assignedBy: data.createdBy,
    // };
    this.socketService.issueAssigned().subscribe((data) => {
      console.log('new issue assigned: ', data);
      this.toastr
        .info(`${data.assignedBy} assigned you a issue : ${data.title}`)
        .onTap.subscribe(() => this.toasterClickedHandler(data.issueId));
      this.page = 0;
      this.showPageData(this.page);
    });
  }

  assignedIssueEdited() {
    // {
    //   issueId: data.issueId,
    //   title: data.title,
    //   updatedBy: data.updatedBy,
    // }
    this.socketService.assignedIssueUpdated().subscribe((data) => {
      this.toastr
        .info(`Assigned Issue Updated By: ${data.updatedBy}`)
        .onTap.subscribe(() => this.toasterClickedHandler(data.issueId));
      console.log('assigned issue edited: ', data);
      this.page = 0;
      this.showPageData(this.page);
    });
  }

  toasterClickedHandler(issueId) {
    this.issueDetail(issueId);
  }

  assignedIssueDeleted() {
    this.socketService.assignedIssueDeleted().subscribe((data) => {
      console.log('assigne issue deleted: ', data);
      this.toastr.info('Assigned Issue Deleted');
      this.page = 0;
      this.showPageData(this.page);
    });
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
