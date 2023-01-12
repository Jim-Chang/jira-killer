import { SubtaskListComponent } from './subtask-list.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('SubtaskListComponent', () => {
  let component: SubtaskListComponent;
  let fixture: ComponentFixture<SubtaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubtaskListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubtaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
