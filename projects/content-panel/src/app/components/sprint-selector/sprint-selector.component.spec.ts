import { SprintSelectorComponent } from './sprint-selector.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('SprintSelectorComponent', () => {
  let component: SprintSelectorComponent;
  let fixture: ComponentFixture<SprintSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SprintSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SprintSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
