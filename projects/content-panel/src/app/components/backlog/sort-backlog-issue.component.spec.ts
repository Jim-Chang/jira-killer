import { BacklogComponent } from './backlog.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('SortBacklogIssueComponent', () => {
  let component: BacklogComponent;
  let fixture: ComponentFixture<BacklogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BacklogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BacklogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
