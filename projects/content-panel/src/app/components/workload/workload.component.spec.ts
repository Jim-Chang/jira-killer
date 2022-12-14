import { WorkloadComponent } from './workload.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('WorkloadComponent', () => {
  let component: WorkloadComponent;
  let fixture: ComponentFixture<WorkloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkloadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
