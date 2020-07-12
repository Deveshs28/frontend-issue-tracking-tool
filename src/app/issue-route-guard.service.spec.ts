import { TestBed } from '@angular/core/testing';

import { IssueRouteGuardService } from './issue-route-guard.service';

describe('IssueRouteGuardService', () => {
  let service: IssueRouteGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssueRouteGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
