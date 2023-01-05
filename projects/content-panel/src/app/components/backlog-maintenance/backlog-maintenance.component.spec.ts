import { BacklogMaintenanceComponent } from './backlog-maintenance.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('SortBacklogIssueComponent', () => {
  let component: BacklogMaintenanceComponent;
  let fixture: ComponentFixture<BacklogMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BacklogMaintenanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BacklogMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
