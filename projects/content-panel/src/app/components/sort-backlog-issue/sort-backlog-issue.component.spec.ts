import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortBacklogIssueComponent } from './sort-backlog-issue.component';

describe('SortBacklogIssueComponent', () => {
  let component: SortBacklogIssueComponent;
  let fixture: ComponentFixture<SortBacklogIssueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SortBacklogIssueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortBacklogIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
