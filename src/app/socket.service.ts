import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private url = 'https://api.epril-dev.co.in';
  // private url = 'http://localhost:3000';

  private socket;

  constructor(public http: HttpClient) {
    this.socket = io(this.url);
  }

  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data);
      });
    });
  };

  public disconnectedSocket = (data) => {
    this.socket.emit('disconnect', data);
  };

  public userCreated = () => {
    const data = {
      message: 'New user added on system',
    };
    this.socket.emit('user-created', data);
  };

  public singleIssueEdited = () => {
    return Observable.create((observer) => {
      this.socket.on('single-issue-update', (data) => {
        console.log('single-issue-update');
        observer.next(data);
      });
    });
  };

  public singleIssueDeleted = () => {
    return Observable.create((observer) => {
      this.socket.on('single-issue-deleted', (data) => {
        console.log('single-issue-deleted');
        observer.next(data);
      });
    });
  };

  public newUserAddedOnSystem = () => {
    return Observable.create((observer) => {
      this.socket.on('new-user-registered', (data) => {
        console.log('new-user-registered');
        observer.next(data);
      });
    });
  };

  public issueCreate = (data) => {
    // const data = {
    //   title: data.title,
    //   watcherList: data.watcherList,
    //   assignedBy: data.createdBy,
    // issueId
    // };
    this.socket.emit('issue-created-success', data);
  };

  public issueAddedOnSystem = () => {
    return Observable.create((observer) => {
      this.socket.on('new-issue-created', (info) => {
        console.log('new-issue-created : ', info);
        observer.next(info);
      });
    });
  };

  public issueAssigned = () => {
    return Observable.create((observer) => {
      this.socket.on('issue-assgined', (info) => {
        console.log('issue-assgined : ', info);
        observer.next(info);
      });
    });
  };

  public issueEditSuccess = (data) => {
    // const data = {
    //   title: data.title,
    //   updatedBy: data.updatedBy,
    //   issueId
    // }
    this.socket.emit('issue-edit-success', data);
  };

  public issueUpdatedOnSystem = () => {
    return Observable.create((observer) => {
      this.socket.on('issue-update-on-system', (data) => {
        observer.next(data);
      });
    });
  };

  public assignedIssueUpdated = () => {
    return Observable.create((observer) => {
      this.socket.on('assign-issue-updated', (info) => {
        console.log('assign-issue-updated : ', info);
        observer.next(info);
      });
    });
  };

  public commentAddedSuccess = (issue) => {
    const data = {
      issueId: issue,
    };
    this.socket.emit('comment-added-success', data);
  };

  public newCommentAdded = () => {
    return Observable.create((observer) => {
      this.socket.on('new-comment-added', (info) => {
        observer.next(info);
      });
    });
  };

  public issueDeleteSuccess = (data) => {
    // const data = {
    //   title: data.title,
    //   watcherList
    //   issueId
    // }
    this.socket.emit('issue-delete-success', data);
  };

  public issueDeletedFromSystem = () => {
    return Observable.create((observer) => {
      this.socket.on('issue-deleted-from-system', (data) => {
        observer.next(data);
      });
    });
  };

  public assignedIssueDeleted = () => {
    return Observable.create((observer) => {
      this.socket.on('assign-issue-deleted', (info) => {
        console.log('assign-issue-deleted : ', info);
        observer.next(info);
      });
    });
  };

  public setUser = (authToken) => {
    this.socket.emit('set-user', authToken);
  };
}
