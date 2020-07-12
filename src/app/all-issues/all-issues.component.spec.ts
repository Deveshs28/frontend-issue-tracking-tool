import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllIssuesComponent } from './all-issues.component';

describe('AllIssuesComponent', () => {
  let component: AllIssuesComponent;
  let fixture: ComponentFixture<AllIssuesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllIssuesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
