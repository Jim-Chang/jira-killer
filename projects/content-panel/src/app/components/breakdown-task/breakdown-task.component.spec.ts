import { BreakdownTaskComponent } from './breakdown-task.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('CreateBreackdownTaskComponent', () => {
  let component: BreakdownTaskComponent;
  let fixture: ComponentFixture<BreakdownTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BreakdownTaskComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BreakdownTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
