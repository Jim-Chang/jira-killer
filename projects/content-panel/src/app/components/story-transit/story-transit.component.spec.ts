import { StoryTransitComponent } from './story-transit.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('StoryBoardComponent', () => {
  let component: StoryTransitComponent;
  let fixture: ComponentFixture<StoryTransitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StoryTransitComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StoryTransitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
