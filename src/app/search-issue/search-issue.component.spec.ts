import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchIssueComponent } from './search-issue.component';

describe('SearchIssueComponent', () => {
  let component: SearchIssueComponent;
  let fixture: ComponentFixture<SearchIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
