import { BacklogSortComponent } from './backlog-sort.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('SortBacklogIssueComponent', () => {
  let component: BacklogSortComponent;
  let fixture: ComponentFixture<BacklogSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BacklogSortComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BacklogSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
