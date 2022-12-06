import { BreakdownTaskInputComponent } from './breakdown-task-input.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('BreakdownTaskInputComponent', () => {
  let component: BreakdownTaskInputComponent;
  let fixture: ComponentFixture<BreakdownTaskInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BreakdownTaskInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BreakdownTaskInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
